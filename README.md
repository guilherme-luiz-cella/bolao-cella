# Bolão da Nota

Static Worker app with global bet persistence through Cloudflare Workers KV.

## Deploy

1. Create the KV namespace:

   ```bash
   npx wrangler kv namespace create BETS_KV
   ```

2. Copy the generated namespace ID into `wrangler.toml`, replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

3. Configure Workers Builds:

   - Build command: `exit 0`
   - Deploy command: `npx wrangler deploy`
   - Non-production branch deploy command: `npx wrangler versions upload`
   - Path: `/`

4. Deploy.

## Local Notes

The Worker serves static files from `public/` and handles `/api/bets` before static assets. When the API is unavailable locally, the frontend falls back to `localStorage` so the page still works.
