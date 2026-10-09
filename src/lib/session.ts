import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CoreError } from "./contract.ts";
import { DemoCore } from "./core/demo.ts";
import { HttpCore } from "./core/http.ts";
import type { Core } from "./core/types.ts";
import { resolveMode, type Mode } from "./mode.ts";

export const SESSION_COOKIE = "ws_session";
export const DEMO_COOKIE = "ws_demo_user";

/** See ./mode.ts: demo (explicit, never on Vercel production) · api (Core + Supabase configured) · off. */
export function coreMode(): Mode {
  return resolveMode(process.env);
}

/** The Core client for the current request, or a redirect to /login. */
export async function requireCore(): Promise<Core> {
  const jar = await cookies();
  const mode = coreMode();
  if (mode === "off") redirect("/login");
  if (mode === "demo") {
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
