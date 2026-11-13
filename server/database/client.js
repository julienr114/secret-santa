import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

/**
 * Drizzle client bound to the D1 database of the current request.
 * @param {import('h3').H3Event} event
 */
export const useDb = (event) => {
  const d1 = event.context.cloudflare?.env?.DB;
  if (!d1) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding "DB" is missing',
    });
  }
  return drizzle(d1, { schema });
};
