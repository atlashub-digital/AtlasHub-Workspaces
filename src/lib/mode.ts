// Which backend this deployment may use. Safe by default: nothing is served unless explicitly configured.
// - demo: synthetic personas and fixtures; only with CORE_MODE=demo and never on Vercel production.
// - api: real Core + Supabase login; needs an https Core URL and the Supabase project (local http only on loopback).
// - off: an honest "not available yet" screen instead of a login that cannot work.
export type Env = Record<string, string | undefined>;
export type Mode = "demo" | "api" | "off";

const httpsOrLoopback = (value?: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || ["127.0.0.1", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
};

export function resolveMode(env: Env): Mode {
  if (env.CORE_MODE === "demo") return env.VERCEL_ENV === "production" ? "off" : "demo";
  if (env.CORE_MODE === "api") return httpsOrLoopback(env.CORE_API_URL) && httpsOrLoopback(env.SUPABASE_URL) && Boolean(env.SUPABASE_PUBLISHABLE_KEY) ? "api" : "off";
  return "off";
}
