import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Real login (CORE_MODE=api): Supabase Auth password grant, the same Auth project the Core verifies (JWKS).
// The access token is stored in an HttpOnly cookie and only used server-side by the BFF.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/login?error=config", request.url), 303);
  const form = await request.formData();
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=session", request.url), 303);
  }
  if (!response.ok) return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  const session = (await response.json()) as { access_token: string; expires_in: number };
  const res = NextResponse.redirect(new URL("/", request.url), 303);
  res.cookies.set(SESSION_COOKIE, session.access_token, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "strict", maxAge: Math.min(session.expires_in, 3600), path: "/" });
  return res;
}
