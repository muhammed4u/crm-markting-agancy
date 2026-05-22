'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/validations/schemas';
import { forgotPasswordAction } from '@/actions/auth.actions';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/loader';
import { z } from 'zod';
import { KeyRound, ArrowLeft } from 'lucide-react';

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setLoading(true);
    setResetLink(null);
    try {
      const res = await forgotPasswordAction(data);
      if (res.success) {
        showToast('Password recovery simulation triggered', 'success', 'Request Processed');
        if (res.mockLink) {
          setResetLink(res.mockLink);
        }
      } else {
        showToast(res.error || 'Failed to request password reset', 'error', 'Error');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Icon header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Reset Password</h2>
        <p className="text-xs text-slate-500">Enter your email and we will simulate a password recovery link</p>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4 border-t-white" />
              Processing request...
            </>
          ) : (
            'Simulate Reset Link'
          )}
        </button>
      </form>

      {/* Sandbox Recovery link display */}
      {resetLink && (
        <div className="p-4 bg-slate-950/80 border border-violet-500/20 rounded-xl text-xs space-y-2 animate-zoom-in">
          <p className="font-bold text-violet-400">Sandbox Reset Link Generated:</p>
          <p className="text-[11px] text-slate-400 leading-normal break-all">
            We intercepted the reset token for local testing:
          </p>
          <Link
            href={resetLink}
            className="block p-2 rounded bg-violet-950/40 text-violet-300 hover:text-white font-semibold text-[11px] truncate border border-violet-800/30 text-center"
          >
            Click here to Reset Password
          </Link>
        </div>
      )}

      {/* Back to login link */}
      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Login
      </Link>
    </div>
  );
}
