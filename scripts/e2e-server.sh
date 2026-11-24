#!/usr/bin/env sh
# Production-like server for end-to-end tests: Cloudflare build served by
# wrangler, with a throwaway local D1 database of its own. Test secrets
# only; never the real ones.
#
# E2E_PORT (3100 by default): its port; its database is .wrangler/e2e-<port>,
# so that several servers run side by side (ticket 168).
# E2E_SKIP_BUILD=1: the build is already there (scripts/e2e.ts builds once
# for all the servers).
set -eu
# The developer's .env must not leak in: wrangler dev would load it, and a
# real email key there would make the tests send real emails.
export CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false
PORT="${E2E_PORT:-3100}"
STATE=".wrangler/e2e-$PORT"
rm -rf "$STATE"
if [ "${E2E_SKIP_BUILD:-}" != "1" ]; then
  pnpm build
fi
pnpm wrangler d1 migrations apply secret-santa --local --persist-to "$STATE" >/dev/null
# --test-scheduled: GET /__scheduled runs the morning task on demand. Each
# server its own inspector port, so that they do not fight over 9229.
exec pnpm wrangler dev --port "$PORT" --inspector-port "$((PORT + 6000))" \
  --persist-to "$STATE" --log-level warn \
  --test-scheduled \
  --var NUXT_APP_SECRET:e2e-app-secret-0123456789abcdef0123456789 \
  --var NUXT_DATA_KEY:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
  --var NUXT_RESEND_API_KEY: \
  --var NUXT_DEV_LOGIN_LINKS:true \
  --var NUXT_LINK_REQUESTS_PER_IP:1000 \
  --var NUXT_LINK_REQUESTS_PER_EMAIL:5 \
  --var NUXT_RATE_LIMITS:off \
  --var NUXT_SUPER_ADMIN_EMAILS:admin@example.com,second@example.com,third@example.com,super-edition@example.com,super-email@example.com,super-language@example.com,super-participant@example.com,super-security@example.com,super-signup@example.com,super-invite@example.com,super-notify@example.com,super-design@example.com,super-home@example.com,super-cases@example.com,super-hints@example.com,super-first-idea@example.com,super-deploy@example.com,super-elsewhere@example.com,super-guess@example.com,super-reveal@example.com,super-nudges@example.com,super-anonymous@example.com,super-tabs@example.com,super-draw-lists@example.com,super-emergency@example.com \
  --var "NUXT_PUBLIC_BASE_URL:http://localhost:$PORT"
