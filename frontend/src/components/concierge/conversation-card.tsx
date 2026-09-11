'use client';

import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConversationCard({ 
  data, 
  isActive, 
  onClick 
}: { 
  data: any; 
  isActive: boolean; 
  onClick: () => void 
}) {
  const {
    travelerName,
    bookingRef,
    lastMessage,
    time,
    unreadCount,
    isEmergency,
    assignmentState,
    isOnline,
    waitingTime
  } = data;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative p-[14px] rounded-[12px] border transition-all cursor-pointer group flex flex-col justify-between min-h-[110px] gap-2 overflow-hidden",
        isActive 
          ? "bg-[#F1FAFB] border-primary" 
          : isEmergency 
            ? "bg-[#FEF2F2] border-[#FECACA]"
            : "bg-[#FFFFFF] border-[#E5ECEE] hover:border-primary/30"
      )}
    >
      {/* Active/Emergency Left Border indicator */}
      {isActive && !isEmergency && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
      )}
      {isEmergency && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#DC2626]" />
      )}

      {/* Top Row: Avatar/Name and Time */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-[10px] min-w-0">
          <div className="relative shrink-0">
            <div className="w-[36px] h-[36px] rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-xs">
              {travelerName.charAt(0)}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-success border-2 border-surface"></span>
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <span className={cn(
              "text-[14px] truncate leading-tight",
              unreadCount > 0 ? "font-bold text-text" : "font-semibold text-text"
            )}>
              {travelerName}
            </span>
            {bookingRef && (
              <span className="text-[11px] font-mono text-text-muted mt-0.5">{bookingRef}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 gap-1 mt-0.5">
          <span className={cn(
            "text-[11px] whitespace-nowrap",
            unreadCount > 0 ? "text-primary font-bold" : "text-[#7A8A91] font-medium"
          )}>
            {time}
          </span>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Middle Row: Message Preview */}
      <p className={cn(
        "text-[13px] line-clamp-2 leading-[1.45]",
        unreadCount > 0 ? "text-text font-medium" : "text-text-muted"
      )}>
        {lastMessage}
      </p>

      {/* Bottom Row: Status / Badges */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] font-semibold text-[#7A8A91]">
          {assignmentState}
        </span>
        
        <div className="flex items-center gap-1.5">
          {isEmergency && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded-md">
              <AlertTriangle className="w-3 h-3" />
              EMERGENCY
            </span>
          )}
          {!isEmergency && waitingTime && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-warning-hover bg-warning-light px-1.5 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {waitingTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
