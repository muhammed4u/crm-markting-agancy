'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from './ui/toast';
import { Spinner } from './ui/loader';
import { User, Lock, Save, Shield } from 'lucide-react';
import { AuthUser } from '@/types';

interface SettingsClientProps {
  currentUser: AuthUser;
}

export function SettingsClient({ currentUser }: SettingsClientProps) {
  const { showToast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 1. Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: errorsProfile },
  } = useForm({
    defaultValues: {
      name: currentUser.name,
      phone: currentUser.phone || '',
    },
  });

  // 2. Password form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const onUpdateProfile = async (data: any) => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        showToast('Profile updated successfully', 'success');
      } else {
        showToast(body.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data: any) => {
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        showToast('Password changed successfully', 'success');
        resetPassword();
      } else {
        showToast(body.error || 'Failed to change password', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage profile credentials, system access, and security passwords.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Personal Information</h3>
          </div>

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                  {...regProfile('name', { required: 'Name is required' })}
                />
                {errorsProfile.name && <p className="text-[11px] text-rose-500 font-semibold">{errorsProfile.name.message as string}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Phone Contact</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                  {...regProfile('phone')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 font-bold block mb-1">Email (Cannot be modified)</label>
              <input
                type="text"
                disabled
                value={currentUser.email}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-800 text-slate-500 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition select-none opacity-60"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                {profileLoading ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Password Reset Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Security & Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Old Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Current Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                  {...regPassword('oldPassword', { required: 'Old password is required' })}
                />
                {errorsPassword.oldPassword && <p className="text-[11px] text-rose-500 font-semibold">{errorsPassword.oldPassword.message as string}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">New Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                  {...regPassword('newPassword', { required: 'New password is required' })}
                />
                {errorsPassword.newPassword && <p className="text-[11px] text-rose-500 font-semibold">{errorsPassword.newPassword.message as string}</p>}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                {passwordLoading ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : <Save className="w-3.5 h-3.5" />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
