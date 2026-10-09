import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/core/demo-users";
import { coreMode, DEMO_COOKIE } from "@/lib/session";

// Demo login: picks a fictitious persona. Disabled outside CORE_MODE=demo.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (coreMode() !== "demo") return NextResponse.json({ error: "Modo demonstração desligado" }, { status: 404 });
  const user = String((await request.formData()).get("user") ?? "");
  if (!DEMO_USERS.includes(user)) return NextResponse.redirect(new URL("/login?error=session", request.url), 303);
  const res = NextResponse.redirect(new URL("/", request.url), 303);
  res.cookies.set(DEMO_COOKIE, user, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "strict", maxAge: 8 * 3600, path: "/" });
  return res;
}
