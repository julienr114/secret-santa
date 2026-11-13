// Zod validation of request input. `parse` throws on invalid data and h3
// turns that into a 400 with the issues attached.

export const validatedBody = (event, schema) =>
  readValidatedBody(event, (data) => schema.parse(data));

export const validatedQuery = (event, schema) =>
  getValidatedQuery(event, (data) => schema.parse(data));
