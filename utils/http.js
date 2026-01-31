export const fetchCryptoQuote = async symbol => {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      Accept: "application/json",
    },
  });
  const data = await response.json();

  if (!data.data || !data.data[symbol]) {
    console.error("CoinMarketCap API response:", JSON.stringify(data, null, 2));
    throw new Error(`No data for symbol: ${symbol}`);
  }

  return data.data[symbol].quote.USD;
};

export const fetchFearAndGreed = async () => {
  const url = `https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      Accept: "application/json",
    },
  });
  const data = await response.json();

  if (!data.data) {
    console.error("CoinMarketCap API response:", JSON.stringify(data, null, 2));
    throw new Error(`No data for fear and greed index`);
  }

  return data.data;
};

export const fetchGlobalMetrics = async () => {
  const url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      Accept: "application/json",
    },
  });
  const data = await response.json();

  if (!data.data) {
    console.error("CoinMarketCap API response:", JSON.stringify(data, null, 2));
    throw new Error(`No data for global metrics`);
  }

  return data.data;
};

export const getCoinGeckoCoinList = async symbol => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${symbol}`,
    {
      headers: {
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
        Accept: "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch CoinGecko coin list");

  return await response.json();
};

export const fetchCoinGeckoMarketChart = async (
  coinId,
  days = 7,
  vsCurrency = "usd",
) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  const response = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error("Coin not found");

  return await response.json();
};

export const fetchCoinGeckoCoinData = async coinId => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;

  const response = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Coin not found");

  return await response.json();
};

export const fetchCoinGeckoTopData = async () => {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether-gold,kinesis-silver&order=market_cap_desc&per_page=20&sparkline=false";

  const response = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Top coins not found");

  return await response.json();
};
