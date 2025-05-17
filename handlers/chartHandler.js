const apiKey = process.env.COINGECKO_API_KEY

async function getCoinGeckoCoinList() {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/list', {
    headers: {
      'x-cg-demo-api-key': apiKey
    }
  });
  if (!response.ok) throw new Error('Failed to fetch CoinGecko coin list');
  return await response.json();
}

async function chartHandler(symbol) {
  const input = symbol.toLowerCase();

  try {
    const coinList = await getCoinGeckoCoinList();
    const coin =
      coinList.find(c => c.symbol.toLowerCase() === input) ||
      coinList.find(c => c.id === input) ||
      coinList.find(c => c.name.toLowerCase() === input);

    if (!coin) return;

    const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`;
    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': apiKey
      }
    });
    if (!response.ok) throw new Error('Coin not found');
    const data = await response.json();

    const prices = data.prices.map(p => p[1]);
    const labels = data.prices.map(p => {
      const d = new Date(p[0]);
      const hour = d.getHours().toString().padStart(2, '0');
      const min = d.getMinutes().toString().padStart(2, '0');
      return `${d.getDate()}/${d.getMonth() + 1} ${hour}:${min}`;
    });

    const chartUrl = `https://quickchart.io/chart?width=1100&height=500&c=${encodeURIComponent(JSON.stringify({
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${coin.symbol ? coin.symbol.toUpperCase() : coin.id.toUpperCase()} Price (USD)`,
          data: prices,
          fill: true,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.15)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 2,
          borderWidth: 3,
          tension: 0.4
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#fff',
              font: { size: 16, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: `${coin.name} Price Chart (7d)`,
            color: '#fff',
            font: { size: 22 }
          }
        },
        layout: {
          padding: 30,
          backgroundColor: '#181c25',
        },
        elements: {
          line: { borderJoinStyle: 'round' },
          point: { radius: 2, borderWidth: 1 }
        },
        scales: {
          x: {
            ticks: {
              color: '#fff',
              font: { size: 13 },
              maxRotation: 60,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 16
            },
            grid: { color: 'rgba(200,200,200,0.15)' }
          },
          y: {
            ticks: {
              color: '#fff',
              font: { size: 13 },
              callback: function (value) {
                if (Math.abs(value) >= 1) {
                  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                return value.toFixed(8).replace(/\.?0+$/, '');
              }
            },
            grid: { color: 'rgba(200,200,200,0.15)' }
          }
        }
      }
    }))}`;

    return chartUrl
  } catch (err) {
    console.error('Could not fetch chart for this coin.', err);
  }
}

module.exports = chartHandler;