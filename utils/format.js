function getChangeSymbol(value) {
  if (typeof value !== 'number') return '⚪';
  return value > 0 ? '🟢' : value < 0 ? '🔴' : '⚪';
}

function safeFixed(value) {
  const val = value >= 1 ? Number(value).toFixed(2) : value
  return typeof value === 'number' ? val : 'N/A';
}

function formatCryptoMessage(symbol, data) {
  const price = safeFixed(data?.price);
  const percentChange1h = safeFixed(data?.percent_change_1h);
  const percentChange24h = safeFixed(data?.percent_change_24h);
  const percentChange7d = safeFixed(data?.percent_change_7d);
  const percentChange30d = safeFixed(data?.percent_change_30d);

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
    `📊 ${symbol}:\n` +
    `💰 Price: $${price}\n` +
    `${changeSymbol1h} 1h Change: ${percentChange1h}%\n` +
    `${changeSymbol24h} 24h Change: ${percentChange24h}%\n` +
    `${changeSymbol7d} 7d Change: ${percentChange7d}%\n` +
    `${changeSymbol30d} 30d Change: ${percentChange30d}%\n\n` +
    `🕒 ${formattedDate}`
  );
}

module.exports = { formatCryptoMessage };