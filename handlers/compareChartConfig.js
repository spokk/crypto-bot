const THEME = {
  tick: "#e0e0e0",
  label: "#f0f0f0",
  grid: "rgba(255, 255, 255, 0.08)",
  font: "Segoe UI, sans-serif",
  tooltip: "#2c2c3a",
  coinA: "#4fc3f7",
  coinB: "#ffa726",
  zero: "rgba(255, 255, 255, 0.2)",
};

const normalizeToPercent = (prices) => {
  const first = prices[0];
  if (!first || first === 0) return prices.map(() => 0);
  return prices.map((p) => ((p - first) / first) * 100);
};

export const getCompareChartConfig = (
  nameA,
  pricesA,
  nameB,
  pricesB,
  labels,
  changeA,
  changeB,
  days = 7,
) => {
  const pctA = normalizeToPercent(pricesA.map(Number));
  const pctB = normalizeToPercent(pricesB.map(Number));

  const all = [...pctA, ...pctB];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const paddedMin = min - range * 0.1;
  const paddedMax = max + range * 0.1;

  const fmtChange = (v) =>
    typeof v === "number" ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "";

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${nameA} ${fmtChange(changeA)}`,
          data: pctA,
          borderColor: THEME.coinA,
          borderWidth: 2.5,
          tension: 0.15,
          pointRadius: 0,
          pointHoverRadius: 5,
          fill: false,
        },
        {
          label: `${nameB} ${fmtChange(changeB)}`,
          data: pctB,
          borderColor: THEME.coinB,
          borderWidth: 2.5,
          tension: 0.15,
          pointRadius: 0,
          pointHoverRadius: 5,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: THEME.label,
            font: { size: 18, weight: "700", family: THEME.font },
            padding: 12,
          },
        },
        title: {
          display: true,
          text: `${days}-Day Performance Comparison (%)`,
          color: "#e0e0e0",
          font: { size: 15, weight: "600", family: THEME.font },
          padding: { top: 0, bottom: 4 },
        },
        tooltip: {
          backgroundColor: THEME.tooltip,
          titleColor: "#ffffff",
          bodyColor: "#dddddd",
          borderColor: "#555",
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`,
          },
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: "line",
              scaleID: "y",
              value: 0,
              borderColor: THEME.zero,
              borderWidth: 1,
              borderDash: [6, 4],
            },
          },
        },
      },
      layout: { padding: { top: 2, bottom: 6, left: 12, right: 12 } },
      scales: {
        x: {
          ticks: {
            color: THEME.tick,
            font: { size: 13, family: THEME.font },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
          grid: { color: THEME.grid, borderColor: "transparent" },
        },
        y: {
          position: "right",
          min: paddedMin,
          max: paddedMax,
          ticks: {
            color: THEME.tick,
            font: { size: 16, family: THEME.font, weight: "700" },
            padding: 6,
            callback: (val) => `${val.toFixed(1)}%`,
          },
          grid: { color: THEME.grid, borderColor: "transparent" },
        },
      },
    },
  };
};
