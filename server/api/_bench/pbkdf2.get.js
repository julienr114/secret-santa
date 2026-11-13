// TEMPORARY (README step 1): one PBKDF2-SHA256 derivation per request so the
// CPU time can be read from Workers logs (`wrangler tail --format json`,
// field cpuTime). Clocks are frozen inside a Worker request, so timing in
// here would always read 0. Delete before step 8.
const MAX_ITERATIONS = 100_000;

export default defineEventHandler(async (event) => {
  const requested = Number(getQuery(event).iterations ?? 50_000);
  const iterations = Math.min(Math.max(1, requested || 1), MAX_ITERATIONS);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('123456pepper'),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256,
  );
  return { iterations, bytes: bits.byteLength };
});
