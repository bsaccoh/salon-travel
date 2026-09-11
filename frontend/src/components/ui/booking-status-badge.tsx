import React from 'react';
import { BookingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  Check,
  PlayCircle,
  Ban,
  UserX,
} from 'lucide-react';

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pending',
    className: 'badge-pending',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    className: 'badge-accepted',
    icon: CheckCircle2,
  },
  awaiting_payment: {
    label: 'Awaiting Payment',
    className: 'badge-awaiting-payment',
    icon: CreditCard,
  },
  paid: {
    label: 'Paid',
    className: 'badge-paid',
    icon: Check,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'badge-confirmed',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In Progress',
    className: 'badge-in-progress',
    icon: PlayCircle,
  },
  completed: {
    label: 'Completed',
    className: 'badge-completed',
    icon: CheckCircle2,
  },
  declined: {
    label: 'Declined',
    className: 'badge-declined',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    className: 'badge-expired',
    icon: Clock,
  },
  payment_failed: {
    label: 'Payment Failed',
    className: 'badge-payment-failed',
    icon: AlertCircle,
  },
  cancelled_by_traveler: {
    label: 'Cancelled (Traveler)',
    className: 'badge-cancelled',
    icon: Ban,
  },
  cancelled_by_provider: {
    label: 'Cancelled (Provider)',
    className: 'badge-cancelled',
    icon: Ban,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'badge-cancelled',
    icon: Ban,
  },
  no_show: {
    label: 'No Show',
    className: 'badge-no-show',
    icon: UserX,
  },
};

export function BookingStatusBadge({
  status,
  className,
  showIcon = true,
}: BookingStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, ' '),
    className: 'bg-slate text-white',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm transition-smooth',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
