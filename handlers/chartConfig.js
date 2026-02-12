const TICK_COLOR = "#e0e0e0";
const LABEL_COLOR = "#f0f0f0";
const GRID_COLOR = "rgba(255, 255, 255, 0.08)";
const FONT_FAMILY = "Segoe UI, sans-serif";

const LINE_COLOR = "#4fc3f7";
const FILL_COLOR = "rgba(0, 122, 204, 0.1)";
const TOOLTIP_BG = "#2c2c3a";

const UP_COLOR = "#26a69a";
const DOWN_COLOR = "#ef5350";
const ANNOTATION_COLOR = "rgba(255, 255, 255, 0.45)";
const AVG_COLOR = "rgba(255, 193, 7, 0.6)";
const VOLUME_COLOR = "rgba(255, 255, 255, 0.08)";

const formatUsd = (value) => {
  if (typeof value !== "number") return "N/A";
  if (value >= 1) return "$" + value.toLocaleString("en-US");
  return "$" + value;
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
    font: { size: 12, family: FONT_FAMILY },
    padding: 4,
  },
});

const buildYScale = (position, paddedMin, paddedMax, showGrid) => ({
  position,
  min: paddedMin,
  max: paddedMax,
  ticks: {
    color: TICK_COLOR,
    font: {
      size: 16,
      family: FONT_FAMILY,
      weight: "700",
    },
    padding: 6,
    callback: (val) => formatUsd(val),
  },
  grid: showGrid
    ? { color: GRID_COLOR, borderColor: "transparent" }
    : { display: false },
});

export const getChartConfig = (symbol, labels, prices, coinData, volumes) => {
  const numericPrices = prices.map(Number);
  const min = Math.min(...numericPrices);
  const max = Math.max(...numericPrices);
  const avg = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;

  // Add 5% padding
  const range = max - min;
  let paddedMin = min - range * 0.05;
  let paddedMax = max + range * 0.05;

  // Round to nearest "nice" number
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1);
  paddedMin = Math.floor(paddedMin / magnitude) * magnitude;
  paddedMax = Math.ceil(paddedMax / magnitude) * magnitude;

  const high24 = coinData?.market_data?.high_24h?.usd;
  const low24 = coinData?.market_data?.low_24h?.usd;
  const change24 = coinData?.market_data?.price_change_percentage_24h;

  const changeStr =
    typeof change24 === "number"
      ? `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`
      : "";

  // Annotation lines for 7d high, low, and average
  const annotations = {
    highLine: buildAnnotationLine("7d High", max, ANNOTATION_COLOR),
    lowLine: buildAnnotationLine("7d Low", min, ANNOTATION_COLOR),
    avgLine: buildAnnotationLine("7d Avg", avg, AVG_COLOR, [4, 4]),
  };

  // Datasets
  const datasets = [
    {
      label: `${symbol.toUpperCase()} ${changeStr}`,
      data: prices,
      fill: {
        target: "origin",
        above: FILL_COLOR,
      },
      borderColor: LINE_COLOR,
      pointBackgroundColor: LINE_COLOR,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      yAxisID: "y",
      segment: {
        borderColor: (ctx) =>
          ctx.p0.parsed.y <= ctx.p1.parsed.y ? UP_COLOR : DOWN_COLOR,
      },
    },
  ];

  // Volume bars on secondary axis
  if (volumes && volumes.length > 0) {
    datasets.push({
      label: "Volume",
      data: volumes,
      type: "bar",
      backgroundColor: VOLUME_COLOR,
      borderColor: "transparent",
      borderWidth: 0,
      yAxisID: "volume",
      order: 1,
    });
  }

  const scales = {
    x: {
      ticks: {
        color: TICK_COLOR,
        font: {
          size: 13,
          family: FONT_FAMILY,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      grid: {
        color: GRID_COLOR,
        borderColor: "transparent",
      },
    },
    y: buildYScale("right", paddedMin, paddedMax, true),
    y_left: buildYScale("left", paddedMin, paddedMax, false),
  };

  // Volume axis — takes up bottom 20% of chart area, hidden ticks
  if (volumes && volumes.length > 0) {
    const maxVolume = Math.max(...volumes);
    scales.volume = {
      position: "left",
      min: 0,
      max: maxVolume * 5,
      display: false,
      grid: { display: false },
    };
  }

  // Title subtitle with 24h high/low
  const subtitleParts = [];
  if (typeof high24 === "number")
    subtitleParts.push(`24h High: ${formatUsd(high24)}`);
  if (typeof low24 === "number")
    subtitleParts.push(`24h Low: ${formatUsd(low24)}`);

  return {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: LABEL_COLOR,
            font: {
              size: 18,
              weight: "700",
              family: FONT_FAMILY,
            },
            padding: 10,
            filter: (item) => item.text.indexOf("Volume") === -1,
          },
        },
        title: {
          display: subtitleParts.length > 0,
          text: subtitleParts.join("  |  "),
          color: "#e0e0e0",
          font: {
            size: 15,
            weight: "600",
            family: FONT_FAMILY,
          },
          padding: { top: 0, bottom: 4 },
        },
        tooltip: {
          backgroundColor: TOOLTIP_BG,
          titleColor: "#ffffff",
          bodyColor: "#dddddd",
          borderColor: "#555",
          borderWidth: 1,
          titleFont: {
            weight: "600",
          },
        },
        annotation: {
          annotations,
        },
      },
      layout: {
        padding: {
          top: 2,
          bottom: 6,
          left: 12,
          right: 12,
        },
      },
      scales,
    },
  };
};
