'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { AuthUser } from '@/types';

interface DashboardShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        role={user.role}
        permissions={user.permissions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dashboard Main Scrollable View */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/20 p-4 sm:p-6 md:p-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
