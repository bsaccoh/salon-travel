'use client';

import React from 'react';
import Link from 'next/link';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  UploadCloud,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useMyProvider, useSubmitForVerification, useMyDocuments } from '@/hooks/use-providers';
import { useMyServices } from '@/hooks/use-services';
import { ErrorState } from '@/components/ui/error-state';

export default function ProviderVerificationPage() {
  const { data: provider, isLoading, error, refetch } = useMyProvider();
  const { data: services } = useMyServices();
  const { data: documents } = useMyDocuments();
  const submitVerification = useSubmitForVerification();

  const hasProfile = !!(provider?.businessName && provider?.phone && provider?.city && provider?.description);
  const hasService = !!(services && services.length > 0);
  const hasBusinessReg = documents?.some((d: any) => d.type === 'business_registration' || d.type === 'permit');
  const hasTaxId = documents?.some((d: any) => d.type === 'tax_id');
  const hasGovId = documents?.some((d: any) => d.type === 'id_document');

  const steps = [
    {
      title: 'Business Profile & Bio',
      status: hasProfile ? 'completed' : 'pending',
      description: 'Business name, category, phone, operating location, and description',
      actionHref: '/provider/profile',
      actionLabel: 'Edit Profile',
    },
    {
      title: 'Business Registration Document',
      status: hasBusinessReg ? 'completed' : 'pending',
      description: 'Official Sierra Leone Business License or Municipal Permit',
      actionHref: '/provider/documents',
      actionLabel: 'Upload',
    },
    {
      title: 'Tax Identification Number (TIN)',
      status: hasTaxId ? 'completed' : 'pending',
      description: 'NRA Tax Clearance / TIN verification record',
      actionHref: '/provider/documents',
      actionLabel: 'Upload',
    },
    {
      title: 'Government Identification (Owner/Director)',
      status: hasGovId ? 'completed' : 'pending',
      description: 'Valid National Passport or National ID Card',
      actionHref: '/provider/documents',
      actionLabel: 'Upload',
    },
    {
      title: 'First Service Excursion Setup',
      status: hasService ? 'completed' : 'pending',
      description: 'At least one active service with pricing and safety details',
      actionHref: '/provider/services',
      actionLabel: 'Create Service',
    },
  ];

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isFullyCompliant = completedCount === steps.length;

  const isAlreadySubmitted = provider?.status === 'submitted' || provider?.status === 'under_review' || provider?.status === 'approved';

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Partner Compliance
            </span>
            <h1 className="text-2xl font-bold text-text mt-1">Verification Status</h1>
            <p className="text-xs text-text-muted mt-1">
              Complete your verification steps to receive the Verified Partner badge and start receiving traveler bookings.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card mb-8">
              <div className="flex items-center justify-between pb-6 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    provider?.status === 'approved'
                      ? 'bg-success-light text-success'
                      : 'bg-warning-light text-warning'
                  }`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">
                      {provider?.status === 'approved'
                        ? 'Verified Partner'
                        : `Compliance Progress: ${progressPercent}%`}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {provider?.status === 'approved'
                        ? 'Your account is fully verified'
                        : `${completedCount} of ${steps.length} verification steps completed`}
                    </p>
                  </div>
                </div>

                {!isAlreadySubmitted && (
                  <Button
                    variant="traveler-cta"
                    size="md"
                    className="font-bold"
                    onClick={() => submitVerification.mutate()}
                    disabled={submitVerification.isPending || !isFullyCompliant}
                    title={!isFullyCompliant ? 'Please complete all verification steps before submitting' : undefined}
                  >
                    {submitVerification.isPending ? 'Submitting...' : 'Submit For Review'}
                  </Button>
                )}

                {provider?.status === 'submitted' && (
                  <span className="text-xs font-bold text-warning bg-warning-light px-3 py-1 rounded-full">
                    Under Review
                  </span>
                )}

                {provider?.status === 'approved' && (
                  <span className="text-xs font-bold text-success bg-success-light px-3 py-1 rounded-full">
                    Approved
                  </span>
                )}
              </div>

              {/* Steps Checklist */}
              <div className="divide-y divide-border/60 mt-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-text">{step.title}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    {step.status === 'completed' ? (
                      <span className="text-xs font-bold text-success bg-success-light px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Verified
                      </span>
                    ) : (
                      <Link href={step.actionHref}>
                        <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs">
                          <UploadCloud className="w-3.5 h-3.5 text-primary" />
                          <span>{step.actionLabel}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
