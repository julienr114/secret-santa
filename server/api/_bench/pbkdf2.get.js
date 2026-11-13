// TEMPORARY (README step 1): measures PBKDF2-SHA256 on the deployed Worker to
// pick the default PBKDF2_ITERATIONS. Delete before step 8.
const ITERATIONS = [10_000, 25_000, 50_000, 100_000];
const ROUNDS = 3;

// Runs async tasks one after the other (parallel runs would skew timings).
const sequentially = (tasks) =>
  tasks.reduce(
    (acc, task) =>
      acc.then((done) => task().then((result) => [...done, result])),
    Promise.resolve([]),
  );

const deriveOnce = async (iterations, keyMaterial, salt) => {
  const start = performance.now();
  await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256,
  );
  return Math.round((performance.now() - start) * 10) / 10;
};

const measure = async (iterations, keyMaterial, salt) => ({
  iterations,
  ms: await sequentially(
    Array.from(
      { length: ROUNDS },
      () => () => deriveOnce(iterations, keyMaterial, salt),
    ),
  ),
});

export default defineEventHandler(async () => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('123456pepper'),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const results = await sequentially(
    ITERATIONS.map((n) => () => measure(n, keyMaterial, salt)),
  );
  return { note: 'wall-clock ms per PBKDF2-SHA256 derivation', results };
});
