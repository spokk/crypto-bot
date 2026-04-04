const CHART_DEFAULTS = {
  version: "4",
  width: 1100,
  height: 550,
  backgroundColor: "#1e1e2f",
  format: "png",
};

const jsStringify = (obj, indent = 0) => {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj === "function") return obj.toString();
  if (typeof obj === "string") return JSON.stringify(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    const items = obj.map((item) => jsStringify(item, indent + 1));
    return `[${items.join(",")}]`;
  }
  const entries = Object.entries(obj)
    .filter(([, v]) => v !== undefined)
    .map(
      ([key, value]) =>
        `${JSON.stringify(key)}:${jsStringify(value, indent + 1)}`,
    );
  return `{${entries.join(",")}}`;
};

export const fetchChartBuffer = async (chartConfig) => {
  const body = JSON.stringify({
    ...CHART_DEFAULTS,
    chart: jsStringify(chartConfig),
  });

  const response = await fetch("https://quickchart.io/chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error(`QuickChart POST failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};
