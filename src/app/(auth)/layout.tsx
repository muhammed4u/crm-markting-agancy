import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo */}
      <div className="mb-8 z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-white text-base tracking-tight leading-none">MARKETING</span>
            <span className="text-[10px] text-violet-400 font-semibold tracking-widest mt-1">ACADEMY</span>
          </div>
        </Link>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 z-10 animate-fade-in">
        {children}
      </div>

      {/* Small footer */}
      <p className="mt-8 text-[11px] text-slate-600 font-bold uppercase tracking-wider z-10 select-none">
        Secure CRM Hub • AES Hashed
      </p>
    </div>
  );
}
