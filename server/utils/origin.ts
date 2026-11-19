/** The methods that change something. */
const WRITES: readonly string[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Whether a request that changes something comes from another site
 * (Correction 23): the browser says where a request was sent from in its
 * `Origin` header, and a page of another site must not write here with
 * the session of whoever is looking at it. A request without that header
 * (a script, the tests, an old browser on the same site) passes: the
 * session cookie, `SameSite=Lax`, is not sent with it from elsewhere.
 * @param request - The method, and the `Origin` header if any.
 * @param request.method - The HTTP method.
 * @param request.origin - The `Origin` header, or nothing.
 * @param own - The origins the application answers on.
 * @returns True when the request must be refused.
 */
export const isForeignWrite = (
  request: { method: string; origin: string | null | undefined },
  own: readonly string[],
): boolean =>
  WRITES.includes(request.method.toUpperCase()) &&
  Boolean(request.origin) &&
  !own.includes(request.origin ?? '');
