import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'crm_session_token';

// Edge-safe JWT payload decoder
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isValidToken(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false;
  return Date.now() < payload.exp * 1000;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static assets, API, Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const hasValidToken = token ? isValidToken(token) : false;

  // If user has a valid token, decode the payload
  let payload: any = null;
  if (hasValidToken && token) {
    payload = decodeJwt(token);
  }

  const userStatus = payload?.status;
  const userRole = payload?.role;
  const userPermissions: string[] = payload?.permissions || [];

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isPendingPage = pathname === '/pending-approval';
  const isRejectedPage = pathname === '/access-rejected';

  // 1. Session check: if not logged in and accessing protected pages
  if (!hasValidToken) {
    if (pathname.startsWith('/dashboard') || isPendingPage || isRejectedPage) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(url);
      if (token) {
        response.cookies.delete(COOKIE_NAME);
      }
      return response;
    }
    return NextResponse.next();
  }

  // 2. Redirect logged-in users based on their status
  if (userStatus === 'PENDING') {
    if (!isPendingPage) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.next();
  }

  if (userStatus === 'REJECTED') {
    if (!isRejectedPage) {
      return NextResponse.redirect(new URL('/access-rejected', request.url));
    }
    return NextResponse.next();
  }

  // If status is APPROVED, block access to pending/rejected pages
  if (userStatus === 'APPROVED') {
    if (isPendingPage || isRejectedPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. For Auth Pages, redirect valid APPROVED sessions to dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Granular Permission Guarding inside /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    // ADMIN has bypass privileges
    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }

    // CRM Leads
    if (pathname.startsWith('/dashboard/leads')) {
      if (!userPermissions.includes('leads:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Students
    if (pathname.startsWith('/dashboard/students')) {
      if (!userPermissions.includes('students:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Courses & Syllabus
    if (pathname.startsWith('/dashboard/courses')) {
      if (!userPermissions.includes('courses:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Invoices / Payments
    if (pathname.startsWith('/dashboard/payments')) {
      if (!userPermissions.includes('payments:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Attendance
    if (pathname.startsWith('/dashboard/attendance')) {
      if (!userPermissions.includes('attendance:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Tasks Management
    if (pathname.startsWith('/dashboard/tasks')) {
      if (!userPermissions.includes('tasks:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Reports / Revenue Analytics
    if (pathname.startsWith('/dashboard/reports')) {
      if (!userPermissions.includes('reports:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // User Directory
    if (pathname.startsWith('/dashboard/users')) {
      if (!userPermissions.includes('users:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }

    // Settings Configuration
    if (pathname.startsWith('/dashboard/settings')) {
      if (!userPermissions.includes('settings:read')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pending-approval',
    '/access-rejected',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
