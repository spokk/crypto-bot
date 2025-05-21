export const buildQuickChartUrl = (chartConfig) => {
  const url = new URL('https://quickchart.io/chart');
  url.searchParams.set('v', '4');
  url.searchParams.set('width', '1100');
  url.searchParams.set('height', '500');
  url.searchParams.set('backgroundColor', 'rgb(19, 19, 19)');
  url.searchParams.set('c', JSON.stringify(chartConfig));
  return url.toString();
}