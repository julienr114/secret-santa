import { defineConfig } from 'drizzle-kit';

// drizzle-kit only generates SQL migrations here; wrangler applies them to
// D1 (local or remote) using migrations_dir from wrangler.toml.
export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.js',
  out: './server/database/migrations',
});
