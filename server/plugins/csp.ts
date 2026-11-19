import { randomBytes, toBase64 } from '#server/utils/crypto';
import {
  contentPolicy,
  cspHeader,
  withNonce,
  type CspMode,
} from '#server/utils/csp';

// The content policy of every page (lot 38 A, README 8): a nonce is
// drawn for each answer, given to every script the server writes, and
// named in the policy. Sent as « report only » (`NUXT_CSP_MODE` unset or
// `report`): the browser says in its console what the policy would have
// refused, and refuses nothing. `enforce` applies it; `off` sends none.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const mode = String(useRuntimeConfig(event).cspMode || 'report') as CspMode;
    const header = cspHeader(mode);
    if (!header) return;
    const nonce = toBase64(randomBytes(16));
    const named = (parts: string[]) =>
      parts.map((part) => withNonce(part, nonce));
    // The hook hands the page over to be changed in place.
    Object.assign(html, {
      head: named(html.head),
      bodyPrepend: named(html.bodyPrepend),
      body: named(html.body),
      bodyAppend: named(html.bodyAppend),
    });
    setResponseHeader(event, header, contentPolicy(nonce));
  });
});
