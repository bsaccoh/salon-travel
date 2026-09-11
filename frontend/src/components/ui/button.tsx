import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'traveler-cta'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-primary-dark hover:bg-primary-hover text-white shadow-sm focus:ring-primary-dark',
      'traveler-cta':
        'bg-accent hover:bg-accent-hover text-white font-semibold shadow-md hover:shadow-lg focus:ring-accent',
      secondary:
        'bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary',
      outline:
        'border border-border bg-surface hover:bg-slate-light text-text focus:ring-primary',
      ghost: 'hover:bg-slate-light text-text hover:text-primary-dark focus:ring-primary',
      danger:
        'bg-danger hover:bg-red-700 text-white shadow-sm focus:ring-danger',
      success:
        'bg-success hover:bg-success-hover text-white shadow-sm focus:ring-success',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
