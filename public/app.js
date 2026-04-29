const STORAGE_KEY = 'cella-linguagens-formais-bets-v1';
const API_BETS_PATH = '/api/bets';
const seedBets = [
  { name: 'Mercado', score: 8.2, confidence: 'Média', createdAt: 'seed-1' },
  { name: 'Torcida', score: 9.0, confidence: 'Alta', createdAt: 'seed-2' },
  { name: 'Professor misterioso', score: 6.9, confidence: 'Insana', createdAt: 'seed-3' }
];

let bets = loadLocalBets();
let remoteApiAvailable = false;

bindPageEvents();
loadInitialBets();

function bindPageEvents() {
  document.getElementById('betForm').addEventListener('submit', submitBet);

  document.querySelectorAll('[data-scroll-target]').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById(button.dataset.scrollTarget).scrollIntoView({ behavior: 'smooth' });
    });
  });
}

async function loadInitialBets() {
  try {
    const payload = await requestJson(API_BETS_PATH);
    bets = Array.isArray(payload.bets) ? payload.bets : seedBets;
    remoteApiAvailable = true;
    saveLocalBets(bets);
  } catch (error) {
    console.warn('Não foi possível carregar os palpites do servidor. Usando fallback local.', error);
    remoteApiAvailable = false;
    bets = loadLocalBets();
  }

  renderAll();
}

function loadLocalBets() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Não foi possível carregar os palpites locais.', error);
  }

  saveLocalBets(seedBets);
  return [...seedBets];
}

function saveLocalBets(nextBets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBets));
}

async function submitBet(event) {
  event.preventDefault();

  let nextBet;

  try {
    nextBet = normalizeBet({
      name: document.getElementById('name').value,
      score: document.getElementById('score').value,
      confidence: document.getElementById('confidence').value
    });
  } catch (error) {
    showToast(error.message);
    return;
  }

  if (remoteApiAvailable) {
    try {
      const payload = await requestJson(API_BETS_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextBet)
      });

      bets = payload.bets;
      saveLocalBets(bets);
      renderAll();
      showToast('Palpite salvo no servidor');
      event.target.reset();
      return;
    } catch (error) {
      console.warn('Não foi possível salvar no servidor. Salvando localmente.', error);
      remoteApiAvailable = false;
    }
  }

  bets = [nextBet, ...bets].slice(0, 500);
  saveLocalBets(bets);
  renderAll();
  showToast('Palpite salvo localmente');
  event.target.reset();
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Não foi possível completar a operação.');
  }

  return payload;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  toast.textContent = message;
}

function normalizeBet(input) {
  const name = String(input.name || '').trim();
  const score = Number(input.score);
  const confidence = String(input.confidence || '').trim();

  if (!name || name.length > 40) {
    throw new Error('Informe um nome com no máximo 40 caracteres.');
  }

  if (Number.isNaN(score) || score < 0 || score > 10) {
    throw new Error('Informe uma nota entre 0 e 10.');
  }

  if (!confidence || confidence.length > 20) {
    throw new Error('Informe a confiança com no máximo 20 caracteres.');
  }

  return {
    name,
    score: Number(score.toFixed(1)),
    confidence,
    createdAt: new Date().toISOString()
  };
}

function renderAll() {
  renderRanking();
  renderStats();
  renderChart();
  renderForecast();
}

function renderRanking() {
  const ranking = document.getElementById('ranking');
  if (bets.length === 0) {
    ranking.innerHTML = '<li><span class="medal">—</span><span>Nenhum palpite ainda</span><strong>--</strong></li>';
    return;
  }

  const sorted = sortBetsByScore(bets);
  ranking.innerHTML = sorted.slice(0, 8).map((bet, index) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || '🎲';
    return `
      <li>
        <span class="medal">${medal}</span>
        <span>${escapeHtml(bet.name)} <small class="ranking-confidence">(${escapeHtml(bet.confidence)})</small></span>
        <strong>${formatScore(bet.score)}</strong>
      </li>
    `;
  }).join('');
}

function renderStats() {
  const { total, average, max, min } = getBetStats(bets);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAverage').textContent = average === null ? '--' : formatScore(average);
  document.getElementById('statMax').textContent = max === null ? '--' : formatScore(max);
  document.getElementById('statMin').textContent = min === null ? '--' : formatScore(min);
}

function renderForecast() {
  const { total, average } = getBetStats(bets);
  const mode = getModeScore(bets);

  document.getElementById('marketScore').textContent = total ? formatScore(average) : '--';
  document.getElementById('totalBets').textContent = `${total} ${total === 1 ? 'palpite' : 'palpites'}`;
  document.getElementById('mostCommonScore').textContent = `Moda: ${mode === null ? '--' : formatScore(mode)}`;
}

function renderChart() {
  const chartWrap = document.getElementById('chartWrap');

  if (bets.length === 0) {
    chartWrap.innerHTML = '<div class="empty-state">Nenhum palpite ainda. Registre o primeiro palpite para gerar o gráfico.</div>';
    return;
  }

  const buckets = Array.from({ length: 11 }, (_, score) => ({ score, count: 0 }));

  bets.forEach(bet => {
    const rounded = Math.max(0, Math.min(10, Math.round(bet.score)));
    buckets[rounded].count += 1;
  });

  const maxCount = Math.max(...buckets.map(bucket => bucket.count), 1);
  const yMax = Math.max(maxCount, 5);
  const yLabels = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

  chartWrap.innerHTML = `
    <div class="chart" aria-label="Distribuição dos palpites por nota arredondada">
      <div class="y-axis">
        ${yLabels.map(label => `<span>${label}</span>`).join('')}
      </div>
      <div class="bars">
        ${buckets.map(bucket => {
          const height = bucket.count === 0 ? 2 : Math.max(6, (bucket.count / yMax) * 100);
          return `
            <div class="bar-column" title="Nota ${bucket.score}: ${bucket.count} palpite(s)">
              ${bucket.count ? `<span class="bar-value">${bucket.count}</span>` : ''}
              <div class="bar" data-height="${height}"></div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="x-axis">
        ${buckets.map(bucket => `<span>${bucket.score}</span>`).join('')}
      </div>
    </div>
  `;

  chartWrap.querySelectorAll('.bar').forEach(bar => {
    bar.style.height = `${bar.dataset.height}%`;
  });
}

function sortBetsByScore(nextBets) {
  return [...nextBets].sort((a, b) => b.score - a.score);
}

function getBetStats(nextBets) {
  const total = nextBets.length;
  const scores = nextBets.map(bet => bet.score);

  return {
    total,
    average: total ? scores.reduce((sum, score) => sum + score, 0) / total : null,
    max: total ? Math.max(...scores) : null,
    min: total ? Math.min(...scores) : null
  };
}

function getModeScore(nextBets) {
  if (!nextBets.length) return null;

  const counts = new Map();
  nextBets.forEach(bet => {
    const rounded = Math.round(bet.score);
    counts.set(rounded, (counts.get(rounded) || 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}

function formatScore(value) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
