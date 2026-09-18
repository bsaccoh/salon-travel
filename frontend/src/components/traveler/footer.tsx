'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const NEWSLETTER_BG = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&h=500&fit=crop&q=80';

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function TravelerFooter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  }

  return (
    <>
      {/* ── NEWSLETTER ── */}
      <section
        className="relative py-14 overflow-hidden"
        style={{ backgroundImage: `url(${NEWSLETTER_BG})`, backgroundSize: 'cover', backgroundPosition: 'right center' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(6,59,99,1) 0%, rgba(6,59,99,0.97) 35%, rgba(6,59,99,0.80) 60%, rgba(6,59,99,0.25) 100%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          <div className="w-14 h-14 rounded-full bg-[#168B55]/20 border border-[#168B55]/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="text-center lg:text-left flex-1">
            <div className="text-[0.65rem] font-bold tracking-[2px] uppercase text-white/60 mb-1.5">Stay Connected</div>
            <div className="text-[1.4rem] font-extrabold text-white mb-1">Get Travel Tips & Exclusive Offers</div>
            <div className="text-[0.85rem] text-white/65">
              Subscribe to our newsletter and be the first to know about new destinations, special deals and travel inspiration.
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2.5 shrink-0 w-full lg:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 lg:w-[300px] px-4 py-3 border-2 border-white/15 rounded-xl bg-white/[0.08] text-white text-[0.9rem] placeholder:text-white/40 focus:outline-none focus:border-[#168B55] focus:bg-white/[0.12] transition-colors"
            />
            <button type="submit" className="px-6 py-3 bg-[#168B55] text-white border-none rounded-xl text-[0.88rem] font-bold cursor-pointer hover:bg-[#169B5B] hover:-translate-y-px transition-all whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
        {done && (
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 mt-4">
            <div className="bg-[#168B55]/20 border border-[#168B55]/30 text-white text-sm px-4 py-2.5 rounded-xl text-center">
              Thanks for subscribing! You&apos;ll receive travel tips and exclusive offers.
            </div>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A2340] pt-10 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#168B55] rounded-full flex items-center justify-center text-white text-base">🌍</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[1.1rem] font-extrabold text-white">
                    <span className="text-white">Salone</span><span className="text-[#39C96B]">Travel</span>
                  </span>
                  <span className="text-[0.5rem] font-semibold tracking-[2px] uppercase text-white/40">Explore · Discover · Experience</span>
                </div>
              </div>
              <p className="text-[0.82rem] text-white/50 leading-relaxed max-w-[260px]">
                Explore, discover and experience the true beauty of Sierra Leone with trusted local guides and verified service providers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <div className="text-[0.85rem] font-bold text-white mb-4">Quick Links</div>
              {['Home', 'Destinations', 'Packages', 'Experiences', 'How It Works'].map(link => (
                <Link
                  key={link}
                  href={link === 'Home' ? '/' : `/${link.toLowerCase().replace(/ /g, '-')}`}
                  className="block text-[0.82rem] text-white/50 py-1.5 hover:text-white/90 transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <div className="text-[0.85rem] font-bold text-white mb-4">Support</div>
              {['Help Center', 'Contact Us', 'FAQs', 'Terms & Conditions', 'Privacy Policy'].map(link => (
                <a key={link} href="#" className="block text-[0.82rem] text-white/50 py-1.5 hover:text-white/90 transition-colors">
                  {link}
                </a>
              ))}
            </div>

            {/* Follow Us */}
            <div>
              <div className="text-[0.85rem] font-bold text-white mb-4">Follow Us</div>
              <div className="flex gap-2">
                {[
                  { label: 'f',  title: 'Facebook',    bg: 'bg-[#1877F2]' },
                  { label: 'in', title: 'Instagram',   bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
                  { label: 'X',  title: 'X (Twitter)', bg: 'bg-[#14171A]' },
                  { label: '▶',  title: 'YouTube',     bg: 'bg-[#FF0000]' },
                  { label: 'tt', title: 'TikTok',      bg: 'bg-[#2D2D2D]' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    title={s.title}
                    className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold hover:opacity-90 hover:scale-105 transition-all shrink-0', s.bg)}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[0.78rem] text-white/40">© 2026 SaloneTravel. All rights reserved.</div>
            <div className="text-[0.78rem] text-white/40">Made with ❤️ in Sierra Leone 🇸🇱</div>
          </div>
        </div>
      </footer>
    </>
  );
}
