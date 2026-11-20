// Lets `node --experimental-strip-types` run a script that imports server
// code: Nuxt's aliases (#server, #shared) and imports without the `.ts`
// extension, as Vite resolves them. `node --import ./scripts/ts-resolve.mjs`.
import { register } from 'node:module';

register('./ts-resolve-hooks.mjs', import.meta.url);
