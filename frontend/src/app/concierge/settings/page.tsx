'use client';

import React, { useState } from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ConciergeSettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text flex items-center gap-2">
                <Settings className="w-6 h-6" /> Settings
              </h1>
              <p className="text-sm text-text-muted mt-1">Manage your concierge profile, availability, and notification preferences.</p>
            </div>
            <Button variant="outline" size="sm" className="font-bold border-danger/30 text-danger hover:bg-danger/10 gap-2" onClick={() => logout()}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="p-8 max-w-[1000px] w-full mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'profile' ? 'bg-primary/10 text-primary-dark' : 'text-text-muted hover:bg-slate-light hover:text-text'
              }`}
            >
              <User className="w-4 h-4" /> Profile & Availability
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary-dark' : 'text-text-muted hover:bg-slate-light hover:text-text'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'security' ? 'bg-primary/10 text-primary-dark' : 'text-text-muted hover:bg-slate-light hover:text-text'
              }`}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 space-y-8">
            
            {activeTab === 'profile' && (
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-bold text-text">Profile Information</h2>
                  <p className="text-sm text-text-muted mt-1">Update your personal details and working status.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-2xl font-bold">
                      {initials}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="font-bold">Change Photo</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm font-medium focus:outline-none focus:border-primary" defaultValue={user?.fullName || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                      <input type="email" className="w-full px-4 py-2 border border-border rounded-lg bg-slate-light text-sm font-medium text-text-muted cursor-not-allowed focus:outline-none" defaultValue={user?.email || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Role</label>
                      <input type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-slate-light text-sm font-medium text-text-muted cursor-not-allowed focus:outline-none" defaultValue={user?.role || ''} readOnly />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="text-sm font-bold text-text mb-4">Current Availability</h3>
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                        <span className="ml-3 text-sm font-bold text-text">Accepting New Conversations</span>
                      </label>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Toggle this off if you are going on break or ending your shift.</p>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-end">
                    <Button variant="primary" className="font-bold">Save Changes</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-bold text-text">Notification Preferences</h2>
                  <p className="text-sm text-text-muted mt-1">Choose what alerts you receive and how.</p>
                </div>
                <div className="p-6 space-y-6">
                  {['New Conversation Assigned', 'Emergency Flagged', 'SLA Warning (5m)', 'Traveler Reply', 'Provider Update'].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-6 border-b border-border last:border-0 last:pb-0">
                      <div>
                        <h4 className="text-sm font-bold text-text">{item}</h4>
                        <p className="text-xs text-text-muted mt-1">Receive an alert when this event occurs.</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-primary rounded border-border" defaultChecked />
                          <span className="text-xs font-bold text-text-muted uppercase">Push</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-primary rounded border-border" defaultChecked={idx === 1} />
                          <span className="text-xs font-bold text-text-muted uppercase">Email</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" className="font-bold">Save Preferences</Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
