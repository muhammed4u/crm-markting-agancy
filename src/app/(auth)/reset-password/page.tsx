'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/validations/schemas';
import { resetPasswordAction } from '@/actions/auth.actions';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/loader';
import { z } from 'zod';
import { Lock, Check } from 'lucide-react';

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: '',
    },
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    }
  }, [token, setValue]);

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    try {
      const res = await resetPasswordAction(data);
      if (res.success) {
        showToast('Your password has been successfully updated.', 'success', 'Password Updated');
        router.push('/login');
      } else {
        showToast(res.error || 'Failed to reset password', 'error', 'Reset Failed');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-4">
        <p className="text-sm text-rose-500 font-semibold">Missing Reset Token</p>
        <p className="text-xs text-slate-500">
          The reset password link is invalid or expired. Please trigger a new one.
        </p>
        <button
          onClick={() => router.push('/forgot-password')}
          className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition hover:bg-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Icon header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Create New Password</h2>
        <p className="text-xs text-slate-500">Enter your new secure password below</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden Token */}
        <input type="hidden" {...register('token')} />

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">New Password</label>
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

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.confirmPassword.message}</p>
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
              Updating password...
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-8">
        <Spinner className="w-6 h-6 border-t-white" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

