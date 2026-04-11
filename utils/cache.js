import { Redis } from "@upstash/redis";

const PREFIX = "crypto-bot:";
const DEFAULT_TTL = 60;

let client;
const getClient = () => {
  if (!client) client = Redis.fromEnv();
  return client;
};

export const getCached = async (key, fetcher, ttl = DEFAULT_TTL) => {
  const fullKey = PREFIX + key;

  try {
    const cached = await getClient().get(fullKey);
    if (cached !== null && cached !== undefined) return cached;
  } catch (err) {
    console.error("Redis GET failed:", err?.message);
  }

  const value = await fetcher();

  try {
    await getClient().set(fullKey, value, { ex: ttl });
  } catch (err) {
    console.error("Redis SET failed:", err?.message);
  }

  return value;
};
