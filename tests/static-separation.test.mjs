import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');

assert.match(html, /<link rel="stylesheet" href="styles\.css" \/>/);
assert.match(html, /<script type="module" src="app\.js"><\/script>/);
assert.ok(css.includes('.page'));
assert.ok(js.includes("const API_BETS_PATH = '/api/bets';"));
assert.ok(wrangler.includes('binding = "BETS_KV"'));

assert.doesNotMatch(html, /<style[\s>]/i);
assert.doesNotMatch(html, /<script>(.|\n)*<\/script>/i);
assert.doesNotMatch(html, /\son(?:click|submit|error)=/i);
