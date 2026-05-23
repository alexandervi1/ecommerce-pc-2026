import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-client-ip", ip);
  requestHeaders.set("x-user-agent", userAgent);

  const protectedPaths = ["/admin", "/account", "/checkout", "/api/admin", "/api/profile", "/api/orders", "/api/cart", "/api/builds", "/api/wishlist"];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  if (isProtectedPath) {
    // Auth.js v5 can use multiple cookie names depending on environment and version
    const sessionToken = 
      request.cookies.get("next-auth.session-token")?.value || 
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken && !path.startsWith("/api")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const adminPaths = ["/admin"];
  const isAdminPath = adminPaths.some((p) => path.startsWith(p));
  const isAuditOnlyPath = path.startsWith("/admin/audit");

  if (isAdminPath && !isAuditOnlyPath) {
    response.headers.set("x-requires-admin", "true");
  }
  if (isAuditOnlyPath) {
    response.headers.set("x-requires-auditor", "true");
  }

  response.headers.set("x-request-duration", (Date.now() - startTime).toString());
  return response;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/api/:path*",
    "/auditor/:path*",
  ],
};
