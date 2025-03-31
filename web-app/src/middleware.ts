import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserAuthState } from "./lib/auth_actions";

export async function middleware(request: NextRequest) {
  const authed = await getUserAuthState();
  if (request.nextUrl.pathname.startsWith("/login")) {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  if (request.nextUrl.pathname.startsWith("/signup")) {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}
