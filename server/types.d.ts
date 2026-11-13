/// <reference types="@cloudflare/workers-types" />
declare module 'h3' {
  interface H3EventContext {
    // Set by the Nitro Cloudflare preset (and its dev emulation).
    cloudflare?: { env: { DB?: D1Database } & Record<string, unknown> };
  }
}

export {};
