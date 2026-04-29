export const FINAL_SCORE = 7.3;

export function getClosestResult(nextBets, finalScore = FINAL_SCORE) {
  const normalizedFinalScore = Number(finalScore);

  if (!Number.isFinite(normalizedFinalScore)) {
    throw new Error('Nota final inválida.');
  }

  const validBets = Array.isArray(nextBets)
    ? nextBets.filter(bet => Number.isFinite(Number(bet?.score)))
    : [];

  if (validBets.length === 0) {
    return {
      finalScore: normalizedFinalScore,
      closestBets: [],
      difference: null
    };
  }

  const betsWithDifference = validBets.map(bet => ({
    ...bet,
    score: Number(bet.score),
    difference: getScoreDifference(bet.score, normalizedFinalScore)
  }));
  const closestDifference = Math.min(...betsWithDifference.map(bet => bet.difference));

  return {
    finalScore: normalizedFinalScore,
    closestBets: betsWithDifference.filter(bet => bet.difference === closestDifference),
    difference: closestDifference
  };
}

function getScoreDifference(score, finalScore) {
  return Number(Math.abs(Number(score) - finalScore).toFixed(1));
}
