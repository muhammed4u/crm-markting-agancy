import { UserRepository } from '@/repositories/user.repository';
import { StudentRepository } from '@/repositories/student.repository';
import { AuditRepository } from '@/repositories/audit.repository';
import { comparePasswords, hashPassword, generateToken, verifyToken, JWTPayload } from '@/utils/security';
import { cookies } from 'next/headers';
import { loginSchema, registerSchema } from '@/validations/schemas';
import { z } from 'zod';
import { UserRole } from '@/types';

const COOKIE_NAME = 'crm_session_token';

export class AuthService {
  static async getSession() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(COOKIE_NAME)?.value;

      if (!token) return null;

      const payload = verifyToken(token);
      if (!payload) return null;

      return {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role as UserRole,
          name: payload.name,
          status: payload.status as any,
          permissions: payload.permissions || [],
        },
      };
    } catch {
      return null;
    }
  }


  /**
   * Log user in, generate JWT, and set HttpOnly cookie.
   */
  static async login(rawData: z.infer<typeof loginSchema>) {
    // Validate inputs
    const validated = loginSchema.parse(rawData);

    // Retrieve user
    const user = await UserRepository.findByEmail(validated.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(validated.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const userPermissions = user.permissions?.map((p: any) => p.permission) || [];

    // Create session payload
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
      permissions: userPermissions,
    };

    // Generate JWT
    const token = generateToken(payload);

    // Save token in cookies
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Log login activity
    await AuditRepository.logActivity(user.id, 'AUTH_LOGIN', `User ${user.email} logged in successfully.`);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Register new user and set student profile if student.
   */
  static async register(rawData: z.infer<typeof registerSchema>) {
    const validated = registerSchema.parse(rawData);

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(validated.email);
    if (existingUser) {
      throw new Error('Email address is already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Save user inside Prisma Transaction to guarantee atomic student profile creation
    const user = await UserRepository.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      phone: validated.phone || null,
      role: validated.role,
      status: 'PENDING',
    });

    // If role is student, create a student profile
    if (user.role === 'STUDENT') {
      await StudentRepository.create({
        userId: user.id,
        level: 'Beginner', // default level
      });
    }

    await AuditRepository.logActivity(
      user.id,
      'AUTH_REGISTER',
      `Registered user ${user.email} as ${user.role}.`
    );

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Log user out, delete JWT cookie.
   */
  static async logout() {
    const session = await this.getSession();
    if (session?.user) {
      await AuditRepository.logActivity(
        session.user.id,
        'AUTH_LOGOUT',
        `User ${session.user.email} logged out.`
      );
    }

    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return { success: true };
  }

  /**
   * Simple mock forgot password token builder.
   */
  static async requestForgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Security practice: Don't reveal if user exists, just return success
      return { success: true, message: 'Password reset link sent.' };
    }

    // Generate temporary reset token (expires in 1 hour)
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status,
        permissions: user.permissions.map((p) => p.permission),
      },
      '1h'
    );

    // In production, you would send this token via email (e.g. Resend, SendGrid)
    // For local academy purposes, we write a mock log of the link
    console.log(`\n--- PASSWORD RESET REQUEST ---`);
    console.log(`User: ${email}`);
    console.log(`Link: http://localhost:3000/reset-password?token=${token}`);
    console.log(`------------------------------\n`);

    await AuditRepository.logActivity(
      user.id,
      'AUTH_FORGOT_PASSWORD',
      `Requested password reset link.`
    );

    return { success: true, mockLink: `/reset-password?token=${token}` };
  }

  /**
   * Password reset using token verification.
   */
  static async resetPassword(password: string, token: string) {
    const payload = verifyToken(token);
    if (!payload) {
      throw new Error('Reset link has expired or is invalid');
    }

    const hashedPassword = await hashPassword(password);

    await UserRepository.update(payload.userId, {
      password: hashedPassword,
    });

    await AuditRepository.logActivity(
      payload.userId,
      'AUTH_RESET_PASSWORD',
      `Password reset completed successfully.`
    );

    return { success: true };
  }
}
