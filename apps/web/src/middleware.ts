import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);
  const accessToken = request.cookies.get("accessToken")?.value;

  // Redirect unauthenticated users from /dashboard and /restaurant routes
  if (!accessToken && (request.nextUrl.pathname === "/dashboard" || request.nextUrl.pathname.startsWith("/restaurant"))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if( accessToken && (request.nextUrl.pathname.startsWith("/signin") || request.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/signin", "/signup", "/", "/dashboard/:path*", "/restaurant/:path*"],
};
