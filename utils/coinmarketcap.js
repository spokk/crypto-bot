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

module.exports = { fetchCryptoQuote };