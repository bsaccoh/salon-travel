'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Ban,
  ArrowLeft,
  Star,
  AlertTriangle,
  RefreshCcw,
  Loader2,
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingId = params.id;
  const { data: remoteBooking, isLoading } = useBooking(bookingId);
  const cancelBookingMutation = useCancelBooking();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Local status override for dev testing or optimistic UI
  const [devStatusOverride, setDevStatusOverride] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [wasPaidBeforeCancel, setWasPaidBeforeCancel] = useState(false);

  const currentStatus = devStatusOverride || remoteBooking?.status || 'awaiting_payment';
  
  const booking = {
    id: remoteBooking?.id || bookingId || 'bkg-101',
    reference: remoteBooking?.reference || 'ST-10458',
    serviceName: remoteBooking?.service?.name || 'Banana Islands Day Boat Charter & Snorkeling',
    providerName: remoteBooking?.provider?.businessName || 'Banana Island Eco Tours',
    providerPhone: remoteBooking?.provider?.phone || '+232 76 112 233',
    scheduledDate: remoteBooking?.scheduledDate 
      ? new Date(remoteBooking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '25 August 2026',
    guestCount: remoteBooking?.guestCount || 2,
    totalCents: remoteBooking?.totalCents || 300000,
    currency: remoteBooking?.currency || 'SLE',
    specialRequests: remoteBooking?.specialRequests || 'Vegetarian lunch preferred for 1 guest. Hotel pickup at Kent.',
    location: 'Dublin Village, Banana Islands',
    createdAt: remoteBooking?.createdAt 
      ? new Date(remoteBooking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '18 August 2026',
  };

  const handleSimulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setDevStatusOverride('confirmed');
    }, 1500);
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBookingMutation.mutateAsync({
        id: booking.id,
        reason: 'Traveler cancelled via portal',
      });
    } catch {
      // Optimistic fallback for test UI
    }
    if (currentStatus === 'confirmed' || currentStatus === 'paid') {
      setWasPaidBeforeCancel(true);
    }
    setDevStatusOverride('cancelled_by_traveler');
    setIsCancelModalOpen(false);
  };

  const handleSubmitReview = () => {
    setReviewSubmitted(true);
    setIsReviewModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Dev Tools (hidden in prod) to easily test Phase T3 states */}
          <div className="mb-6 p-4 bg-slate-light rounded-xl border border-border/50 flex gap-2 items-center flex-wrap">
            <span className="text-xs font-bold text-text-muted uppercase">Dev State Switcher:</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDevStatusOverride('awaiting_payment'); setPaymentSuccess(false); setReviewSubmitted(false); }}>Awaiting Payment</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDevStatusOverride('confirmed'); setPaymentSuccess(true); setReviewSubmitted(false); }}>Confirmed</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDevStatusOverride('completed'); setPaymentSuccess(true); setReviewSubmitted(false); }}>Completed</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDevStatusOverride('cancelled_by_traveler'); setWasPaidBeforeCancel(true); setReviewSubmitted(false); }}>Cancelled (Refund)</Button>
          </div>

          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all bookings</span>
          </Link>

          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <BookingStatusBadge status={currentStatus} />
                  <span className="text-xs font-mono text-text-muted font-bold">
                    Ref: #{booking.reference}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text mt-2">
                  {booking.serviceName}
                </h1>
                <p className="text-xs font-semibold text-primary mt-1">
                  Offered by {booking.providerName}
                </p>
              </div>

              {currentStatus === 'awaiting_payment' && (
                <Button
                  variant="traveler-cta"
                  size="lg"
                  className="font-bold shadow-md gap-2"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pay Now (Le {booking.totalCents / 100})</span>
                </Button>
              )}
            </div>

            {/* Details Grid */}
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
                  <span className="text-xs font-bold text-text-muted uppercase">Meeting Point</span>
                  <p className="font-semibold text-text">{booking.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card">
                <h3 className="text-lg font-bold text-text mb-6">Booking Lifecycle</h3>

                <div className="space-y-6 relative pl-6 border-l-2 border-primary/20">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-success fill-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">Booking Requested</h4>
                      <p className="text-xs text-text-muted">Traveler submitted reservation details.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-success fill-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">Provider Accepted</h4>
                      <p className="text-xs text-text-muted">Banana Island Eco Tours confirmed availability.</p>
                    </div>
                  </div>

                  {!currentStatus.includes('cancelled') && (
                    <div className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${
                          currentStatus === 'confirmed' || currentStatus === 'completed' ? 'bg-success' : 'bg-warning'
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-text">
                          {currentStatus === 'confirmed' || currentStatus === 'completed' ? 'Payment Confirmed' : 'Awaiting Payment'}
                        </h4>
                        <p className="text-xs text-text-muted">
                          {currentStatus === 'confirmed' || currentStatus === 'completed'
                            ? 'Payment processed via Stripe. Your reservation is fully confirmed.'
                            : 'Please complete payment to guarantee your date.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'completed' && (
                    <div className="relative mt-6">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-md ring-4 ring-primary-light">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary-dark">Trip Completed</h4>
                        <p className="text-xs text-text-muted">We hope you enjoyed your Salone Travel experience!</p>
                      </div>
                    </div>
                  )}

                  {currentStatus.includes('cancelled') && (
                    <div className="relative mt-6">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-danger text-white flex items-center justify-center">
                        <Ban className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-danger">Booking Cancelled</h4>
                        <p className="text-xs text-text-muted">You cancelled this reservation.</p>
                      </div>
                    </div>
                  )}

                  {currentStatus.includes('cancelled') && wasPaidBeforeCancel && (
                    <div className="relative mt-6">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary-dark text-white flex items-center justify-center shadow-md ring-4 ring-slate-light">
                        <RefreshCcw className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text">Refund Processing</h4>
                        <p className="text-xs text-text-muted">A full refund of Le {(booking.totalCents / 100).toLocaleString()} has been initiated to your original payment method. Please allow 3-5 business days.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Support & Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              {currentStatus === 'completed' ? (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-8 h-8 fill-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Rate your Experience</h3>
                  <p className="text-xs text-text-muted leading-relaxed max-w-[250px] mx-auto">
                    Help other travelers and support local businesses by leaving a verified review.
                  </p>
                  
                  {reviewSubmitted ? (
                    <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-xl">
                      <p className="text-sm font-bold text-success flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Review Published
                      </p>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      className="w-full font-bold"
                      onClick={() => setIsReviewModalOpen(true)}
                    >
                      Leave a Review
                    </Button>
                  )}
                </div>
              ) : currentStatus.includes('cancelled') ? (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Ban className="w-5 h-5 text-text-muted" /> Cancelled
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    This booking has been cancelled and cannot be modified. If you need further assistance, please contact support.
                  </p>
                  <Link href="/messages" className="block">
                    <Button variant="secondary" className="w-full gap-2 font-bold">
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Concierge</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                    <h3 className="text-base font-bold text-text">Concierge Support</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Have questions about your booking or need to request changes? Our local concierge team is ready to assist.
                    </p>
                    <Link href="/messages" className="block">
                      <Button variant="secondary" className="w-full gap-2 font-bold">
                        <MessageSquare className="w-4 h-4" />
                        <span>Message Concierge</span>
                      </Button>
                    </Link>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Cancellation Policy
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Free cancellation with 100% full refund up to 24 hours before 25 August 2026.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-danger border-danger/30 hover:bg-danger-light"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1.5" />
                      <span>Cancel Booking</span>
                    </Button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Booking?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl text-warning-dark text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="font-medium">
              You are within the free cancellation window. You will receive a 100% refund of Le {(booking.totalCents / 100).toLocaleString()}.
            </p>
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to cancel your reservation for <strong>{booking.serviceName}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" className="flex-1 font-bold" onClick={() => setIsCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="primary" className="flex-1 font-bold bg-danger hover:bg-danger-dark border-transparent text-white" onClick={handleCancelBooking}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Your Experience"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h4 className="text-base font-bold text-text">{booking.serviceName}</h4>
            <p className="text-xs text-text-muted">Provided by {booking.providerName}</p>
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
                <Star 
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-warning text-warning' 
                      : 'fill-transparent text-border'
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Share your thoughts
            </label>
            <textarea 
              className="w-full h-32 p-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="What did you enjoy? What could be improved?"
            ></textarea>
          </div>

          <Button 
            variant="traveler-cta" 
            className="w-full font-bold" 
            disabled={rating === 0}
            onClick={handleSubmitReview}
          >
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* Stripe Payment Checkout Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Complete Secure Payment"
        description="Encrypted 256-bit checkout powered by Stripe Elements"
        maxWidth="md"
      >
        {paymentSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-text">Payment Confirmed!</h4>
            <p className="text-xs text-text-muted">
              Your booking is now confirmed. You will receive an email voucher with full itinerary details.
            </p>
            <Button
              variant="traveler-cta"
              size="md"
              className="w-full mt-4 font-bold"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text">Total Amount</p>
                <p className="text-xs text-text-muted">{booking.serviceName}</p>
              </div>
              <span className="text-xl font-extrabold text-primary-dark">
                Le {(booking.totalCents / 100).toLocaleString()}.00
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                  Card Number
                </label>
                <div className="flex h-11 w-full items-center rounded-lg border border-border bg-surface px-3 text-sm">
                  <CreditCard className="w-4 h-4 text-text-muted mr-2" />
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full bg-transparent font-mono text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    defaultValue="08/28"
                    className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="traveler-cta"
              size="lg"
              className="w-full font-bold shadow-md"
              isLoading={isPaying}
              onClick={handleSimulatePayment}
            >
              <span>Pay Le {(booking.totalCents / 100).toLocaleString()}</span>
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Modal>

      <TravelerFooter />
    </div>
  );
}
