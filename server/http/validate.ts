import type { H3Event } from 'h3';
import type { z } from 'zod';

// Zod validation of request input. `parse` throws on invalid data and h3
// turns that into a 400 with the issues attached.

export const validatedBody = <S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> =>
  readValidatedBody(event, (data) => schema.parse(data));

export const validatedQuery = <S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> =>
  getValidatedQuery(event, (data) => schema.parse(data));
