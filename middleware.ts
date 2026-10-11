import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = (request.headers.get('host') || '').toLowerCase();

  // ── Subdomain Detection ──────────────────────────────────────────────────
  // Works for: kupera.in, app.kupera.in, admin.kupera.in,
  //            localhost:3000, app.localhost:3000, admin.localhost:3000
  const isAdminSubdomain = hostname.startsWith('admin.');
  const isAppSubdomain = hostname.startsWith('app.');
  const isRootDomain = !isAdminSubdomain && !isAppSubdomain;

  // ── Skip internal Next.js paths & static assets ───────────────────────────
  const isInternal =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.');

  if (isInternal) return addSecurityHeaders(NextResponse.next());

  // ── ADMIN SUBDOMAIN (admin.kupera.in) ─────────────────────────────────────
  if (isAdminSubdomain) {
    // Root → Super Admin Dashboard
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/admin/dashboard';
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
    // Shared or public tenant view routes shouldn't be blocked if accessed
    if (url.pathname.startsWith('/tenant/')) {
      return addSecurityHeaders(NextResponse.next());
    }
    // Ensure admin pages map cleanly
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ── APP SUBDOMAIN (app.kupera.in) — Hostel Manager Portal ────────────────
  if (isAppSubdomain) {
    // Root → Hostel Manager Dashboard
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/app/dashboard';
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
    // Allow login and signup on app subdomain
    if (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/tenant/')) {
      return addSecurityHeaders(NextResponse.next());
    }
    // Block admin routes on app subdomain
    if (url.pathname.startsWith('/admin')) {
      url.pathname = '/app/dashboard';
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
    // Prefix routes without /app to /app/* (e.g. /dashboard -> /app/dashboard)
    if (!url.pathname.startsWith('/app')) {
      url.pathname = `/app${url.pathname}`;
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ── ROOT DOMAIN (kupera.in or localhost:3000) ─────────────────────────────
  if (isRootDomain) {
    const isLocalhost =
      hostname.includes('localhost') ||
      hostname.includes('127.0.0.1') ||
      hostname.startsWith('localhost:');

    // On localhost, allow direct testing of all portals
    if (isLocalhost) {
      if (url.pathname === '/' || url.pathname === '') {
        url.pathname = '/marketing';
        return addSecurityHeaders(NextResponse.rewrite(url));
      }
      return addSecurityHeaders(NextResponse.next());
    }

    // In production root domain (kupera.in):
    // Public tenant read-only view and pay links must work smoothly
    if (url.pathname.startsWith('/tenant/')) {
      return addSecurityHeaders(NextResponse.next());
    }

    // Allow shared auth routes if visited directly
    if (
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/marketing')
    ) {
      return addSecurityHeaders(NextResponse.next());
    }

    // Redirect or rewrite internal /admin or /app paths on root domain to their dedicated subdomains
    if (url.pathname.startsWith('/admin')) {
      return addSecurityHeaders(NextResponse.redirect(new URL(`https://admin.kupera.in${url.pathname}`)));
    }
    if (url.pathname.startsWith('/app')) {
      return addSecurityHeaders(NextResponse.redirect(new URL(`https://app.kupera.in${url.pathname}`)));
    }

    // Root domain homepage / → Kupera Marketing Landing Page
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/marketing';
      return addSecurityHeaders(NextResponse.rewrite(url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  return addSecurityHeaders(NextResponse.next());
}

/** Attach strict enterprise security headers */
function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Enforce HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  // Restrict browser features and sensors
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};
