const CHART_DEFAULTS = {
  version: "4",
  width: 1100,
  height: 550,
  backgroundColor: "#1e1e2f",
  format: "png",
};

export const fetchChartBuffer = async (chartConfig) => {
  const response = await fetch("https://quickchart.io/chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...CHART_DEFAULTS, chart: chartConfig }),
  });

  if (!response.ok) {
    throw new Error(`QuickChart POST failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};
