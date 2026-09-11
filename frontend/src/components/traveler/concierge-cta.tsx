import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Sparkles, ShieldCheck } from 'lucide-react';

export function ConciergeCTA() {
  return (
    <section className="w-full py-16 bg-primary-dark text-white relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-warning/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-warning text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Trip Planning</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Not sure where to start?
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
          Chat with a local concierge and get a personalised plan in minutes. From airport transfers to secret island hideaways, we are with you every step of the way.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/messages">
            <Button
              variant="traveler-cta"
              size="lg"
              className="h-14 px-8 text-base shadow-elevated gap-3 bg-white text-accent hover:bg-slate-light"
            >
              <MessageSquareText className="w-5 h-5 text-accent" />
              <span>Talk to concierge</span>
            </Button>
          </Link>

          <Link href="/#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base text-white border-white/30 bg-transparent hover:bg-white/10"
            >
              <ShieldCheck className="w-5 h-5 mr-2 text-warning" />
              <span>How our concierge works</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
