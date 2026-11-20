import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../server/database/schema';
import type { Db } from '../server/database/client';

// A D1 database for tests, on node:sqlite: every migration applied,
// foreign keys on, and the few methods of D1 that Drizzle calls. The code
// under test gets the same Drizzle client as in the Worker.

const MIGRATIONS = join(__dirname, '..', 'server', 'database', 'migrations');

type Params = SQLInputValue[];

const statement = (sqlite: DatabaseSync, sql: string, params: Params) => {
  const rows = (arrays: boolean) => {
    const prepared = sqlite.prepare(sql);
    prepared.setReturnArrays(arrays);
    return prepared.all(...params);
  };
  return {
    sql,
    params,
    bind: (...next: Params) => statement(sqlite, sql, next),
    all: async () => ({ results: rows(false), success: true, meta: {} }),
    raw: async () => rows(true),
    first: async () => rows(false)[0] ?? null,
    run: async () => {
      const result = sqlite.prepare(sql).run(...params);
      return { results: [], success: true, meta: { changes: result.changes } };
    },
  };
};
type Statement = ReturnType<typeof statement>;

/**
 * A migrated database, its Drizzle client and the raw handle to look at
 * it.
 * @returns `db` for the code, `sqlite` for the test.
 */
export const testDb = (): { db: Db; sqlite: DatabaseSync } => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  readdirSync(MIGRATIONS)
    .filter((file) => file.endsWith('.sql'))
    .toSorted()
    .forEach((file) => {
      sqlite.exec('BEGIN');
      sqlite.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
      sqlite.exec('COMMIT');
    });
  const d1 = {
    prepare: (sql: string) => statement(sqlite, sql, []),
    batch: async (statements: Statement[]) => {
      sqlite.exec('BEGIN');
      const results = statements.map((one) => {
        const prepared = sqlite.prepare(one.sql);
        return /^\s*(select|with)/i.test(one.sql) ||
          /\breturning\b/i.test(one.sql)
          ? { results: prepared.all(...one.params), success: true, meta: {} }
          : {
              results: [],
              success: true,
              meta: { changes: prepared.run(...one.params).changes },
            };
      });
      sqlite.exec('COMMIT');
      return results;
    },
    exec: async (sql: string) => sqlite.exec(sql),
  };
  return {
    db: drizzle(d1 as unknown as Parameters<typeof drizzle>[0], { schema }),
    sqlite,
  };
};
