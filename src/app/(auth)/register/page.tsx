'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/validations/schemas';
import { registerAction } from '@/actions/auth.actions';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/loader';
import { z } from 'zod';

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'STUDENT',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await registerAction(data);
      if (res.success) {
        showToast('Registration successful! Please log in.', 'success', 'Account Created');
        router.push('/login');
      } else {
        showToast(res.error || 'Failed to create account', 'error', 'Registration Failed');
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
        <h2 className="text-xl font-bold text-white">Create Academy Account</h2>
        <p className="text-xs text-slate-500">Register a new profile to access the academy portal</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Email Address</label>
          <input
            type="email"
            placeholder="name@gmail.com"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Phone Number</label>
          <input
            type="text"
            placeholder="+201001234567"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Password</label>
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

        {/* Role Selector (Self Register Sandbox) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Select Portal Role</label>
          <select
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition disabled:opacity-50 cursor-pointer"
            {...register('role')}
          >
            <option value="STUDENT">Student Profile (View-only Portal)</option>
            <option value="SALES">Sales Agent (Lead Management)</option>
            <option value="INSTRUCTOR">Course Instructor (Academy Lectures)</option>
            <option value="ACCOUNTANT">Accountant (Financial Portal)</option>
            <option value="ADMIN">Administrator (Full Access)</option>
          </select>
          {errors.role && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.role.message}</p>
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
              Registering profile...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Link to Login */}
      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition">
          Sign In
        </Link>
      </p>
    </div>
  );
}
