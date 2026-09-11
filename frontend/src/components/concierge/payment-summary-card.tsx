'use client';

import React from 'react';

export function PaymentSummaryCard() {
  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#E5ECEE] shadow-sm flex flex-col overflow-hidden">
      <div className="p-[18px] border-b border-[#E5ECEE]">
        <h2 className="text-[12px] font-bold text-text uppercase tracking-wider text-text-muted mb-4">Payment Summary</h2>
        <div className="space-y-[12px]">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#7A8A91] font-medium">Booking Value</span>
            <span className="font-semibold text-text tabular-nums">Le 1,500.00</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#7A8A91] font-medium">Amount Paid</span>
            <span className="font-semibold text-success tabular-nums">Le 0.00</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-text-muted">
            <span className="text-[#7A8A91] font-medium">Refunded</span>
            <span className="font-semibold tabular-nums">Le 0.00</span>
          </div>
          <div className="flex items-center justify-between text-[13px] pt-[12px] border-t border-[#E5ECEE]">
            <span className="font-bold text-text">Balance Due</span>
            <span className="font-bold text-[#DC2626] text-[15px] tabular-nums">Le 1,500.00</span>
          </div>
        </div>
      </div>
      <div className="bg-[#FAFCFC] p-[14px] flex justify-center">
        <button className="text-[12px] font-bold text-primary hover:text-primary-dark transition-colors w-full">
          View Invoice
        </button>
      </div>
    </div>
  );
}
