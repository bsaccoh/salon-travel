'use client';

import React from 'react';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <TravelerHeader />

      <main className="flex-1 py-24 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
            <p className="text-sm text-text-muted mt-2">
              Manage your personal information, preferences, and security settings.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* PERSONAL DETAILS */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Personal Details</h2>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs text-text-muted mb-1">Full Name</span>
                  <span className="font-semibold">{user?.fullName || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">Email</span>
                  <span className="font-semibold">{user?.email || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">Phone</span>
                  <span className="font-semibold">{user?.phone || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* TRAVEL PREFERENCES */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Travel Preferences</h2>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs text-text-muted mb-1">Preferred Language</span>
                  <span className="font-semibold">English</span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">Home Country</span>
                  <span className="font-semibold">Sierra Leone</span>
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Emergency Contact</h2>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs text-text-muted mb-1">Name</span>
                  <span className="font-semibold">Fatmata Koroma</span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">Phone</span>
                  <span className="font-semibold">+232 76 987 654</span>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Security</h2>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">Password</span>
                <span className="font-semibold">••••••••</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
