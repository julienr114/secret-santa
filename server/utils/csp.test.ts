import { describe, expect, it } from 'vitest';
import { contentPolicy, cspHeader, withNonce } from './csp';

describe('the content policy', () => {
  const policy = contentPolicy('abc123');

  it('lets the app run its own scripts only, by file or by nonce', () => {
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self' 'nonce-abc123'");
    expect(policy).not.toContain('unsafe-eval');
    expect(
      policy.split('; ').find((d) => d.startsWith('script-src')),
    ).not.toContain('unsafe-inline');
  });

  it('closes plugins, a moved base, forms sent elsewhere and framing', () => {
    for (const directive of [
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]) {
      expect(policy).toContain(directive);
    }
  });

  it('gives each script the nonce, once', () => {
    const html =
      '<script>a()</script><script type="module" src="/x.js"></script><script nonce="old">b()</script><scripty>';
    expect(withNonce(html, 'n1')).toBe(
      '<script nonce="n1">a()</script><script nonce="n1" type="module" src="/x.js"></script><script nonce="old">b()</script><scripty>',
    );
  });

  it('is reported first, applied when asked, or off', () => {
    expect(cspHeader('report')).toBe('Content-Security-Policy-Report-Only');
    expect(cspHeader('enforce')).toBe('Content-Security-Policy');
    expect(cspHeader('off')).toBeNull();
  });
});
