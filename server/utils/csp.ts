// The content policy of the pages (lot 38 A, README 8): what a page may
// load and run. Scripts are those of the app only, each inline one named
// by a nonce drawn for that answer; no `eval`, no plugin, no form sent
// elsewhere, no `<base>` moved. Pure: the plugin draws the nonce.

/**
 * The policy of a page.
 * @param nonce - The nonce of this answer, carried by its inline scripts.
 * @returns The value of the header.
 */
export const contentPolicy = (nonce: string): string =>
  [
    "default-src 'self'",
    // The app's own files, and its inline scripts by their nonce.
    `script-src 'self' 'nonce-${nonce}'`,
    // Vue writes styles on elements (a colour, a size): inline styles
    // stay allowed. They run nothing.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

/**
 * Gives every script of a piece of HTML the nonce of the answer.
 * @param html - Some HTML written by the server.
 * @param nonce - The nonce.
 * @returns The same HTML, each `<script` carrying the nonce.
 */
export const withNonce = (html: string, nonce: string): string =>
  html.replace(
    /<script(?![^>]*\snonce=)(?=[\s>])/g,
    `<script nonce="${nonce}"`,
  );

/** How the policy is sent: only reported by the browser, or applied. */
export type CspMode = 'report' | 'enforce' | 'off';

/**
 * The header that carries the policy.
 * @param mode - Reported or applied.
 * @returns The name of the header, or null when the policy is off.
 */
export const cspHeader = (mode: CspMode): string | null =>
  mode === 'off'
    ? null
    : mode === 'enforce'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only';
