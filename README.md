# Bolão da Nota

Static Cloudflare Pages app with global bet persistence through Cloudflare Pages Functions and KV.

## Deploy

1. Create the KV namespace:

   ```bash
   npx wrangler kv namespace create BETS_KV
   ```

2. Copy the generated namespace ID into `wrangler.toml`, replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

3. Configure Cloudflare Pages:

   - Build command: empty
   - Build output directory: `public`

4. Deploy with Pages:

   ```bash
   npx wrangler pages deploy public --project-name cella-bolao
   ```

   Do not use plain `npx wrangler deploy` for this project. Plain `wrangler deploy` is for Worker entry-point deployments and can fail with `Missing entry-point to Worker script or to assets directory`.

## Local Notes

When the `/api/bets` function is unavailable locally, the frontend falls back to `localStorage` so the page still works.
