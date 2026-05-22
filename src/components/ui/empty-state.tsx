import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 py-12">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-500/10 transition-all duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
