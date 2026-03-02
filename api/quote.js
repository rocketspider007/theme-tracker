export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbols } = req.query;
  if (!symbols) {
    return res.status(400).json({ error: 'symbols parameter required' });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols}&range=1y&interval=1d&indicators=close&includeTimestamps=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance error: ${response.status}`);
    }

    const data = await response.json();
    const result = {};
    const sparkResponse = data.spark?.result || [];
    
    for (const item of sparkResponse) {
      const symbol = item.symbol;
      const closes = item.response?.[0]?.indicators?.close?.[0]?.close || [];
      if (closes.length === 0) continue;
      const current = closes[closes.length - 1];
      const len = closes.length;
      const perf1d  = len >= 2   ? ((current - closes[len-2])  / closes[len-2]  * 100) : 0;
      const perf10d = len >= 10  ? ((current - closes[len-10]) / closes[len-10] * 100) : 0;
      const perf1m  = len >= 21  ? ((current - closes[len-21]) / closes[len-21] * 100) : 0;
      const perf3m  = len >= 63  ? ((current - closes[len-63]) / closes[len-63] * 100) : 0;
      const perf6m  = len >= 126 ? ((current - closes[len-126])/ closes[len-126]* 100) : 0;
      const perf1y  = len >= 2   ? ((current - closes[0])      / closes[0]      * 100) : 0;
      let rsi = 50;
      if (len >= 15) {
        const changes = [];
        for (let i = len - 14; i < len; i++) changes.push(closes[i] - closes[i-1]);
        const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14;
        const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / 14;
        rsi = losses === 0 ? 100 : Math.round(100 - (100 / (1 + gains / losses)));
      }
      result[symbol] = {
        p: Math.round(current * 100) / 100,
        rsi,
        perf: {
          '1d':  Math.round(perf1d  * 10) / 10,
          '10d': Math.round(perf10d * 10) / 10,
          '1m':  Math.round(perf1m  * 10) / 10,
          '3m':  Math.round(perf3m  * 10) / 10,
          '6m':  Math.round(perf6m  * 10) / 10,
          '1y':  Math.round(perf1y  * 10) / 10,
        }
      };
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
