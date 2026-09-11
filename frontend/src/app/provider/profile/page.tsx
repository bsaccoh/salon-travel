'use client';

import React, { useState, useEffect } from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useMyProvider, useUpdateProvider } from '@/hooks/use-providers';

export default function ProviderProfileEditPage() {
  const { data: provider, isLoading } = useMyProvider();
  const updateProvider = useUpdateProvider();

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (provider) {
      setBusinessName(provider.businessName || '');
      setCategory(provider.category || '');
      setPhone(provider.phone || '');
      setAddress(provider.address || '');
      setCity(provider.city || '');
      setDescription(provider.description || '');
    }
  }, [provider]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProvider.mutate(
      { businessName, category, phone, address, city, description },
      {
        onSuccess: () => {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2500);
        },
      },
    );
  };

  const isVerified = provider?.status === 'approved';

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ProviderSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Business Profile</h1>
              <p className="text-xs text-text-muted mt-1">
                Manage your public marketplace listing, contact info, and business bio
              </p>
            </div>
            {isVerified && (
              <div className="flex items-center gap-1.5 bg-success-light text-success px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Partner</span>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
            {isSaved && (
              <div className="mb-6 p-4 rounded-xl bg-success-light border border-success/20 flex items-center gap-3 text-success text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Business profile updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <Input
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Category / Industry"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone (Emergency / WhatsApp)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Operating Address / Base"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <Input
                  label="City / Region"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  About Your Business (Public Bio)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full rounded-lg border border-border bg-surface p-3.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-bold"
                  disabled={updateProvider.isPending}
                >
                  {updateProvider.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
