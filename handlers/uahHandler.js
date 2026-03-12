import { fetchPrivatBankRates, fetchMonoBankRates } from "../utils/http.js";
import { buildUahMessage } from "../utils/uahFormat.js";

export const uahHandler = async () => {
  const [pbRes, monoRes] = await Promise.allSettled([
    fetchPrivatBankRates(),
    fetchMonoBankRates(),
  ]);

  const pbRates = pbRes.status === "fulfilled" ? pbRes.value : [];
  if (pbRes.status === "rejected")
    console.error("PrivatBank fetch failed:", pbRes.reason);

  const monoRates = monoRes.status === "fulfilled" ? monoRes.value : [];
  if (monoRes.status === "rejected")
    console.error("MonoBank fetch failed:", monoRes.reason);

  return buildUahMessage(pbRates, monoRates);
};
