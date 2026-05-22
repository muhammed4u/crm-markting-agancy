'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Clock, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/loader';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('You have successfully signed out.', 'success', 'Signed Out');
        router.push('/login');
      } else {
        showToast('Logout failed. Please try again.', 'error', 'Error');
      }
    } catch {
      showToast('An unexpected error occurred.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo */}
      <div className="mb-8 z-10 flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-white text-base tracking-tight leading-none">MARKETING</span>
            <span className="text-[10px] text-violet-400 font-semibold tracking-widest mt-1">ACADEMY</span>
          </div>
        </div>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 z-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Account Approval Pending</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Thank you for registering! Your account request is currently being reviewed by our administration team.
          </p>
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 text-left space-y-2">
          <span className="font-bold text-slate-300 block">What happens next?</span>
          <p>• Administrators will review your registration within 24 hours.</p>
          <p>• Once approved, you will receive full workspace permission scopes corresponding to your role.</p>
          <p>• You can sign out and log back in later to check your request status.</p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4 border-t-white" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Sign Out / Switch Account
            </>
          )}
        </button>
      </div>

      {/* Small footer */}
      <p className="mt-8 text-[11px] text-slate-600 font-bold uppercase tracking-wider z-10 select-none">
        Secure CRM Hub • Access Guarded
      </p>
    </div>
  );
}
