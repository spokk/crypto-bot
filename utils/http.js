export const fetchCryptoQuote = async (symbol) => {
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
};

export const getCoinGeckoCoinList = async (symbol) => {
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`, {
    headers: {
      'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch CoinGecko coin list');

  return await response.json();
};

export const fetchCoinGeckoMarketChart = async (coinId, days = 7, vsCurrency = 'usd') => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Coin not found');

  return await response.json();
};