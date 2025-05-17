const { getCoinGeckoCoinList } = require('../utils/http');

const apiKey = process.env.COINGECKO_API_KEY

async function chartHandler(symbol) {
  try {
    const { coins } = await getCoinGeckoCoinList(symbol);
    const coin = coins.find(c => c.symbol === symbol);

    if (!coin) return;

    const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`;
    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': apiKey
      }
    });
    if (!response.ok) throw new Error('Coin not found');
    const data = await response.json();

    const prices = data.prices.map(p => p[1] >= 1 ? p[1].toFixed(2) : p[1]);
    const labels = data.prices.map(p => {
      const d = new Date(p[0]);
      const hour = d.getHours().toString().padStart(2, '0');
      const min = d.getMinutes().toString().padStart(2, '0');
      return `${d.getDate()}/${d.getMonth() + 1} ${hour}:${min}`;
    });

    const chartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${coin.symbol ? coin.symbol.toUpperCase() : coin.id.toUpperCase()} Price (USD)`,
          data: prices,
          fill: true,
          borderColor: 'rgb(228, 229, 159)',
          backgroundColor: 'rgba(228, 229, 159, 0.15)',
          pointBackgroundColor: 'rgb(243, 108, 45)',
          pointRadius: 2,
          borderWidth: 3,
          tension: 0.4,
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
          }
        },
        layout: {
          padding: 10,
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
            }
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
            }
          }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?width=1100&height=500&backgroundColor=rgb(33,33,33)&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    return chartUrl
  } catch (err) {
    console.error('Could not fetch chart for this coin.', err);
  }
}

module.exports = chartHandler;