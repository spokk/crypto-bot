export const formatCurrency = (value) =>
  value !== undefined && value !== null ? Number(value).toFixed(2) : "N/A";

export const formatBankRates = (name, icon, usd, eur, buyKey, sellKey) => {
  const usdVal = `Buy: ${formatCurrency(usd?.[buyKey])} ₴ · Sale: ${formatCurrency(usd?.[sellKey])} ₴`;
  const eurVal = `Buy: ${formatCurrency(eur?.[buyKey])} ₴ · Sale: ${formatCurrency(eur?.[sellKey])} ₴`;
  return [
    icon + " <b>" + name + "</b>",
    "💵 USD — " + usdVal,
    "💶 EUR — " + eurVal,
  ];
};

export const buildUahMessage = (pbRates, monoRates) => {
  const now = new Date();
  const dateStr = now.toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines = ["🇺🇦 <b>UAH Exchange Rates</b>", `<i>${dateStr}</i>`, ""];

  // PrivatBank
  const pbUsd = pbRates.find?.((r) => r.ccy === "USD");
  const pbEur = pbRates.find?.((r) => r.ccy === "EUR");
  lines.push(
    ...formatBankRates("PrivatBank", "🏦", pbUsd, pbEur, "buy", "sale"),
    "",
  );

  // MonoBank
  if (monoRates.length > 0) {
    const monoUsd = monoRates.find?.(
      (r) => r.currencyCodeA === 840 && r.currencyCodeB === 980,
    );
    const monoEur = monoRates.find?.(
      (r) => r.currencyCodeA === 978 && r.currencyCodeB === 980,
    );
    lines.push(
      ...formatBankRates(
        "MonoBank",
        "🐈‍⬛",
        monoUsd,
        monoEur,
        "rateBuy",
        "rateSell",
      ),
    );
  }

  return lines.join("\n");
};
