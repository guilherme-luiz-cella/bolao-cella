import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequestDelete, onRequestGet, onRequestPost } from '../functions/api/bets.js';
import { normalizeBet, readBets, seedBets } from '../functions/_shared/bets.js';

test('reads seed bets when KV is empty', async () => {
  const kv = createMemoryKv();

  assert.deepEqual(await readBets(kv), seedBets);
});

test('GET /api/bets returns bets payload', async () => {
  const kv = createMemoryKv();
  const response = await onRequestGet({ env: { BETS_KV: kv } });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload, { bets: seedBets });
});

test('POST /api/bets creates, prepends, rounds, and saves a bet', async () => {
  const kv = createMemoryKv();
  const response = await onRequestPost({
    request: new Request('http://localhost/api/bets', {
      method: 'POST',
      body: JSON.stringify({ name: ' Cella ', score: 8.26, confidence: 'Alta' })
    }),
    env: { BETS_KV: kv }
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.bet.name, 'Cella');
  assert.equal(payload.bet.score, 8.3);
  assert.equal(payload.bets[0].name, 'Cella');
  assert.equal((await kv.get('bets', 'json'))[0].score, 8.3);
});

test('POST /api/bets rejects invalid payloads', async () => {
  const kv = createMemoryKv();
  const response = await onRequestPost({
    request: new Request('http://localhost/api/bets', {
      method: 'POST',
      body: JSON.stringify({ name: '', score: 12, confidence: '' })
    }),
    env: { BETS_KV: kv }
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.match(payload.error, /Nome obrigatório/);
});

test('DELETE /api/bets clears saved bets', async () => {
  const kv = createMemoryKv();
  await kv.put('bets', JSON.stringify([{ name: 'A', score: 1, confidence: 'Baixa', createdAt: 'x' }]));

  const response = await onRequestDelete({ env: { BETS_KV: kv } });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload, { bets: [] });
  assert.deepEqual(await kv.get('bets', 'json'), []);
});

test('normalizes valid data and rejects long names', () => {
  assert.equal(normalizeBet({ name: 'Ok', score: 10, confidence: 'Alta' }, 'date').createdAt, 'date');
  assert.throws(() => normalizeBet({ name: 'a'.repeat(41), score: 8, confidence: 'Alta' }), /40 caracteres/);
});

function createMemoryKv() {
  const store = new Map();

  return {
    async get(key, type) {
      const value = store.get(key) || null;
      return type === 'json' && value ? JSON.parse(value) : value;
    },
    async put(key, value) {
      store.set(key, value);
    }
  };
}
