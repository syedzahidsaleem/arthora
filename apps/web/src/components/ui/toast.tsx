'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-2 group-[.toaster]:text-content-primary group-[.toaster]:border-surface-4 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-content-secondary',
          actionButton:
            'group-[.toast]:bg-brand-primary group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-surface-3 group-[.toast]:text-content-secondary',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
