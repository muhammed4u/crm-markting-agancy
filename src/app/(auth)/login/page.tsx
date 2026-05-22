'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/validations/schemas';
import { loginAction } from '@/actions/auth.actions';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/loader';
import { z } from 'zod';

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Read callback URL if redirected by middleware
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await loginAction(data);
      if (res.success) {
        showToast('Welcome back!', 'success', 'Login Successful');
        router.push(callbackUrl);
      } else {
        showToast(res.error || 'Invalid credentials', 'error', 'Login Failed');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Sign In to Dashboard</h2>
        <p className="text-xs text-slate-500">Enter your credentials to manage your academy portal</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-violet-400 hover:text-violet-300 transition"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4 border-t-white" />
              Verifying credentials...
            </>
          ) : (
            'Access Dashboard'
          )}
        </button>
      </form>

      {/* Sandbox Info */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[10px] text-slate-500 leading-normal">
        <span className="font-bold text-slate-400 block mb-0.5">Quick Access (Sandboxed Logins):</span>
        • Admin: <span className="text-violet-400 font-semibold">admin@marketingacademy.com</span> / password123<br />
        • Sales: <span className="text-violet-400 font-semibold">sales@marketingacademy.com</span> / password123<br />
        • Instructor: <span className="text-violet-400 font-semibold">instructor@marketingacademy.com</span> / password123<br />
        • Accountant: <span className="text-violet-400 font-semibold">accountant@marketingacademy.com</span> / password123
      </div>

      {/* Link to Register */}
      <p className="text-center text-xs text-slate-500">
        Are you a student?{' '}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition">
          Create student account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-8">
        <Spinner className="w-6 h-6 border-t-white" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

