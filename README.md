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

4. Deploy.

## Local Notes

When the `/api/bets` function is unavailable locally, the frontend falls back to `localStorage` so the page still works.
