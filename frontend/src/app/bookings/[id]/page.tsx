'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import { useCreatePaymentIntent } from '@/hooks/use-payments';
import { apiClient } from '@/lib/api-client';
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Ban,
  ArrowLeft,
  Star,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── Stripe checkout form (rendered inside Elements) ─────────────────
function StripeCheckoutForm({
  amountCents,
  onSuccess,
  onClose,
}: {
  amountCents: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setIsSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-text">Total Amount</p>
          <p className="text-xs text-text-muted">Secure checkout powered by Stripe</p>
        </div>
        <span className="text-xl font-extrabold text-primary-dark">
          Le {(amountCents / 100).toLocaleString()}
        </span>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 rounded-lg bg-danger-light text-danger text-xs font-semibold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <ShieldCheck className="w-4 h-4 text-success shrink-0" />
        <span>256-bit SSL encrypted · Powered by Stripe</span>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="traveler-cta"
          className="flex-1 font-bold"
          disabled={!stripe || isSubmitting}
          isLoading={isSubmitting}
        >
          Pay Le {(amountCents / 100).toLocaleString()}
        </Button>
      </div>
    </form>
  );
}

// ── Booking detail page ──────────────────────────────────────────────
export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingId = params.id;
  const { data: remoteBooking, isLoading, refetch } = useBooking(bookingId);
  const cancelBookingMutation = useCancelBooking();
  const createPaymentIntent = useCreatePaymentIntent();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [wasPaidBeforeCancel, setWasPaidBeforeCancel] = useState(false);

  const currentStatus = remoteBooking?.status || 'pending';

  const booking = {
    id: remoteBooking?.id || bookingId,
    reference: remoteBooking?.reference || '—',
    serviceName: remoteBooking?.service?.name || '—',
    providerName: remoteBooking?.provider?.businessName || '—',
    scheduledDate: remoteBooking?.scheduledDate
      ? new Date(remoteBooking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—',
    guestCount: remoteBooking?.guestCount || 1,
    totalCents: remoteBooking?.totalCents || 0,
    currency: remoteBooking?.currency || 'SLE',
    specialRequests: remoteBooking?.specialRequests || '',
    createdAt: remoteBooking?.createdAt
      ? new Date(remoteBooking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—',
  };

  const openPaymentModal = async () => {
    setPaymentSuccess(false);
    setClientSecret(null);
    setIsPaymentModalOpen(true);
    try {
      const res = await createPaymentIntent.mutateAsync({ bookingId: booking.id });
      setClientSecret(res.data.clientSecret);
    } catch (err: any) {
      // If no Stripe key, fall back to test mode notice
      setClientSecret('__no_stripe_key__');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    refetch();
  };

  const handleCancelBooking = async () => {
    if (currentStatus === 'confirmed' || currentStatus === 'paid') {
      setWasPaidBeforeCancel(true);
    }
    try {
      await cancelBookingMutation.mutateAsync({ id: booking.id, reason: 'Traveler cancelled via portal' });
      refetch();
    } catch {
      // Optimistically show cancelled state anyway
    }
    setIsCancelModalOpen(false);
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || reviewContent.trim().length < 10) {
      setReviewError('Please add a rating and at least 10 characters of review.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await apiClient.post('/reviews', { bookingId: booking.id, rating, content: reviewContent.trim() });
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TravelerHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <TravelerFooter />
      </div>
    );
  }

  const showPayButton = currentStatus === 'awaiting_payment' || currentStatus === 'accepted';
  const showCancelButton = !['cancelled_by_traveler', 'cancelled_by_provider', 'completed', 'no_show'].includes(currentStatus);
  const showReviewButton = currentStatus === 'completed';
  const isCancelled = currentStatus.includes('cancelled') || currentStatus === 'no_show';

  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/bookings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all bookings</span>
          </Link>

          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <BookingStatusBadge status={currentStatus} />
                  <span className="text-xs font-mono text-text-muted font-bold">Ref: #{booking.reference}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text mt-2">{booking.serviceName}</h1>
                <p className="text-xs font-semibold text-primary mt-1">Offered by {booking.providerName}</p>
              </div>

              {showPayButton && (
                <Button variant="traveler-cta" size="lg" className="font-bold shadow-md gap-2" onClick={openPaymentModal} isLoading={createPaymentIntent.isPending}>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay Now (Le {(booking.totalCents / 100).toLocaleString()})</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase">Date</span>
                  <p className="font-semibold text-text">{booking.scheduledDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase">Travelers</span>
                  <p className="font-semibold text-text">{booking.guestCount} Guests</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase">Amount</span>
                  <p className="font-semibold text-text">Le {(booking.totalCents / 100).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card">
                <h3 className="text-lg font-bold text-text mb-6">Booking Lifecycle</h3>
                <div className="space-y-6 relative pl-6 border-l-2 border-primary/20">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">Booking Requested</h4>
                      <p className="text-xs text-text-muted">{booking.createdAt}</p>
                    </div>
                  </div>

                  {['accepted', 'awaiting_payment', 'paid', 'confirmed', 'in_progress', 'completed'].includes(currentStatus) && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text">Provider Accepted</h4>
                        <p className="text-xs text-text-muted">Your booking was confirmed by the provider.</p>
                      </div>
                    </div>
                  )}

                  {!isCancelled && (
                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${['paid', 'confirmed', 'in_progress', 'completed'].includes(currentStatus) ? 'bg-success' : 'bg-warning'}`} />
                      <div>
                        <h4 className="text-sm font-bold text-text">
                          {['paid', 'confirmed', 'in_progress', 'completed'].includes(currentStatus) ? 'Payment Confirmed' : 'Awaiting Payment'}
                        </h4>
                        <p className="text-xs text-text-muted">
                          {['paid', 'confirmed', 'in_progress', 'completed'].includes(currentStatus)
                            ? 'Payment processed via Stripe. Your reservation is fully confirmed.'
                            : 'Complete payment to guarantee your booking.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'completed' && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-light">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary-dark">Trip Completed</h4>
                        <p className="text-xs text-text-muted">We hope you enjoyed your Salone Travel experience!</p>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-danger flex items-center justify-center">
                        <Ban className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-danger">Booking Cancelled</h4>
                        <p className="text-xs text-text-muted">This reservation was cancelled.</p>
                      </div>
                    </div>
                  )}

                  {isCancelled && wasPaidBeforeCancel && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary-dark flex items-center justify-center ring-4 ring-slate-light">
                        <RefreshCcw className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text">Refund Processing</h4>
                        <p className="text-xs text-text-muted">A refund has been initiated. Allow 3–5 business days.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {booking.specialRequests && (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card">
                  <h3 className="text-sm font-bold text-text mb-2">Special Requests</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="lg:col-span-5 space-y-6">
              {showReviewButton && (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-8 h-8 fill-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Rate your Experience</h3>
                  <p className="text-xs text-text-muted max-w-[250px] mx-auto">
                    Help other travelers and support local businesses by leaving a verified review.
                  </p>
                  {reviewSubmitted ? (
                    <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-xl">
                      <p className="text-sm font-bold text-success flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Review Published
                      </p>
                    </div>
                  ) : (
                    <Button variant="primary" className="w-full font-bold" onClick={() => setIsReviewModalOpen(true)}>
                      Leave a Review
                    </Button>
                  )}
                </div>
              )}

              {isCancelled ? (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Ban className="w-5 h-5 text-text-muted" /> Cancelled
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    This booking has been cancelled. Contact support if you need assistance.
                  </p>
                  <Link href="/messages" className="block">
                    <Button variant="secondary" className="w-full gap-2 font-bold">
                      <MessageSquare className="w-4 h-4" />
                      Message Concierge
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                    <h3 className="text-base font-bold text-text">Concierge Support</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Have questions or need to request changes? Our local team is ready to help.
                    </p>
                    <Link href="/messages" className="block">
                      <Button variant="secondary" className="w-full gap-2 font-bold">
                        <MessageSquare className="w-4 h-4" />
                        Message Concierge
                      </Button>
                    </Link>
                  </div>

                  {showCancelButton && (
                    <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Cancellation Policy</h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Free cancellation with full refund up to 24 hours before your booking date.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-danger border-danger/30 hover:bg-danger-light"
                        onClick={() => setIsCancelModalOpen(true)}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1.5" />
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Booking?" maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl text-warning-dark text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="font-medium">You are within the free cancellation window. You will receive a full refund.</p>
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to cancel your reservation for <strong>{booking.serviceName}</strong>? This cannot be undone.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" className="flex-1 font-bold" onClick={() => setIsCancelModalOpen(false)}>Keep Booking</Button>
            <Button
              variant="primary"
              className="flex-1 font-bold bg-danger hover:bg-danger-dark border-transparent text-white"
              onClick={handleCancelBooking}
              isLoading={cancelBookingMutation.isPending}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Review Your Experience" maxWidth="md">
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-text">{booking.serviceName}</h4>
            <p className="text-xs text-text-muted">by {booking.providerName}</p>
          </div>

          <div className="flex justify-center gap-2 py-4 border-y border-border/50">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star className={`w-10 h-10 ${(hoverRating || rating) >= star ? 'fill-warning text-warning' : 'fill-transparent text-border'} transition-colors`} />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Share your thoughts <span className="text-text-muted font-normal">(min. 10 characters)</span>
            </label>
            <textarea
              className="w-full h-32 p-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="What did you enjoy? What could be improved?"
              value={reviewContent}
              onChange={e => setReviewContent(e.target.value)}
            />
            <p className="text-right text-xs text-text-muted mt-1">{reviewContent.length} / 2000</p>
          </div>

          {reviewError && (
            <div className="p-3 rounded-lg bg-danger-light text-danger text-xs font-semibold">{reviewError}</div>
          )}

          <Button
            variant="traveler-cta"
            className="w-full font-bold"
            disabled={rating === 0 || reviewContent.trim().length < 10 || reviewSubmitting}
            isLoading={reviewSubmitting}
            onClick={handleSubmitReview}
          >
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setClientSecret(null); }}
        title="Complete Secure Payment"
        maxWidth="md"
      >
        {paymentSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-text">Payment Confirmed!</h4>
            <p className="text-xs text-text-muted">Your booking is confirmed. You'll receive an email receipt shortly.</p>
            <Button variant="traveler-cta" size="md" className="w-full mt-4 font-bold" onClick={() => setIsPaymentModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : !clientSecret ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-text-muted">Preparing secure checkout…</p>
          </div>
        ) : clientSecret === '__no_stripe_key__' ? (
          <div className="space-y-4 text-center py-6">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-sm text-warning-dark">
              <p className="font-bold mb-1">Stripe not configured</p>
              <p className="text-xs">Set <code className="bg-black/10 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your Render frontend environment to enable real payments.</p>
            </div>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Close</Button>
          </div>
        ) : stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#1a5c3a' } },
            }}
          >
            <StripeCheckoutForm
              amountCents={booking.totalCents}
              onSuccess={handlePaymentSuccess}
              onClose={() => { setIsPaymentModalOpen(false); setClientSecret(null); }}
            />
          </Elements>
        ) : (
          <div className="space-y-4 text-center py-6">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-sm text-warning-dark">
              <p className="font-bold mb-1">Stripe not configured</p>
              <p className="text-xs">Add <code className="bg-black/10 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment variables.</p>
            </div>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      <TravelerFooter />
    </div>
  );
}
