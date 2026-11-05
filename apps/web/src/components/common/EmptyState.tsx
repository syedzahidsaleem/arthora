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
        'neo-box p-8 md:p-12 bg-white flex flex-col items-center justify-center text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-xl bg-neo-yellow border-2 border-black flex items-center justify-center mb-4 text-black shadow-neo">
        <Icon className="w-8 h-8 stroke-[2.5]" />
      </div>

      <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-sm font-mono text-black/70 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="neo-btn bg-neo-mint text-black font-bold text-sm px-6 py-2.5 inline-flex items-center justify-center"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="neo-btn bg-neo-mint text-black font-bold text-sm px-6 py-2.5 inline-flex items-center justify-center"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
