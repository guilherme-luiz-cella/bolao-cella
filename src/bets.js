export const seedBets = [
  { name: 'Mercado', score: 8.2, confidence: 'Média', createdAt: 'seed-1' },
  { name: 'Torcida', score: 9.0, confidence: 'Alta', createdAt: 'seed-2' },
  { name: 'Professor misterioso', score: 6.9, confidence: 'Insana', createdAt: 'seed-3' }
];

export function normalizeBet(input, createdAt = new Date().toISOString()) {
  const name = String(input?.name || '').trim();
  const score = Number(input?.score);
  const confidence = String(input?.confidence || '').trim();

  if (!name || name.length > 40) {
    throw new Error('Nome obrigatório com no máximo 40 caracteres.');
  }

  if (Number.isNaN(score) || score < 0 || score > 10) {
    throw new Error('Nota obrigatória entre 0 e 10.');
  }

  if (!confidence || confidence.length > 20) {
    throw new Error('Confiança obrigatória com no máximo 20 caracteres.');
  }

  return {
    name,
    score: Number(score.toFixed(1)),
    confidence,
    createdAt
  };
}

export async function readBets(kv) {
  const storedBets = await kv.get('bets', 'json');
  if (!Array.isArray(storedBets)) return seedBets;
  return storedBets;
}

export async function writeBets(kv, bets) {
  await kv.put('bets', JSON.stringify(bets));
  return bets;
}
