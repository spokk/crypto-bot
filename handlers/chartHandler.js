const { getCoinGeckoCoinList, fetchCoinGeckoMarketChart } = require('../utils/http');

async function chartHandler(symbol) {
  try {
    // Fetch coin list and find the coin by symbol
    const { coins } = await getCoinGeckoCoinList(symbol);
    const coin = coins.find(c => c.symbol === symbol);

    if (!coin) return;

    // Fetch market chart data
    const data = await fetchCoinGeckoMarketChart(coin.id);

    // Prepare price and label arrays
    const prices = data.prices.map(([_, price]) =>
      price >= 1 ? Number(price).toFixed(2) : price
    );
    const labels = data.prices.map(([timestamp]) => {
      const d = new Date(timestamp);
      const hour = d.getHours().toString().padStart(2, '0');
      const min = d.getMinutes().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${d.getDate()}.${month} ${hour}:${min}`;
    });

    // Chart.js config for QuickChart
    const chartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${symbol.toUpperCase()} Price (USD)`,
          data: prices,
          fill: true,
          borderColor: 'rgb(228, 229, 159)',
          backgroundColor: 'rgba(228, 229, 159, 0.20)',
          borderWidth: 2,
          tension: 0.4,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#fff",
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          }
        },
        layout: {
          padding: 8,
          backgroundColor: '#181c25'
        },
        elements: {
          line: { borderJoinStyle: 'round' },
          point: { radius: 2, borderWidth: 1 }
        },
        scales: {
          x: {
            ticks: {
              color: "#fff",
              font: { size: 13 },
              maxRotation: 45,
              minRotation: 30,
              autoSkip: true,
              maxTicksLimit: 20
            }
          },
          y: {
            ticks: {
              color: "#fff",
              font: { size: 14 }
            }
          }
        }
      }
    };

    // Generate QuickChart URL
    const chartUrl = `https://quickchart.io/chart?v=4&width=1100&height=500&backgroundColor=rgb(33,33,33)&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    return chartUrl;
  } catch (err) {
    console.error('Could not fetch chart for this coin.', err);
  }
}

module.exports = { chartHandler };