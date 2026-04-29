import assert from 'node:assert/strict';
import test from 'node:test';
import { FINAL_SCORE, getClosestResult } from '../public/results.js';

test('finds the closest bet to the official score', () => {
  const result = getClosestResult([
    { name: 'Mercado', score: 8.2 },
    { name: 'Professor misterioso', score: 6.9 },
    { name: 'Torcida', score: 9.0 }
  ]);

  assert.equal(FINAL_SCORE, 7.3);
  assert.equal(result.finalScore, 7.3);
  assert.equal(result.difference, 0.4);
  assert.deepEqual(result.closestBets.map(bet => bet.name), ['Professor misterioso']);
});

test('keeps tied closest bets together', () => {
  const result = getClosestResult([
    { name: 'Abaixo', score: 7.1 },
    { name: 'Acima', score: 7.5 },
    { name: 'Longe', score: 9.0 }
  ]);

  assert.equal(result.difference, 0.2);
  assert.deepEqual(result.closestBets.map(bet => bet.name), ['Abaixo', 'Acima']);
});

test('returns no closest bets when there are no valid scores', () => {
  const result = getClosestResult([
    { name: 'Sem nota', score: 'abc' },
    { name: 'Vazio' }
  ]);

  assert.equal(result.difference, null);
  assert.deepEqual(result.closestBets, []);
});

test('rejects an invalid official score', () => {
  assert.throws(() => getClosestResult([], Number.NaN), /Nota final inválida/);
});
