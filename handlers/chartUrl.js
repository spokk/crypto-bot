const CHART_DEFAULTS = {
  API_VERSION: "4",
  WIDTH: "1100",
  HEIGHT: "550",
  BACKGROUND_COLOR: "#1e1e2f",
  BASE_URL: "https://quickchart.io/chart",
};

export const buildQuickChartUrl = (chartConfig) => {
  const { BASE_URL, API_VERSION, WIDTH, HEIGHT, BACKGROUND_COLOR } =
    CHART_DEFAULTS;

  const url = new URL(BASE_URL);
  url.searchParams.set("v", API_VERSION);
  url.searchParams.set("width", WIDTH);
  url.searchParams.set("height", HEIGHT);
  url.searchParams.set("backgroundColor", BACKGROUND_COLOR);
  url.searchParams.set("c", JSON.stringify(chartConfig));

  return url.toString();
};
