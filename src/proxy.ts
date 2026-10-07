import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tres_admin_session";

/**
 * Edge guard for the admin area: unauthenticated visitors never reach admin
 * pages. Full session validation happens server-side in the admin layout,
 * server actions and API handlers.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminArea || pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
