// import { NextRequest, NextResponse } from "next/server";
// import { verifyAccessToken } from "@/lib/auth/jwt";
// import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

// const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
// const ONBOARDING_ROUTE = "/onboarding";

// /**
//  * Route guard. Runs on the edge before every matched request:
//  *  - Redirects unauthenticated users away from protected routes.
//  *  - Redirects authenticated users away from auth pages.
//  *  - Leaves onboarding-completion checks to the (onboarding) layout,
//  *    which has DB access that the edge runtime does not.
//  */
// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

//   let isAuthenticated = false;
//   if (token) {
//     try {
//       verifyAccessToken(token);
//       isAuthenticated = true;
//     } catch {
//       isAuthenticated = false;
//     }
//   }

//   const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

//   if (!isAuthenticated && !isPublicRoute) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirectTo", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   if (isAuthenticated && isPublicRoute) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all routes except static assets, images, and Next.js internals.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
//   ],
// };
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      verifyAccessToken(token);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};