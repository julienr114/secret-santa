#!/usr/bin/env sh
# Production-like server for end-to-end tests: Cloudflare build served by
# wrangler on port 3100, with a throwaway local D1 database. Test secrets
# only; never the real ones.
set -eu
# The developer's .env must not leak in: wrangler dev would load it, and a
# real email key there would make the tests send real emails.
export CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false
STATE=.wrangler/e2e
rm -rf "$STATE"
pnpm build
pnpm wrangler d1 migrations apply secret-santa --local --persist-to "$STATE"
# --test-scheduled: GET /__scheduled runs the morning task on demand.
exec pnpm wrangler dev --port 3100 --persist-to "$STATE" --log-level warn \
  --test-scheduled \
  --var NUXT_APP_SECRET:e2e-app-secret-0123456789abcdef0123456789 \
  --var NUXT_DATA_KEY:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
  --var NUXT_RESEND_API_KEY: \
  --var NUXT_DEV_LOGIN_LINKS:true \
  --var NUXT_LINK_REQUESTS_PER_IP:1000 \
  --var NUXT_SUPER_ADMIN_EMAILS:admin@example.com,second@example.com,third@example.com,super-edition@example.com,super-email@example.com,super-language@example.com,super-participant@example.com,super-security@example.com,super-signup@example.com,super-invite@example.com,super-notify@example.com \
  --var NUXT_PUBLIC_BASE_URL:http://localhost:3100
