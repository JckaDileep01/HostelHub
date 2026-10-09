import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // ── Detect subdomain ──────────────────────────────────────────────────────
  // Works for: localhost:3000, admin.localhost:3000, app.localhost:3000
  //            hostelhub.app, admin.hostelhub.app, app.hostelhub.app
  const isAdminSubdomain = hostname.startsWith('admin.');
  const isAppSubdomain = hostname.startsWith('app.');
  const isRootDomain = !isAdminSubdomain && !isAppSubdomain;

  // ── Skip internal Next.js paths & static assets ───────────────────────────
  const isInternal =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.');

  if (isInternal) return NextResponse.next();

  // ── ADMIN SUBDOMAIN (admin.hostelhub.app) ─────────────────────────────────
  if (isAdminSubdomain) {
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/admin/dashboard';
      return NextResponse.rewrite(url);
    }
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── APP SUBDOMAIN (app.hostelhub.app) — Hostel Manager Portal ────────────
  if (isAppSubdomain) {
    // Root → hostel manager dashboard
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/app/dashboard';
      return NextResponse.rewrite(url);
    }
    // /login and /signup are shared auth pages — allow them
    if (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')) {
      return NextResponse.next();
    }
    // Block admin pages from being accessed on app subdomain
    if (url.pathname.startsWith('/admin')) {
      url.pathname = '/app/dashboard';
      return NextResponse.rewrite(url);
    }
    // If path doesn't start with /app, prefix it (e.g. /dashboard → /app/dashboard)
    if (!url.pathname.startsWith('/app')) {
      url.pathname = `/app${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── ROOT DOMAIN (hostelhub.app) — Marketing Landing Page ─────────────────
  if (isRootDomain) {
    // Allow /login and /signup on root domain (shared auth)
    if (
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/marketing')
    ) {
      return NextResponse.next();
    }

    // Block /admin and /app routes on root domain → show marketing
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/app')) {
      url.pathname = '/marketing';
      return NextResponse.rewrite(url);
    }

    // Root / → marketing landing page
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/marketing';
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};
