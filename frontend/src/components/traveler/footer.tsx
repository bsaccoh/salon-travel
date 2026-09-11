import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Heart } from 'lucide-react';
import { TravelerMobileNav } from './mobile-nav';

export function TravelerFooter() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary-dark shadow-sm">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Salone<span className="text-accent">Travel</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed font-normal">
              Sierra Leone&apos;s premier travel concierge marketplace connecting travelers directly with verified local hosts, expert tour guides, and 24/7 on-ground assistance.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-warning">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Local Tourism Marketplace</span>
            </div>
          </div>

          {/* Col 1: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70 font-medium">
              <li>
                <Link href="/destinations" className="hover:text-white transition-smooth">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/providers" className="hover:text-white transition-smooth">
                  Local Providers
                </Link>
              </li>
              <li>
                <Link href="/#experiences" className="hover:text-white transition-smooth">
                  Curated Experiences
                </Link>
              </li>
              <li>
                <Link href="/destinations?category=beach" className="hover:text-white transition-smooth">
                  Pristine Beaches
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-4">
              Platform Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-smooth">
                  Traveler App (PWA)
                </Link>
              </li>
              <li>
                <Link href="/provider" className="hover:text-white transition-smooth">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/concierge" className="hover:text-white transition-smooth">
                  Concierge Desk
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-smooth">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70 font-medium">
              <li>
                <Link href="/messages" className="hover:text-white transition-smooth">
                  Live Concierge Chat
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-smooth">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#terms" className="hover:text-white transition-smooth">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="hover:text-white transition-smooth">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} Salone Travel Concierge Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-accent fill-accent" /> for Sierra Leone Tourism
          </p>
        </div>
      </div>
      <TravelerMobileNav />
    </footer>
  );
}
