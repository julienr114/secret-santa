import { isForeignWrite } from '#server/utils/origin';

// Every request that changes something (Correction 23): refused when the
// browser says it was sent from another site. The application answers on
// the address the request came to, and on its public address.
export default defineEventHandler((event) => {
  const own = [
    getRequestURL(event).origin,
    String(useRuntimeConfig(event).public.baseUrl ?? ''),
  ];
  if (
    isForeignWrite(
      { method: event.method, origin: getRequestHeader(event, 'origin') },
      own,
    )
  ) {
    throw createError({ statusCode: 403, statusMessage: 'foreign_origin' });
  }
});
