import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(DEMO_COOKIE);
  return res;
}
