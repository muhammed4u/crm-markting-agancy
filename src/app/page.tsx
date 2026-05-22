import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Sparkles, ArrowRight, Shield, Award, Users, CreditCard } from 'lucide-react';

export default async function LandingPage() {
  const session = await AuthService.getSession();

  // Redirect if logged in
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Abstract Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar Header */}
      <header className="h-20 px-6 max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base tracking-tight leading-none">MARKETING</span>
            <span className="text-[10px] text-violet-400 font-semibold tracking-widest mt-1">ACADEMY</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-xl transition shadow-lg shadow-violet-600/15"
          >
            Register Profile
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-16 z-10">
        {/* Banner Alert */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/60 mb-6 text-xs font-semibold text-violet-300">
          <Sparkles className="w-3.5 h-3.5" />
          Version 1.0 Enterprise Edition
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
          Enterprise Academy CRM <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            Built for Real growth.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Manage marketing academy operations from client acquisition to graduation. 
          Track leads, student enrollments, course catalogs, installments, and operational tasks in one secure cockpit.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold rounded-xl shadow-xl shadow-violet-500/10 transition"
          >
            Access CRM Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/50 hover:border-slate-600 font-bold rounded-xl transition"
          >
            Student Sign Up
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 w-full mt-24 border-t border-slate-800/80 pt-16">
          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Strict Security</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[150px]">HttpOnly cookies, CSRF, and JWT guards.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Role Based Access</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[150px]">Admin, Sales, Instructor, Accountant, and Student views.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Payment Engine</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[150px]">Installments tracking, transactions, invoices.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Course Builder</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[150px]">Upload materials, schedule lectures, and mark attendance.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-800/80 px-6 z-10 flex items-center justify-center text-xs text-slate-600 font-semibold uppercase tracking-wider">
        © 2026 Marketing Academy CRM. All rights reserved.
      </footer>
    </div>
  );
}
