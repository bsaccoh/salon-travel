'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useDestinations } from '@/hooks/use-destinations';
import { usePackages, Package } from '@/hooks/use-packages';
import {
  MapPin, Calendar, Users, Search, Globe, ChevronDown, Star,
  Menu, X, ChevronRight, Shield, ShieldCheck, Headset, Heart, LogOut,
  LayoutDashboard, MessageSquare, User as UserIcon,
  Plane, Palmtree, HeartHandshake, Camera, Compass,
  LayoutGrid, Tag,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { TravelerFooter } from '@/components/traveler/footer';

/* ─── IMAGE CONSTANTS ─────────────────────────────────── */
const HERO_IMG = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop&q=80';

const DEST_IMGS = {
  tacugama: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=500&h=400&fit=crop&q=80',
  banana:   'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=500&h=400&fit=crop&q=80',
  tiwai:    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=500&h=400&fit=crop&q=80',
  freetown: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=400&fit=crop&q=80',
};

const EXP_IMGS = {
  beach:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=400&fit=crop&q=80',
  cultural:  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=500&h=400&fit=crop&q=80',
  wildlife:  'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=500&h=400&fit=crop&q=80',
  adventure: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&h=400&fit=crop&q=80',
};

const WHY_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80';

const TESTIMONIAL_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
];

const BADGE_COLORS: Record<string, string> = {
  'Popular':     'bg-[#1B8A4A]',
  'Best Seller': 'bg-[#1565C0]',
  'Trending':    'bg-[#EE6C4D]',
};

/* ─── FALLBACK PACKAGES ───────────────────────────────── */
const FALLBACK_PACKAGES = [
  { name: '3 Days Banana Island Escape', duration_days: 3, duration_nights: 2, location: 'Freetown', price_per_person_cents: 35000, badge: 'Popular', tagline: 'Island hopping, beach relaxation, local cuisine.', hero_image_url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=400&fit=crop&q=80', slug: 'banana-island-escape' },
  { name: 'Tiwai Island Wildlife Tour', duration_days: 4, duration_nights: 3, location: 'Tiwai Island', price_per_person_cents: 62000, badge: 'Best Seller', tagline: 'Chimpanzee trekking, rainforest experience, nature walks.', hero_image_url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600&h=400&fit=crop&q=80', slug: 'tiwai-island-wildlife' },
  { name: 'Sherbro Island Getaway', duration_days: 4, duration_nights: 3, location: 'Sherbro Island', price_per_person_cents: 48000, badge: 'Trending', tagline: 'Beach, culture, fishing, and relaxation.', hero_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80', slug: 'sherbro-island-getaway' },
  { name: 'Freetown City Tour', duration_days: 2, duration_nights: 1, location: 'Freetown', price_per_person_cents: 18000, badge: '', tagline: 'Historical sites, museums, local food.', hero_image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop&q=80', slug: 'freetown-city-tour' },
];

/* ─── DESTINATIONS DATA ───────────────────────────────── */
const DEST_CARDS = [
  { name: 'Tacugama', desc: 'Nature, wildlife & conservation', img: DEST_IMGS.tacugama, slug: 'tacugama-sanctuary' },
  { name: 'Banana Islands', desc: 'Islands, beaches & relaxation', img: DEST_IMGS.banana, slug: 'banana-islands' },
  { name: 'Tiwai Island', desc: 'Rainforest & chimpanzees', img: DEST_IMGS.tiwai, slug: 'tiwai-island' },
  { name: 'Freetown', desc: 'History, culture & nightlife', img: DEST_IMGS.freetown, slug: 'freetown' },
];

const EXP_CARDS = [
  { name: 'Beach Getaways', desc: 'Relax on pristine beaches and crystal-clear waters.', Icon: Palmtree, img: EXP_IMGS.beach },
  { name: 'Cultural Tours', desc: 'Experience our rich heritage and traditions.', Icon: HeartHandshake, img: EXP_IMGS.cultural },
  { name: 'Wildlife Encounters', desc: 'Meet unique wildlife in natural habitats.', Icon: Camera, img: EXP_IMGS.wildlife },
  { name: 'Adventure & Outdoor', desc: 'Hike, explore, and create lasting memories.', Icon: Compass, img: EXP_IMGS.adventure },
];

const TESTIMONIALS = [
  { quote: 'SaloneTravel made our family trip to Banana Island absolutely amazing. Everything was well organized!', name: 'Aminata K.', location: 'Freetown', stars: 5, img: TESTIMONIAL_AVATARS[0] },
  { quote: 'The Tiwai Island tour was unforgettable. Great service, professional team and breathtaking views!', name: 'Ibrahim S.', location: 'Freetown', stars: 5, img: TESTIMONIAL_AVATARS[1] },
  { quote: 'Easy booking, great prices and excellent customer support. I highly recommend SaloneTravel!', name: 'Fatmata J.', location: 'Freetown', stars: 5, img: TESTIMONIAL_AVATARS[2] },
];

/* ═══════════════════════════════════════════════════════ */
/*  HOMEPAGE                                              */
/* ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  // Search state
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhen, setSearchWhen] = useState('');
  const [searchGuests, setSearchGuests] = useState('2 Travelers');

  // Packages from API
  const { data: apiPackages, isLoading: packLoading } = usePackages({ featured: true, limit: 4 });
  const packages = apiPackages?.length ? apiPackages : null;

  // Scroll listener for nav shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchWhere.trim()) params.set('search', searchWhere.trim());
    if (searchWhen) params.set('date', searchWhen);
    if (searchGuests) params.set('guests', searchGuests.split(' ')[0]);
    router.push(`/destinations?${params.toString()}`);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Packages', href: '/packages' },
    { label: 'Providers', href: '/providers' },
    { label: 'Experiences', href: '/#experiences' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-[1000] bg-white h-[68px] flex items-center transition-shadow duration-300',
        scrolled ? 'shadow-[0_2px_12px_rgba(14,42,71,0.08)]' : 'shadow-[0_1px_0_rgba(14,42,71,0.06)]',
      )}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 w-full flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-green)] flex items-center justify-center text-white text-xl font-extrabold relative">
              🌍
              <span className="absolute inset-[2px] border-2 border-white/30 rounded-full" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[1.3rem] font-extrabold tracking-tight">
                <span className="text-[var(--brand-navy)]">Salone</span>
                <span className="text-[var(--brand-green)]">Travel</span>
              </span>
              <span className="text-[0.55rem] font-semibold tracking-[2.5px] uppercase text-gray-400">
                Explore · Discover · Experience
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map(link => (
              <Link key={link.label} href={link.href} className="px-3.5 py-2 text-[0.88rem] font-semibold text-[#14232B] rounded-lg hover:text-[var(--brand-green)] hover:bg-[var(--brand-green-light)] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="flex items-center gap-1 text-[0.85rem] text-[#5E7078] cursor-pointer">
              <Globe className="w-4 h-4" /> EN <ChevronDown className="w-3 h-3 opacity-70" />
            </span>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 h-[42px] pl-2 pr-3 rounded-full border border-[#DCE7E9] bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--brand-green)] text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-[0.82rem] font-medium text-[#14232B] max-w-[80px] truncate">
                    {user.fullName?.split(' ')[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#DCE7E9] bg-white p-2 shadow-lg z-50" onClick={() => setDropdownOpen(false)}>
                    <div className="px-3 py-2 border-b border-[#DCE7E9]/50">
                      <p className="text-xs font-bold truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'provider' && (
                      <Link href="/provider" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 rounded-lg mt-1">
                        <LayoutDashboard className="w-4 h-4 text-[var(--brand-green)]" /> Provider Dashboard
                      </Link>
                    )}
                    {(user.role === 'concierge' || user.role === 'admin') && (
                      <Link href="/concierge" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 rounded-lg mt-1">
                        <MessageSquare className="w-4 h-4 text-[var(--brand-green)]" /> Concierge Inbox
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 rounded-lg">
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}
                    <Link href="/bookings" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" /> My Bookings
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 rounded-lg">
                      <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                    </Link>
                    <button type="button" onClick={() => logout('/')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg text-left mt-1 border-t border-[#DCE7E9]/50 cursor-pointer">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="px-5 py-2 border-2 border-[#DCE7E9] rounded-full text-[0.85rem] font-semibold text-[#14232B] bg-transparent hover:border-[var(--brand-green)] hover:text-[var(--brand-green)] transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/register">
                  <button className="px-5 py-2 border-none rounded-full text-[0.85rem] font-bold text-white bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] transition-all shadow-[0_2px_8px_rgba(27,138,74,0.25)] hover:shadow-[0_4px_12px_rgba(27,138,74,0.35)] hover:-translate-y-px">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] bg-white border-b border-[#DCE7E9] shadow-lg z-[999] px-4 pt-2 pb-6 space-y-1 lg:hidden">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-[15px] font-semibold hover:text-[var(--brand-green)] hover:bg-[var(--brand-green-light)] rounded-lg">
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#DCE7E9] flex flex-col gap-3 mt-2">
            {user ? (
              <>
                <Link href="/bookings" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">My Bookings</Link>
                <button onClick={() => { setMobileOpen(false); logout('/'); }} className="w-full text-left py-2.5 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full h-11 bg-white text-[#14232B] font-semibold rounded-xl border border-[#DCE7E9]">Sign In</button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full h-11 bg-[var(--brand-green)] text-white font-semibold rounded-xl">Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* ════════════════════ HERO ════════════════════ */}
        <section
          className="relative mt-[68px] min-h-[480px] md:min-h-[560px]"
          style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,42,71,0.88) 0%, rgba(14,42,71,0.65) 45%, rgba(14,42,71,0.15) 75%, transparent 100%)' }} />

          {/* Text content */}
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-[90px] pb-[140px] md:pb-[160px]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[0.75rem] font-bold tracking-[2.5px] uppercase text-white">Salone Travel</span>
            </div>
            <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.4rem] font-extrabold text-white leading-[1.1] tracking-tight max-w-[700px] mb-4">
              Discover the True Beauty<br />of <span className="text-[#4ADE80]">Sierra Leone</span>
            </h1>
            <p className="text-[0.95rem] md:text-[1.05rem] text-white/80 leading-relaxed max-w-[480px]">
              Explore stunning islands, pristine beaches, rich culture, and unforgettable experiences. Your next adventure starts here.
            </p>
          </div>

          {/* Floating search bar — protrudes below the hero */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 translate-y-1/2">
            <form onSubmit={handleSearch} className="max-w-[960px] mx-auto bg-white rounded-2xl p-1.5 flex flex-col md:flex-row items-stretch gap-0 shadow-[0_16px_48px_rgba(14,42,71,0.22)]">
              <div className="flex-1 flex flex-col px-5 py-3.5 border-b md:border-b-0 md:border-r border-[#DCE7E9] min-w-0">
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-[#168B55] flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3 h-3" /> WHERE TO?
                </label>
                <div className="flex items-center gap-1">
                  <input type="text" placeholder="e.g. River No. 2, Banana Islands" value={searchWhere} onChange={e => setSearchWhere(e.target.value)} className="border-none outline-none text-[0.9rem] text-[#14232B] bg-transparent flex-1 placeholder:text-[#94A3B0]" />
                  <ChevronDown className="w-4 h-4 text-[#94A3B0] shrink-0" />
                </div>
              </div>
              <div className="flex-1 flex flex-col px-5 py-3.5 border-b md:border-b-0 md:border-r border-[#DCE7E9] min-w-0">
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-[#168B55] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3 h-3" /> WHEN?
                </label>
                <div className="flex items-center gap-1">
                  <input type="date" placeholder="Select dates" value={searchWhen} onChange={e => setSearchWhen(e.target.value)} className="border-none outline-none text-[0.9rem] text-[#14232B] bg-transparent flex-1 placeholder:text-[#94A3B0]" />
                </div>
              </div>
              <div className="flex-1 flex flex-col px-5 py-3.5 min-w-0">
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-[#168B55] flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3 h-3" /> GUESTS
                </label>
                <div className="flex items-center gap-1">
                  <select value={searchGuests} onChange={e => setSearchGuests(e.target.value)} className="border-none outline-none text-[0.9rem] text-[#14232B] bg-transparent flex-1 cursor-pointer appearance-none">
                    <option>1 Traveler</option>
                    <option>2 Travelers</option>
                    <option>3 Travelers</option>
                    <option>4 Travelers</option>
                    <option>5+ Travelers</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#94A3B0] shrink-0" />
                </div>
              </div>
              <button type="submit" className="m-1.5 py-3.5 px-8 bg-[#168B55] text-white border-none rounded-xl text-[0.9rem] font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#169B5B] transition-colors shrink-0">
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
          </div>
        </section>

        {/* ════════════════════ TRUST BADGES ════════════════════ */}
        <section className="bg-[#F4FAFC] pt-24 pb-10 border-b border-[#DCE7EC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-[5%] lg:px-[7%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {([
              { Icon: Plane,       title: 'Trusted Providers',    desc: 'Verified local and international service providers' },
              { Icon: ShieldCheck, title: 'Secure Booking',       desc: 'Safe and hassle-free payments' },
              { Icon: Headset,     title: '24/7 Support',         desc: "We're here whenever you need us" },
              { Icon: Star,        title: 'Authentic Experiences', desc: 'Real people. Real stories. Real Sierra Leone.' },
            ] as const).map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#168B55]/10 text-[#168B55] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#0B3554] mb-1">{title}</h3>
                  <p className="text-[14px] text-[#637A8C] leading-[1.5]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════ POPULAR DESTINATIONS ════════════════════ */}
        <section className="py-[72px]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 items-start">
              <div>
                <SectionLabel>Popular Destinations</SectionLabel>
                <h2 className="text-[2rem] font-extrabold text-[#14232B] tracking-tight leading-[1.15] mb-2.5">
                  Explore Sierra Leone&apos;s Most Loved Destinations
                </h2>
                <p className="text-[0.95rem] text-[#5E7078] leading-relaxed max-w-[480px] mb-6">
                  From beautiful beaches to historic sites, find the perfect place for your next journey.
                </p>
                <Link href="/destinations" className="inline-flex items-center gap-1.5 h-11 px-6 bg-[#168B55] hover:bg-[#169B5B] text-white rounded-xl text-[0.88rem] font-semibold transition-colors shadow-[0_2px_8px_rgba(22,139,85,0.25)]">
                  View All Destinations <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {DEST_CARDS.map((d, i) => (
                  <Link
                    key={i}
                    href={`/destinations/${d.slug}`}
                    className="group relative block rounded-2xl overflow-hidden aspect-[4/5] shadow-[0_2px_8px_rgba(6,59,99,0.08)] hover:shadow-[0_8px_24px_rgba(6,59,99,0.16)] transition-all"
                    style={{ backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className="absolute inset-0 bg-[#063B63]/20 group-hover:bg-[#063B63]/10 transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#063B63]/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1.5 text-white mb-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[15px] font-bold leading-tight">{d.name}</span>
                      </div>
                      <p className="text-[12px] text-white/80 leading-snug pl-5">{d.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ TOP EXPERIENCES ════════════════════ */}
        <section className="py-[72px] bg-[#F5F7F9]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 items-start">
              <div>
                <SectionLabel>Top Experiences</SectionLabel>
                <h2 className="text-[2rem] font-extrabold text-[#14232B] tracking-tight leading-[1.15] mb-2.5">
                  Unforgettable Travel Experiences
                </h2>
                <p className="text-[0.95rem] text-[#5E7078] leading-relaxed max-w-[480px] mb-6">
                  Feel the rhythm of Sierra Leone with unique experiences designed for every traveler.
                </p>
                <Link href="/#experiences" className="inline-flex items-center gap-1.5 px-5 py-2.5 border-none rounded-full text-[0.88rem] font-bold text-white bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] hover:-translate-y-px shadow-[0_2px_8px_rgba(27,138,74,0.25)] hover:shadow-[0_4px_12px_rgba(27,138,74,0.35)] transition-all">
                  Explore Experiences <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {EXP_CARDS.map((exp, i) => (
                  <Link key={i} href="/#experiences" className="group block bg-white rounded-[20px] p-4 border border-[#DCE7EC] shadow-[0_2px_8px_rgba(6,59,99,0.06)] hover:shadow-[0_6px_20px_rgba(6,59,99,0.12)] hover:-translate-y-1 transition-all">
                    <div
                      className="aspect-[4/3] rounded-[14px] overflow-hidden mb-4 group-hover:scale-[1.03] transition-transform duration-500"
                      style={{ backgroundImage: `url(${exp.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="w-8 h-8 rounded-full bg-[#DDF5E9] text-[#168B55] flex items-center justify-center mb-3">
                      <exp.Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[15px] font-bold text-[#0B3554] mb-1.5 leading-tight">{exp.name}</h3>
                    <p className="text-[13px] text-[#637A8C] leading-[1.5]">{exp.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ CURATED PACKAGES ════════════════════ */}
        <section className="py-[72px]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
              <div>
                <SectionLabel>Featured Travel Packages</SectionLabel>
                <h2 className="text-[2rem] font-extrabold text-[#14232B] tracking-tight leading-[1.15] mb-2">
                  Curated Travel Packages
                </h2>
                <p className="text-[0.95rem] text-[#5E7078] leading-relaxed">
                  Handpicked itineraries for unforgettable journeys across Sierra Leone.
                </p>
              </div>
              <Link href="/packages" className="text-[0.88rem] font-semibold text-[var(--brand-green)] hover:underline flex items-center gap-1 shrink-0">
                View All Packages <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {packLoading ? (
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="h-[420px] rounded-2xl bg-gray-100 animate-pulse" />
                ))
              ) : (
                (packages || FALLBACK_PACKAGES).map((pkg, i) => (
                  <PackageCard key={i} pkg={pkg} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════ WHY CHOOSE US ════════════════════ */}
        <section className="py-[72px] bg-[#F5F7F9]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative rounded-[20px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={WHY_IMG} alt="Travel in Sierra Leone" className="w-full h-auto object-cover" />
                <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm px-5 py-3.5 rounded-xl">
                  <div className="text-[1.3rem] font-extrabold text-[var(--brand-navy)] italic leading-tight">
                    <em>Real Places</em><br /><em>Real Stories</em>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <SectionLabel>Why Choose SaloneTravel</SectionLabel>
                <h2 className="text-[2rem] font-extrabold text-[#14232B] tracking-tight leading-[1.15] mb-2.5">
                  Your Trusted Travel Partner in Sierra Leone
                </h2>
                <p className="text-[0.95rem] text-[#5E7078] leading-relaxed max-w-[480px] mb-6">
                  We make travel simple, safe and memorable. Whether you&apos;re exploring for leisure, business or adventure, SaloneTravel is here to give you the best experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {([
                    { Icon: Compass,    title: 'Local Expertise', desc: 'In-depth knowledge of Sierra Leone' },
                    { Icon: LayoutGrid, title: 'Wide Selection',  desc: 'Flights, hotels, tours and more' },
                    { Icon: Tag,        title: 'Best Prices',     desc: 'Great value for your money' },
                    { Icon: Heart,      title: 'Customer First',  desc: 'Your satisfaction is our priority' },
                  ] as const).map(({ Icon, title, desc }, i) => (
                    <div key={i} className="flex items-start gap-3.5 p-4 rounded-[14px] bg-white border border-[#DCE7EC] shadow-sm">
                      <div className="w-10 h-10 bg-[#DDF5E9] rounded-[10px] flex items-center justify-center text-[#168B55] shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[0.9rem] font-bold text-[#0B3554] mb-0.5">{title}</div>
                        <div className="text-[0.8rem] text-[#637A8C] leading-snug">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ TESTIMONIALS ════════════════════ */}
        <section className="py-[72px]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-8">
              <SectionLabel>Traveler Stories</SectionLabel>
              <h2 className="text-[2rem] font-extrabold text-[#14232B] tracking-tight leading-[1.15] mb-2">
                What Our Travelers Say
              </h2>
              <p className="text-[0.95rem] text-[#5E7078]">Real experiences. Real people. Real stories.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 shadow-[0_2px_8px_rgba(14,42,71,0.06)] border border-[#DCE7E9]/50">
                  <p className="text-[0.92rem] text-[#14232B] leading-relaxed mb-5 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.img} alt={t.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover" />
                    <div>
                      <div className="text-[0.88rem] font-bold text-[#14232B]">{t.name}</div>
                      <div className="text-[0.78rem] text-[#5E7078]">{t.location}</div>
                      <div className="text-[#F2B84B] text-[0.9rem] tracking-wider mt-0.5">
                        {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <TravelerFooter />
    </div>
  );
}

/* ─── SECTION LABEL COMPONENT ─────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.72rem] font-bold tracking-[2.5px] uppercase text-[var(--brand-green)] mb-2.5">
      {children}
    </div>
  );
}

/* ─── PACKAGE CARD COMPONENT ──────────────────────────── */
function PackageCard({ pkg }: { pkg: any }) {
  const name = pkg.name;
  const img = pkg.hero_image_url || pkg.heroImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop&q=80';
  const days = pkg.duration_days || pkg.durationDays || 1;
  const nights = pkg.duration_nights || pkg.durationNights || 0;
  const location = pkg.location || '';
  const desc = pkg.tagline || pkg.description || '';
  const priceCents = pkg.price_per_person_cents || pkg.pricePerPersonCents || 0;
  const badge = pkg.badge;
  const slug = pkg.slug;

  const badgeColor = badge ? (BADGE_COLORS[badge] || 'bg-[#1B8A4A]') : '';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(14,42,71,0.06)] border border-[#DCE7E9]/50 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(14,42,71,0.12)] transition-all flex flex-col">
      <div className="h-[200px] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={name} className="w-full h-full object-cover hover:scale-[1.06] transition-transform duration-500" />
        {badge && (
          <span className={cn('absolute top-3 left-3 px-3 py-1 rounded-full text-[0.7rem] font-bold text-white uppercase tracking-wide', badgeColor)}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-[18px] flex-1 flex flex-col">
        <h3 className="text-[1rem] font-bold text-[#14232B] mb-2 leading-tight">{name}</h3>
        <div className="flex flex-wrap gap-2.5 mb-2.5 text-[0.78rem] text-[#5E7078]">
          <span className="flex items-center gap-1"><span className="text-[0.85rem] opacity-70">📅</span> {days} Days</span>
          <span className="flex items-center gap-1"><span className="text-[0.85rem] opacity-70">🌙</span> {nights} Nights</span>
          {location && <span className="flex items-center gap-1"><span className="text-[0.85rem] opacity-70">📍</span> {location}</span>}
        </div>
        <p className="text-[0.82rem] text-[#5E7078] leading-normal mb-4 flex-1 line-clamp-2">{desc}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[1.3rem] font-extrabold text-[#14232B]">{formatCurrency(priceCents)}</span>
            <span className="text-[0.75rem] text-[#5E7078]"> / per person</span>
          </div>
          <Link href={slug ? `/packages/${slug}` : '/auth/register'} className="px-5 py-2 bg-[var(--brand-green)] text-white border-none rounded-full text-[0.82rem] font-bold hover:bg-[var(--brand-green-dark)] hover:-translate-y-px hover:shadow-[0_3px_10px_rgba(27,138,74,0.3)] transition-all">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
