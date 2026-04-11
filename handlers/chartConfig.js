const THEME = {
  tick: "#e0e0e0",
  label: "#f0f0f0",
  grid: "rgba(255, 255, 255, 0.07)",
  font: "Segoe UI, sans-serif",
  line: "#4fc3f7",
  fill: "rgba(0, 150, 220, 0.18)",
  tooltip: "#2c2c3a",
  annotation: "rgba(255, 255, 255, 0.45)",
  avg: "rgba(255, 193, 7, 0.65)",
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
    position: "end",
    xAdjust: -6,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    color: "#ffffff",
    font: { size: 11, family: THEME.font },
    padding: { x: 5, y: 3 },
    borderRadius: 3,
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
    callback: (val) =>
      val >= 1
        ? "$" + val.toLocaleString("en-US")
        : typeof val === "number"
          ? "$" + val
          : "N/A",
  },
  grid: showGrid
    ? { color: THEME.grid, borderColor: "transparent" }
    : { display: false },
});

export const getChartConfig = (
  symbol,
  labels,
  prices,
  coinData,
  volumes,
  days = 7,
) => {
  const numericPrices = prices.map(Number);
  const min = numericPrices.reduce((a, b) => Math.min(a, b), Infinity);
  const max = numericPrices.reduce((a, b) => Math.max(a, b), -Infinity);
  const avg = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;
  const lastPrice = numericPrices.at(-1);

  const range = max - min || 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1);
  const paddedMin = Math.floor((min - range * 0.05) / magnitude) * magnitude;
  const paddedMax = Math.ceil((max + range * 0.05) / magnitude) * magnitude;

  const marketData = coinData?.market_data;
  const periodChange =
    coinData?.periodChange ?? marketData?.price_change_percentage_24h;

  const changeStr =
    typeof periodChange === "number"
      ? `${periodChange >= 0 ? "+" : ""}${periodChange.toFixed(2)}%`
      : "";

  const isPositive = typeof periodChange !== "number" || periodChange >= 0;
  const lineColor = isPositive ? "#4fc3f7" : "#ff6b8a";
  const fillColor = isPositive
    ? "rgba(0, 150, 220, 0.16)"
    : "rgba(255, 107, 138, 0.12)";

  const hasVolumes = volumes?.length > 0;

  const datasets = [
    {
      label: `${symbol.toUpperCase()} ${changeStr}`,
      data: prices,
      fill: { target: "origin", above: fillColor },
      borderColor: lineColor,
      pointBackgroundColor: lineColor,
      borderWidth: 2,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 5,
      yAxisID: "y",
    },
    {
      label: `${days}d High / Low`,
      data: [],
      borderColor: THEME.annotation,
      borderDash: [6, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    },
    {
      label: `${days}d Avg`,
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
        autoSkip: false,
      },
      afterBuildTicks: (axis) => {
        const n = axis.ticks.length;
        if (n <= 8) return;
        const keep = new Set([0, n - 1]);
        const step = Math.floor(n / 6);
        for (let i = step; i < n - 1; i += step) keep.add(i);
        axis.ticks = axis.ticks.filter((_, i) => keep.has(i));
      },
      grid: { display: false },
    },
    y: buildYScale("right", paddedMin, paddedMax, true),
  };

  if (hasVolumes) {
    scales.volume = {
      position: "left",
      min: 0,
      max: volumes.reduce((a, b) => Math.max(a, b), 0) * 5,
      display: false,
      grid: { display: false },
    };
  }

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
        title: { display: false },
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
            highLine: buildAnnotationLine(
              `${days}d High`,
              max,
              THEME.annotation,
            ),
            lowLine: buildAnnotationLine(`${days}d Low`, min, THEME.annotation),
            avgLine: buildAnnotationLine(
              `${days}d Avg`,
              avg,
              THEME.avg,
              [4, 4],
            ),
            lastPriceLine: {
              type: "line",
              scaleID: "y",
              value: lastPrice,
              borderColor: lineColor,
              borderWidth: 1,
              borderDash: [4, 3],
              label: {
                display: true,
                content: `Now: ${formatUsd(lastPrice)}`,
                position: "end",
                xAdjust: -6,
                backgroundColor: isPositive
                  ? "rgba(79, 195, 247, 0.2)"
                  : "rgba(255, 107, 138, 0.2)",
                color: lineColor,
                font: { size: 11, weight: "700", family: THEME.font },
                padding: { x: 5, y: 3 },
                borderRadius: 3,
              },
            },
          },
        },
      },
      layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      scales,
    },
  };
};
