'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface DropdownProps {
  items: DropdownItem[];
  triggerIcon?: React.ElementType;
}

export function ActionDropdown({ items, triggerIcon: TriggerIcon = MoreVertical }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-text-muted hover:bg-border/50 transition-smooth focus:outline-none"
      >
        <TriggerIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-surface border border-border rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 divide-y divide-border/50">
          <div className="py-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'group flex w-full items-center px-4 py-2.5 text-xs font-semibold transition-smooth',
                    item.variant === 'danger'
                      ? 'text-danger hover:bg-danger-light'
                      : item.variant === 'success'
                      ? 'text-success hover:bg-success-light'
                      : 'text-text hover:bg-background'
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'mr-3 h-4 w-4',
                        item.variant === 'danger'
                          ? 'text-danger'
                          : item.variant === 'success'
                          ? 'text-success'
                          : 'text-text-muted group-hover:text-text'
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
