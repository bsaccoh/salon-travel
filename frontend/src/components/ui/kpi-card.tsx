import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtext?: string;
  className?: string;
  iconBgColor?: string;
}

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  subtext,
  className,
  iconBgColor = 'bg-primary-light text-primary',
}: KPICardProps) {
  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-xl border border-border bg-surface shadow-subtle flex flex-col justify-between transition-smooth hover:shadow-card',
        className,
      )}
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBgColor)}>
            <Icon className="w-4 h-4" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                trend.isPositive
                  ? 'text-success bg-success-light/50'
                  : 'text-danger bg-danger-light/50',
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.isPositive ? '+' : '-'}{trend.value}%</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xl sm:text-2xl font-black text-text tracking-tight leading-none mb-1">{value}</h4>
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block leading-tight">
            {label}
          </span>
        </div>
      </div>
      
      {subtext && (
        <div className="mt-2.5 pt-2 border-t border-border/50">
          <p className="text-[10px] font-semibold text-text-muted truncate">{subtext}</p>
        </div>
      )}
    </div>
  );
}
