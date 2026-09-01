import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-[#1A1B2E]/60 border border-white/5',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#6C63FF] shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#9B9BB4] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
