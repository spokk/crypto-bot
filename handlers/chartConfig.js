function getChartConfig(symbol, labels, prices) {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${symbol.toUpperCase()} Price (USD). Last 7 days`,
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
            maxTicksLimit: 16,
            showLastLabel: true
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.3)',
          }
        },
        y: {
          ticks: {
            color: "#fff",
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
}

module.exports = { getChartConfig };