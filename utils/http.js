async function fetchCryptoQuote(symbol) {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
      'Accept': 'application/json'
    }
  });
  const data = await response.json();

  if (!data.data || !data.data[symbol]) {
    console.error('CoinMarketCap API response:', JSON.stringify(data, null, 2));
    throw new Error(`No data for symbol: ${symbol}`);
  }

  return data.data[symbol].quote.USD;
}

async function getCoinGeckoCoinList(symbol) {
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`, {
    headers: {
      'x-cg-demo-api-key': process.env.COINMARKETCAP_API_KEY
    }
  });
  if (!response.ok) throw new Error('Failed to fetch CoinGecko coin list');
  return await response.json();
}

module.exports = { fetchCryptoQuote, getCoinGeckoCoinList };