export const getChangeSymbol = value => {
  if (typeof value !== 'number') return '⚪';
  return value > 0 ? '🟢' : value < 0 ? '🔴' : '⚪';
};

export const safeFixed = (value, digits = 2) => {
  if (typeof value !== 'number') return 'N/A';
  const num = value >= 1 ? Number(value).toFixed(digits) : trimSmallNumber(value);
  return value >= 1 ? Number(num).toLocaleString('en-US') : num;
};

export const formatCryptoMessage = (symbol, data) => {
  const price = safeFixed(data?.price);
  const percentChange1h = Number(data?.percent_change_1h).toFixed(2);
  const percentChange24h = Number(data?.percent_change_24h).toFixed(2);
  const percentChange7d = Number(data?.percent_change_7d).toFixed(2);
  const percentChange30d = Number(data?.percent_change_30d).toFixed(2);

  const changeSymbol1h = getChangeSymbol(data?.percent_change_1h);
  const changeSymbol24h = getChangeSymbol(data?.percent_change_24h);
  const changeSymbol7d = getChangeSymbol(data?.percent_change_7d);
  const changeSymbol30d = getChangeSymbol(data?.percent_change_30d);

  const formattedDate = data?.last_updated
    ? new Date(data.last_updated).toLocaleString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  return (
    `🪙 ${symbol}:\n` +
    `💵 Price: $${price}\n` +
    `${changeSymbol1h} 1h Change: ${percentChange1h}%\n` +
    `${changeSymbol24h} 24h Change: ${percentChange24h}%\n` +
    `${changeSymbol7d} 7d Change: ${percentChange7d}%\n` +
    `${changeSymbol30d} 30d Change: ${percentChange30d}%\n\n` +
    `🕒 ${formattedDate}`
  );
};

export const trimSmallNumber = (num, maxDecimals = 8) => {
  if (typeof num !== 'number') return num;
  if (num === 0) return 0;
  // Convert to string with up to maxDecimals, remove trailing zeros
  let str = num.toFixed(maxDecimals);
  str = str.replace(/\.?0+$/, '');
  return Number(str);
};