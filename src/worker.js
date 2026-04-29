import { BETS_CLOSED, assertBetsOpen, normalizeBet, readBets, writeBets } from './bets.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/bets') {
      return handleBetsRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleBetsRequest(request, env) {
  if (request.method === 'GET') {
    const bets = await readBets(env.BETS_KV);
    return json({ bets });
  }

  if (request.method === 'POST') {
    try {
      assertBetsOpen(isBettingClosed(env));

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

  if (request.method === 'DELETE') {
    await writeBets(env.BETS_KV, []);
    return json({ bets: [] });
  }

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

function isBettingClosed(env) {
  const value = env.BETS_CLOSED ?? BETS_CLOSED;
  return value !== false && value !== 'false';
}
