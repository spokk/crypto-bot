export const getChartConfig = (symbol, labels, prices) => {
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

  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${symbol.toUpperCase()} price (USD) for the last 7 days.`,
        data: prices,
        fill: true,
        borderColor: 'rgb(228, 229, 159)',
        backgroundColor: 'rgba(228, 229, 159, 0.20)',
        borderWidth: 2,
        tension: 0.5,
        yAxisID: 'y'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgb(255,255,255)",
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      },
      layout: {
        padding: {
          left: 12,
          right: 20,
          top: 12,
          bottom: 12
        },
        backgroundColor: 'rgb(24,28,37)'
      },
      elements: {
        line: { borderJoinStyle: 'round' },
        point: { radius: 2, borderWidth: 1 }
      },
      scales: {
        x: {
          ticks: {
            color: "rgb(255,255,255)",
            font: { size: 13 },
            maxRotation: 45,
            minRotation: 30,
            autoSkip: true,
            maxTicksLimit: 16,
            showLastLabel: true
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.3)',
          }
        },
        y: {
          position: 'right',
          min: paddedMin,
          max: paddedMax,
          ticks: {
            color: "rgb(255,255,255)",
            font: {
              size: 15,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.3)',
          }
        },
        y_left: {
          position: 'left',
          min: paddedMin,
          max: paddedMax,
          ticks: {
            color: "rgb(255,255,255)",
            font: {
              size: 15,
              weight: 'bold'
            }
          },
          grid: {
            display: false // Hide left grid lines to avoid double grid
          }
        },
      }
    }
  };
};