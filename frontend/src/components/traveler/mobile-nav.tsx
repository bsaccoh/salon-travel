'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, Compass, Calendar, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TravelerMobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Only show bottom nav for authenticated users (as per standard mobile app patterns)
  // or you could choose to show it always. Let's show it always but with different links if logged out.
  
  if (!user) return null; // We'll restrict to authenticated users for now.

  const navItems = [
    { name: 'Home', href: '/account', icon: Home },
    { name: 'Explore', href: '/destinations', icon: Compass },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-text-muted hover:text-text"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
