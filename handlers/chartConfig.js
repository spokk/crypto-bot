export const getChartConfig = (symbol, labels, prices) => {
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
        }
      }
    }
  };
};