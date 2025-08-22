import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
//   const url = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  //   if (
  //     token &&
  //     (url.pathname.startsWith("/signin") ||
  //       url.pathname.startsWith("/signup") ||
  //       url.pathname.startsWith("/verify") ||
  //       url.pathname === "/")
  //   ) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }

  //   if(!token && url.pathname.startsWith("/dashboard")) {
  //     return NextResponse.redirect(new URL("/signin", request.url));
  //   }

  //   return NextResponse.next();
}

// export const config = {
//   matcher: ["/signin", "/signup", "/", "/dashboard/:path*", "/verify/:path*"],
// };
