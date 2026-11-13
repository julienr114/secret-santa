import { sql } from 'drizzle-orm';
import { useDb } from '#server/database/client';

// Deployment check: confirms the Worker runs and the D1 binding answers.
export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const [row] = await db.all<{ tables: number }>(
    sql`select count(*) as tables from sqlite_master where type = 'table'`,
  );
  return { ok: true, tables: row?.tables ?? 0 };
});
