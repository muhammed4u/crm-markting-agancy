import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-marketing-academy-crm-key-change-in-prod';

// --- Password Hashing ---
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- JWT Token Operations ---
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  status: string;
  permissions: string[];
}

export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.status !== 'APPROVED') return false;
  return user.permissions?.includes(permission) || false;
}

export function generateToken(payload: JWTPayload, expiresIn: string | number = '1d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// --- Input Sanitization ---
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (newObj as any)[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      (newObj as any)[key] = sanitizeObject(value);
    } else {
      (newObj as any)[key] = value;
    }
  }
  return newObj as T;
}

// --- In-Memory Rate Limiting ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string,
  limit = 100,
  windowMs = 60000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record exists or window expired, reset
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  // If over limit, block
  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  // Increment count
  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}

// --- CSRF Origin Protection ---
export function verifyCsrf(headers: { get: (name: string) => string | null }, origin: string | null): boolean {
  const host = headers.get('host') || '';
  const referer = headers.get('referer') || '';
  const requestOrigin = headers.get('origin') || '';

  // If no origin or referer, or running in local dev, allow
  if (process.env.NODE_ENV === 'development') return true;

  if (requestOrigin) {
    return requestOrigin.includes(host);
  }

  if (referer) {
    return referer.includes(host);
  }

  return false;
}
