'use client';

import React from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { useMyProvider } from '@/hooks/use-providers';
import { useProviderReviews } from '@/hooks/use-reviews';
import { ErrorState } from '@/components/ui/error-state';

export default function ProviderReviewsPage() {
  const { data: provider } = useMyProvider();
  const { data: reviews, isLoading, error, refetch } = useProviderReviews(provider?.id || '');

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Customer Reviews</h1>
              <p className="text-xs text-text-muted mt-1">
                Verified reviews and feedback submitted by completed travelers
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl shadow-xs">
              <Star className="w-5 h-5 fill-warning text-warning" />
              <span className="text-lg font-bold text-text">
                {provider?.ratingAverage?.toFixed(1) ?? '—'}
              </span>
              <span className="text-xs text-text-muted">
                ({provider?.ratingCount ?? 0} total reviews)
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !reviews?.length ? (
            <div className="p-12 rounded-2xl border border-border bg-surface text-center space-y-4 shadow-subtle">
              <MessageSquare className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold text-text">No reviews yet</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Reviews from travelers will appear here after they complete a booking with you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-text">
                        {rev.author?.fullName || 'Traveler'}
                      </h3>
                      {rev.title && (
                        <p className="text-xs text-primary font-medium">{rev.title}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>

                  {rev.content && (
                    <p className="text-xs sm:text-sm text-text/85 leading-relaxed font-normal">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  )}

                  <p className="text-[11px] text-text-muted pt-2 border-t border-border/50">
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })} · Verified Booking
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
