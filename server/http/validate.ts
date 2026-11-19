import type { H3Event } from 'h3';
import type { z } from 'zod';
import { WEB_ADDRESS_REFUSED } from '#server/utils/limits';

// Zod validation of request input: invalid data is a 400 « Validation
// Error » with the issues attached. A name refused because it carries a
// web address (lot 38 A) gets its own reason, so that the screen can say
// why.

const parse = <S extends z.ZodType>(schema: S, data: unknown): z.output<S> => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const webAddress = result.error.issues.some(
    (issue) => issue.message === WEB_ADDRESS_REFUSED,
  );
  throw createError({
    statusCode: 400,
    statusMessage: webAddress ? WEB_ADDRESS_REFUSED : 'Validation Error',
    data: result.error,
  });
};

export const validatedBody = async <S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> =>
  parse(schema, await readBody(event).catch(() => undefined));

export const validatedQuery = async <S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> => parse(schema, getQuery(event));
