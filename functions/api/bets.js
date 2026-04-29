import { normalizeBet, readBets, writeBets } from '../_shared/bets.js';

export async function onRequestGet({ env }) {
  const bets = await readBets(env.BETS_KV);
  return json({ bets });
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    const createdBet = normalizeBet(payload);
    const currentBets = await readBets(env.BETS_KV);
    const updatedBets = [createdBet, ...currentBets].slice(0, 500);

    await writeBets(env.BETS_KV, updatedBets);

    return json({ bet: createdBet, bets: updatedBets }, 201);
  } catch (error) {
    return json({ error: error.message || 'Não foi possível salvar o palpite.' }, 400);
  }
}

export async function onRequestDelete({ env }) {
  await writeBets(env.BETS_KV, []);
  return json({ bets: [] });
}

export async function onRequest() {
  return json({ error: 'Método não permitido.' }, 405);
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
