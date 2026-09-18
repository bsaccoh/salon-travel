'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Personal Details edit state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEdit = () => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      const body: Record<string, string | null> = { fullName };
      if (phone.trim()) {
        body.phone = phone.trim();
      } else {
        body.phone = null;
      }
      await apiClient.patch('/auth/me', body);
      await refreshUser();
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>Edit</Button>
                )}
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Profile updated successfully.
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  {saveError && (
                    <div className="p-3 rounded-xl bg-danger-light border border-danger/20 flex items-start gap-2 text-xs font-semibold text-danger">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {saveError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1.5">Email</label>
                      <p className="h-11 px-3 flex items-center text-sm text-text-muted bg-slate-light rounded-lg border border-border">
                        {user?.email}
                      </p>
                      <p className="mt-1 text-[10px] text-text-muted">Email cannot be changed</p>
                    </div>
                    <Input
                      label="Phone (optional)"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+232 76 000 000"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" size="sm" className="font-bold gap-2" disabled={isSaving}>
                      {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
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
              )}
            </div>

            {/* TRAVEL PREFERENCES */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Travel Preferences</h2>
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

            {/* SECURITY */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Security</h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-text-muted mb-1">Password</span>
                  <span className="font-semibold">••••••••</span>
                </div>
                <Link href={`/auth/forgot-password`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
