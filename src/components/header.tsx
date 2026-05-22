'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './theme-provider';
import { useToast } from './ui/toast';
import { logoutAction } from '@/actions/auth.actions';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '@/types';

interface HeaderProps {
  user: AuthUser;
  onMenuToggle: () => void;
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Real-time notifications state fetched from CRM activities
  const [notifications, setNotifications] = useState<any[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Use ref for showToast to avoid re-triggering the polling effect
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Live polling for notifications from database activity logs
  useEffect(() => {
    let active = true;
    const loadedIds = new Set<string>();

    const fetchNotifications = async (isInitial = false) => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return; // Silently skip on auth errors or server issues
        const json = await res.json();
        if (active && json.success && json.data) {
          const list = json.data;
          
          if (!isInitial) {
            list.forEach((item: any) => {
              if (!loadedIds.has(item.id)) {
                showToastRef.current(item.message, item.type as any, item.title);
              }
            });
          }
          
          list.forEach((item: any) => loadedIds.add(item.id));
          setNotifications(list);
        }
      } catch {
        // Silently ignore - network may be unavailable
      }
    };

    // First fetch
    fetchNotifications(true);

    // Poll every 30 seconds for new activity
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []); // No dependencies - runs once on mount

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res.success) {
      showToast('Logged out successfully', 'info');
      router.push('/login');
      router.refresh();
    } else {
      showToast('Logout failed: ' + res.error, 'error');
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile Toggle & Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs text-slate-500 dark:text-slate-400">Academy Hub</p>
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Welcome back, <span className="text-violet-600 dark:text-violet-400">{user.name}</span>
          </h1>
        </div>
      </div>

      {/* Right: Actions (Theme, Notifications, Profile) */}
      <div className="flex items-center gap-3">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-90 group"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 transition-transform group-hover:rotate-[360deg] duration-500 text-indigo-500" />
          ) : (
            <Sun className="w-5 h-5 transition-transform group-hover:rotate-[360deg] duration-500 text-amber-500" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        !notif.read ? 'bg-violet-50/20 dark:bg-violet-950/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-bold leading-none ${
                          notif.type === 'warning' ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {notif.title}
                        </span>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-violet-600 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md shadow-indigo-500/10">
              {user.name.charAt(0)}
            </div>
            
            <div className="hidden md:flex flex-col select-none pr-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user.name.split(' ')[0]}</span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-zoom-in">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
