import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { H3Event } from 'h3';
import * as schema from './schema';

export type Db = DrizzleD1Database<typeof schema>;
/** The D1 binding of the worker. */
export type D1Binding = Parameters<typeof drizzle>[0];

/** Drizzle client on a D1 binding, for a scheduled task. */
export const dbOf = (d1: D1Binding): Db => drizzle(d1, { schema });

/** Drizzle client bound to the D1 database of the current request. */
export const useDb = (event: H3Event): Db => {
  const d1 = event.context.cloudflare?.env?.DB;
  if (!d1) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding "DB" is missing',
    });
  }
  return drizzle(d1, { schema });
};
