'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Compass, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiClient.post('/auth/password/reset', { email, code, newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Reset failed. Check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center text-warning shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-primary-dark">
            Salone<span className="text-accent">Travel</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-text tracking-tight">Set new password</h2>
        <p className="mt-1 text-sm text-text-muted">
          Enter the 6-digit code from your email and choose a new password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-border shadow-card">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text">Password updated!</h3>
              <p className="text-xs text-text-muted">Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-danger-light border border-danger/20 flex items-start gap-3 text-danger text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">6-digit reset code</label>
                <input
                  required
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-primary"
                  placeholder="——————"
                />
              </div>

              <div className="relative">
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 symbol"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" variant="traveler-cta" size="lg" className="w-full font-bold" isLoading={isLoading}>
                Reset Password
              </Button>

              <div className="text-center pt-2">
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-text-muted hover:text-text">
                  Didn't get a code? Resend
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
