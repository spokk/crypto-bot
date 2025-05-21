export const buildQuickChartUrl = (chartConfig) => {
  const url = new URL('https://quickchart.io/chart');
  url.searchParams.set('v', '4');
  url.searchParams.set('width', '1100');
  url.searchParams.set('height', '500');
  url.searchParams.set('backgroundColor', '#1e1e2f');
  url.searchParams.set('c', JSON.stringify(chartConfig));
  return url.toString();
}