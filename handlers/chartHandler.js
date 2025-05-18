const { getCoinGeckoCoinList, fetchCoinGeckoMarketChart } = require('../utils/http');
const { formatPrices, formatLabels } = require('../utils/chartUtils');

const { getChartConfig } = require('./chartConfig');
const { buildQuickChartUrl } = require('./chartUrl');

async function chartHandler(symbol) {
  try {
    // Fetch coin list and find the coin by symbol
    const { coins } = await getCoinGeckoCoinList(symbol);
    const coin = coins.find(c => c.symbol === symbol);

    if (!coin) return;

    // Fetch market chart data
    const chart = await fetchCoinGeckoMarketChart(coin.id);

    // Prepare price and label arrays
    const prices = formatPrices(chart.prices);
    const labels = formatLabels(chart.prices);

    // Get chart config from separate file
    const chartConfig = getChartConfig(symbol, labels, prices);

    return buildQuickChartUrl(chartConfig);
  } catch (err) {
    console.error('Could not fetch chart for this coin.', err);
  }
}

module.exports = { chartHandler };