const CHART_DEFAULTS = {
  API_VERSION: '4',
  WIDTH: '1100',
  HEIGHT: '500',
  BACKGROUND_COLOR: '#1e1e2f',
  BASE_URL: 'https://quickchart.io/chart'
};

export const buildQuickChartUrl = (chartConfig) => {
  // Validate input
  if (!chartConfig || typeof chartConfig !== 'object') {
    throw new Error('chartConfig must be a valid object');
  }

  try {
    const url = new URL(CHART_DEFAULTS.BASE_URL);
    url.searchParams.set('v', CHART_DEFAULTS.API_VERSION);
    url.searchParams.set('width', CHART_DEFAULTS.WIDTH);
    url.searchParams.set('height', CHART_DEFAULTS.HEIGHT);
    url.searchParams.set('backgroundColor', CHART_DEFAULTS.BACKGROUND_COLOR);
    url.searchParams.set('c', JSON.stringify(chartConfig));

    return url.toString();
  } catch (error) {
    throw new Error(`Failed to build chart URL: ${error.message}`);
  }
};