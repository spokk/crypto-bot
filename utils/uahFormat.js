const ICONS = { USD: "💵", EUR: "💶" };
const CURRENCIES = ["USD", "EUR"];
const MONO_CODES = { USD: 840, EUR: 978 };
const DATE_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

export const formatCurrency = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const formatted =
    typeof num === "number" && !isNaN(num) ? num.toFixed(2) : "N/A";
  console.log(`formatCurrency(${value}) => ${formatted}`);
  return formatted;
};

const findCurrency = (rates, predicate) => rates?.find?.(predicate);

const formatCurrencyLine = (icon, code, rates, buyKey, sellKey) => {
  console.log(
    `formatCurrencyLine - Finding ${code}: rates=`,
    rates,
    `buyKey=${buyKey}, sellKey=${sellKey}`,
  );
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
  console.log("buildUahMessage - pbRates:", JSON.stringify(pbRates, null, 2));
  console.log(
    "buildUahMessage - monoRates:",
    JSON.stringify(monoRates, null, 2),
  );
  console.log("buildUahMessage - nbuRates:", JSON.stringify(nbuRates, null, 2));

  const lines = ["🇺🇦 <b>UAH Exchange Rates</b>", ""];

  // PrivatBank
  const pbUsd = findCurrency(pbRates, (r) => r.ccy === "USD");
  const pbEur = findCurrency(pbRates, (r) => r.ccy === "EUR");
  console.log("PrivatBank USD:", JSON.stringify(pbUsd, null, 2));
  console.log("PrivatBank EUR:", JSON.stringify(pbEur, null, 2));

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
