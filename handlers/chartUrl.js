const CHART_DEFAULTS = {
  API_VERSION: "4",
  WIDTH: "1100",
  HEIGHT: "550",
  BACKGROUND_COLOR: "#1e1e2f",
  BASE_URL: "https://quickchart.io/chart",
};

export const buildQuickChartUrl = (chartConfig) => {
  if (
    !chartConfig ||
    typeof chartConfig !== "object" ||
    Array.isArray(chartConfig)
  ) {
    throw new TypeError("chartConfig must be a valid object");
  }

  try {
    const { BASE_URL, API_VERSION, WIDTH, HEIGHT, BACKGROUND_COLOR } =
      CHART_DEFAULTS;

    const url = new URL(BASE_URL);

    const params = {
      v: API_VERSION,
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: BACKGROUND_COLOR,
      c: JSON.stringify(chartConfig),
    };

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  } catch (error) {
    throw new Error("Failed to build chart URL", { cause: error });
  }
};
