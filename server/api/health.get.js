import { sql } from 'drizzle-orm';
import { useDb } from '../database/client.js';

// Deployment check: confirms the Worker runs and the D1 binding answers.
export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const [{ tables }] = await db.all(
    sql`select count(*) as tables from sqlite_master where type = 'table'`,
  );
  return { ok: true, tables };
});
