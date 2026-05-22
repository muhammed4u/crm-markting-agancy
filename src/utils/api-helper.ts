import { NextResponse } from 'next/server';
import { checkRateLimit, verifyCsrf, verifyToken, sanitizeObject } from './security';
import { AuthService } from '@/services/auth.service';

export interface ApiRequestOptions {
  allowedRoles?: string[];
  rateLimitLimit?: number;
  rateLimitWindowMs?: number;
}

export async function handleApiRequest(
  request: Request,
  handler: (session: { user: any } | null, body: any) => Promise<any>,
  options?: ApiRequestOptions
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Rate Limiting
    const limitResult = checkRateLimit(
      ip,
      options?.rateLimitLimit || 100,
      options?.rateLimitWindowMs || 60000
    );
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limitResult.reset),
          },
        }
      );
    }

    // 2. CSRF Origin Protection
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const originValid = verifyCsrf(request.headers, null);
      if (!originValid) {
        return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
      }
    }

    // 3. Session Fetching
    const session = await AuthService.getSession();

    // 4. Role Authorization
    if (options?.allowedRoles) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
      }
      if (!options.allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: `Forbidden: Access restricted to roles: ${options.allowedRoles.join(', ')}` },
          { status: 403 }
        );
      }
    }

    // 5. Body Parsing and Sanitization
    let body = null;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json') && request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const rawBody = await request.json();
        body = sanitizeObject(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    // 6. Execute Handler
    const data = await handler(session, body);

    const response = NextResponse.json(data);

    // Apply security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:;"
    );

    return response;
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
