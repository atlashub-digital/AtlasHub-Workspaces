import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CoreError } from "./contract.ts";
import { DemoCore } from "./core/demo.ts";
import { HttpCore } from "./core/http.ts";
import type { Core } from "./core/types.ts";

export const SESSION_COOKIE = "ws_session";
export const DEMO_COOKIE = "ws_demo_user";

/** demo (default): synthetic sandbox data. api: real Core via BFF (needs CORE_API_URL + Supabase login). */
export function coreMode(): "demo" | "api" {
  return process.env.CORE_MODE === "api" ? "api" : "demo";
}

/** The Core client for the current request, or a redirect to /login. */
export async function requireCore(): Promise<Core> {
  const jar = await cookies();
  if (coreMode() === "demo") {
    const user = jar.get(DEMO_COOKIE)?.value;
    if (!user) redirect("/login");
    return new DemoCore(user);
  }
  const token = jar.get(SESSION_COOKIE)?.value;
  const base = process.env.CORE_API_URL;
  if (!token || !base) redirect("/login");
  return new HttpCore(base, token);
}

/** Maps Core errors to navigation: 401 → login; 403/404 → caller decides (notFound / locked). */
export function onCoreError(e: unknown): never {
  if (e instanceof CoreError && e.status === 401) redirect("/login");
  throw e;
}
