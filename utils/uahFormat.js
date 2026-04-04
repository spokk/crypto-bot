const ICONS = { USD: "💵", EUR: "💶" };
const CURRENCIES = ["USD", "EUR"];
const MONO_CODES = { USD: 840, EUR: 978 };
export const formatCurrency = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return typeof num === "number" && !isNaN(num) ? num.toFixed(2) : "N/A";
};

const findCurrency = (rates, predicate) => rates?.find?.(predicate);

const formatCurrencyLine = (icon, code, rates, buyKey, sellKey) => {
  const buy = formatCurrency(rates?.[buyKey]);
  const sell = formatCurrency(rates?.[sellKey]);
  return `${icon} ${code} — Buy: ${buy} ₴ · Sale: ${sell} ₴`;
};

export const formatBankRates = (name, icon, usd, eur, buyKey, sellKey) => [
  `${icon} <b>${name}</b>`,
  formatCurrencyLine("💵", "USD", usd, buyKey, sellKey),
  formatCurrencyLine("💶", "EUR", eur, buyKey, sellKey),
];

export const formatNbuRates = (nbuRates) => {
  if (!nbuRates?.length) return [];

  const lines = ["🏦 <b>NBU Official Rates</b>"];
  CURRENCIES.forEach((cc) => {
    const rate = nbuRates.find((r) => r.cc === cc);
    if (rate) {
      lines.push(`${ICONS[cc]} ${cc} — ${formatCurrency(rate.rate)} ₴`);
    }
  });
  return lines;
};

export const buildUahMessage = (pbRates, monoRates, nbuRates) => {
  const lines = ["🇺🇦 <b>UAH Exchange Rates</b>", ""];

  // PrivatBank
  const pbUsd = findCurrency(pbRates, (r) => r.ccy === "USD");
  const pbEur = findCurrency(pbRates, (r) => r.ccy === "EUR");

  lines.push(
    ...formatBankRates("PrivatBank", "🏦", pbUsd, pbEur, "buy", "sale"),
    "",
  );

  // MonoBank
  if (monoRates?.length) {
    lines.push(
      ...formatBankRates(
        "MonoBank",
        "🐈‍⬛",
        findCurrency(
          monoRates,
          (r) => r.currencyCodeA === MONO_CODES.USD && r.currencyCodeB === 980,
        ),
        findCurrency(
          monoRates,
          (r) => r.currencyCodeA === MONO_CODES.EUR && r.currencyCodeB === 980,
        ),
        "rateBuy",
        "rateSell",
      ),
      "",
    );
  }

  // NBU Official Rates
  const nbuLines = formatNbuRates(nbuRates);
  if (nbuLines.length) lines.push(...nbuLines);

  return lines.join("\n");
};
