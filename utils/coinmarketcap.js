async function fetchCryptoQuote(symbol, apiKey) {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json'
    }
  });
  const data = await response.json();
  return data.data[symbol].quote.USD;
}

module.exports = { fetchCryptoQuote };