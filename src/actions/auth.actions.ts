'use server';

import { AuthService } from '@/services/auth.service';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@/validations/schemas';

export async function loginAction(formData: any) {
  try {
    const validated = loginSchema.parse(formData);
    const result = await AuthService.login(validated);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Authentication failed' };
  }
}

export async function registerAction(formData: any) {
  try {
    const validated = registerSchema.parse(formData);
    const result = await AuthService.register(validated);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Registration failed' };
  }
}

export async function logoutAction() {
  try {
    await AuthService.logout();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Logout failed' };
  }
}

export async function forgotPasswordAction(formData: any) {
  try {
    const validated = forgotPasswordSchema.parse(formData);
    const result = await AuthService.requestForgotPassword(validated.email);
    return { success: true, mockLink: result.mockLink };
  } catch (error: any) {
    return { success: false, error: error.message || 'Operation failed' };
  }
}

export async function resetPasswordAction(formData: any) {
  try {
    const validated = resetPasswordSchema.parse(formData);
    await AuthService.resetPassword(validated.password, validated.token);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Password reset failed' };
  }
}
