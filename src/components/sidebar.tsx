'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  BookOpen,
  CreditCard,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
  permissions?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, permissions = [], isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Navigation config based on granular permissions
  const allNavItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, permission: null },
    { href: '/dashboard/leads', label: 'Leads (CRM)', icon: UserCheck, permission: 'leads:read' },
    { href: '/dashboard/students', label: 'Students', icon: GraduationCap, permission: 'students:read' },
    { href: '/dashboard/courses', label: 'Courses & Material', icon: BookOpen, permission: 'courses:read' },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard, permission: 'payments:read' },
    { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarDays, permission: 'attendance:read' },
    { href: '/dashboard/tasks', label: 'Tasks', icon: ClipboardList, permission: 'tasks:read' },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, permission: 'reports:read' },
    { href: '/dashboard/users', label: 'User Directory', icon: Users, permission: 'users:read' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, permission: 'settings:read' },
  ];

  // Filter links based on role or active permissions
  const navItems = allNavItems.filter((item) => {
    if (role === 'ADMIN') return true;
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 flex flex-col justify-between transform transition-transform duration-350 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static transition-colors duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand/Logo Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
            <Link href="/dashboard" className="flex items-center gap-2.5 group/logo hover:opacity-95 transition-all active:scale-95 duration-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover/logo:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 animate-pulse group-hover/logo:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight leading-none group-hover/logo:text-violet-600 dark:group-hover/logo:text-violet-200 transition-colors">MARKETING</span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold tracking-widest mt-1 group-hover/logo:text-violet-500 dark:group-hover/logo:text-violet-300 transition-colors">ACADEMY</span>
              </div>
            </Link>
            
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden transition active:scale-95 duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-0.5 animate-fade-in-up delay-50 transition-colors duration-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">Access Scope</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{role}</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1 py-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const delayClass = idx < 6 ? ["delay-50", "delay-100", "delay-150", "delay-200", "delay-250", "delay-300"][idx] : "";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] animate-fade-in-up ${delayClass} group ${
                    active
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 animate-pulse-glow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-350 ${
                      active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-center transition-colors duration-200">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold uppercase tracking-wider">
            CRM System v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
