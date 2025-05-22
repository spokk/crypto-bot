export const getChartConfig = (symbol, labels, prices, coinData) => {
  const numericPrices = prices.map(Number);
  let min = Math.min(...numericPrices);
  let max = Math.max(...numericPrices);

  // Add 5% padding
  const range = max - min;
  let paddedMin = min - range * 0.05;
  let paddedMax = max + range * 0.05;

  // Round min down and max up to nearest "nice" number
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1);
  paddedMin = Math.floor(paddedMin / magnitude) * magnitude;
  paddedMax = Math.ceil(paddedMax / magnitude) * magnitude;

  const max24 = typeof coinData?.market_data?.high_24h?.usd === 'number'
    ? coinData.market_data.high_24h.usd.toLocaleString('en-US')
    : 'N/A';
  const min24 = typeof coinData?.market_data?.low_24h?.usd === 'number'
    ? coinData.market_data.low_24h.usd.toLocaleString('en-US')
    : 'N/A';

  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${symbol.toUpperCase()} price | 24h High: $${max24} | 24h Low: $${min24}`,
        data: prices,
        fill: {
          target: 'origin',
          above: 'rgba(0, 122, 204, 0.1)'
        },
        borderColor: '#4fc3f7',
        pointBackgroundColor: '#4fc3f7',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: 'y',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#e0e0e0',
            font: {
              size: 18,
              weight: '700',
              family: 'Segoe UI, sans-serif',
            },
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: '#2c2c3a',
          titleColor: '#ffffff',
          bodyColor: '#dddddd',
          borderColor: '#555',
          borderWidth: 1,
          titleFont: {
            weight: '600'
          }
        }
      },
      layout: {
        padding: {
          top: 4, bottom: 20, left: 16, right: 16
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#cccccc',
            font: {
              size: 13,
              family: 'Segoe UI, sans-serif',
            },
            maxRotation: 45,
            minRotation: 30,
            autoSkip: true,
            maxTicksLimit: 16,
            showLastLabel: true, // Always show last tick
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'transparent'
          }
        },
        y: {
          position: 'right',
          min: paddedMin,
          max: paddedMax,
          ticks: {
            color: '#cccccc',
            font: {
              size: 16,
              family: 'Segoe UI, sans-serif',
              weight: '700'
            },
            padding: 6
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'transparent'
          }
        },
        y_left: {
          position: 'left',
          min: paddedMin,
          max: paddedMax,
          ticks: {
            color: '#cccccc',
            font: {
              size: 16,
              family: 'Segoe UI, sans-serif',
              weight: '700'
            },
            padding: 6
          },
          grid: {
            display: false // Hide left grid lines to avoid double grid
          }
        }
      }
    }
  };
};