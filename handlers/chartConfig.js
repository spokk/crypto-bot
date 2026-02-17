const THEME = {
  tick: "#e0e0e0",
  label: "#f0f0f0",
  grid: "rgba(255, 255, 255, 0.08)",
  font: "Segoe UI, sans-serif",
  line: "#4fc3f7",
  fill: "rgba(0, 122, 204, 0.1)",
  tooltip: "#2c2c3a",
  up: "#26a69a",
  down: "#ef5350",
  annotation: "rgba(255, 255, 255, 0.45)",
  avg: "rgba(255, 193, 7, 0.6)",
  volume: "rgba(255, 255, 255, 0.08)",
};

const formatUsd = (value) => {
  if (typeof value !== "number") return "N/A";
  return value >= 1 ? "$" + value.toLocaleString("en-US") : "$" + value;
};

const buildAnnotationLine = (label, value, color, dashPattern = [6, 4]) => ({
  type: "line",
  scaleID: "y",
  value,
  borderColor: color,
  borderWidth: 1,
  borderDash: dashPattern,
  label: {
    display: true,
    content: `${label}: ${formatUsd(value)}`,
    position: "start",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#ffffff",
    font: { size: 12, family: THEME.font },
    padding: 4,
  },
});

const buildYScale = (position, paddedMin, paddedMax, showGrid) => ({
  position,
  min: paddedMin,
  max: paddedMax,
  ticks: {
    color: THEME.tick,
    font: { size: 16, family: THEME.font, weight: "700" },
    padding: 6,
    callback: (val) => formatUsd(val),
  },
  grid: showGrid
    ? { color: THEME.grid, borderColor: "transparent" }
    : { display: false },
});

export const getChartConfig = (symbol, labels, prices, coinData, volumes) => {
  const numericPrices = prices.map(Number);
  const min = Math.min(...numericPrices);
  const max = Math.max(...numericPrices);
  const avg = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;
  const lastPrice = numericPrices.at(-1);

  const range = max - min;
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1);
  const paddedMin = Math.floor((min - range * 0.05) / magnitude) * magnitude;
  const paddedMax = Math.ceil((max + range * 0.05) / magnitude) * magnitude;

  const marketData = coinData?.market_data;
  const high24 = marketData?.high_24h?.usd;
  const low24 = marketData?.low_24h?.usd;
  const change24 = marketData?.price_change_percentage_24h;

  const changeStr =
    typeof change24 === "number"
      ? `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`
      : "";

  const hasVolumes = volumes?.length > 0;

  const datasets = [
    {
      label: `${symbol.toUpperCase()} ${changeStr}`,
      data: prices,
      fill: { target: "origin", above: THEME.fill },
      borderColor: THEME.line,
      pointBackgroundColor: THEME.line,
      borderWidth: 2,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 5,
      yAxisID: "y",
      segment: {
        borderColor: (ctx) =>
          ctx.p0.parsed.y <= ctx.p1.parsed.y ? THEME.up : THEME.down,
      },
    },
    {
      label: "7d High / Low",
      data: [],
      borderColor: THEME.annotation,
      borderDash: [6, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    },
    {
      label: "7d Avg",
      data: [],
      borderColor: THEME.avg,
      borderDash: [4, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    },
  ];

  if (hasVolumes) {
    datasets.push({
      label: "Volume",
      data: volumes,
      type: "bar",
      backgroundColor: THEME.volume,
      borderColor: "transparent",
      borderWidth: 0,
      yAxisID: "volume",
      order: 1,
    });
  }

  const scales = {
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
    y: buildYScale("right", paddedMin, paddedMax, true),
    y_left: buildYScale("left", paddedMin, paddedMax, false),
  };

  if (hasVolumes) {
    scales.volume = {
      position: "left",
      min: 0,
      max: Math.max(...volumes) * 5,
      display: false,
      grid: { display: false },
    };
  }

  const subtitleParts = [];
  if (typeof high24 === "number")
    subtitleParts.push(`24h High: ${formatUsd(high24)}`);
  if (typeof low24 === "number")
    subtitleParts.push(`24h Low: ${formatUsd(low24)}`);

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: THEME.label,
            font: { size: 18, weight: "700", family: THEME.font },
            padding: 10,
            filter: (item) => !item.text.includes("Volume"),
          },
        },
        title: {
          display: subtitleParts.length > 0,
          text: subtitleParts.join("  |  "),
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
          titleFont: { weight: "600" },
        },
        annotation: {
          annotations: {
            highLine: buildAnnotationLine("7d High", max, THEME.annotation),
            lowLine: buildAnnotationLine("7d Low", min, THEME.annotation),
            avgLine: buildAnnotationLine("7d Avg", avg, THEME.avg, [4, 4]),
            lastPriceLine: buildAnnotationLine(
              "Now",
              lastPrice,
              THEME.line,
              [3, 3],
            ),
          },
        },
      },
      layout: { padding: { top: 2, bottom: 6, left: 12, right: 12 } },
      scales,
    },
  };
};
