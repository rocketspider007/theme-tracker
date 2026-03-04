export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET, OPTIONS’);
if (req.method === ‘OPTIONS’) return res.status(200).end();

const { symbols } = req.query;
if (!symbols) return res.status(400).json({ error: ‘symbols parameter required’ });

const tickerList = symbols.split(’,’).map(s => s.trim()).filter(Boolean);
const result = {};

for (const ticker of tickerList) {
try {
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;

```
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/',
      'Origin': 'https://finance.yahoo.com',
    }
  });

  if (!response.ok) {
    result[ticker] = { error: `HTTP ${response.status}` };
    continue;
  }

  const data = await response.json();
  const chart = data?.chart?.result?.[0];
  if (!chart) { result[ticker] = { error: 'no data' }; continue; }

  const closes = (chart.indicators?.quote?.[0]?.close || []).filter(v => v != null && !isNaN(v));
  if (closes.length === 0) { result[ticker] = { error: 'no closes' }; continue; }

  const current = closes[closes.length - 1];
  const len = closes.length;

  const perf1d  = len >= 2   ? +((current - closes[len-2])   / closes[len-2]   * 100).toFixed(1) : 0;
  const perf10d = len >= 10  ? +((current - closes[len-10])  / closes[len-10]  * 100).toFixed(1) : 0;
  const perf1m  = len >= 21  ? +((current - closes[len-21])  / closes[len-21]  * 100).toFixed(1) : 0;
  const perf3m  = len >= 63  ? +((current - closes[len-63])  / closes[len-63]  * 100).toFixed(1) : 0;
  const perf6m  = len >= 126 ? +((current - closes[len-126]) / closes[len-126] * 100).toFixed(1) : 0;
  const perf1y  = len >= 2   ? +((current - closes[0])       / closes[0]       * 100).toFixed(1) : 0;

  let rsi = 50;
  if (len >= 15) {
    let gains = 0, losses = 0;
    for (let i = len - 14; i < len; i++) {
      const diff = closes[i] - closes[i-1];
      if (diff > 0) gains += diff; else losses += Math.abs(diff);
    }
    rsi = losses === 0 ? 100 : Math.round(100 - (100 / (1 + (gains/14) / (losses/14))));
  }

  const volumes = (chart.indicators?.quote?.[0]?.volume || []).filter(v => v != null);
  const latestVol = volumes.length > 0 ? volumes[volumes.length - 1] : 0;

  result[ticker] = {
    p: Math.round(current * 100) / 100,
    rsi,
    v: latestVol,
    perf: { '1d': perf1d, '10d': perf10d, '1m': perf1m, '3m': perf3m, '6m': perf6m, '1y': perf1y }
  };

} catch (e) {
  result[ticker] = { error: e.message };
}

await new Promise(r => setTimeout(r, 50));
```

}

return res.status(200).json(result);
}
