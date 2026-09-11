import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  providerName: string;
  providerSlug: string;
  priceCents: number;
  duration: string;
  maxGuests: number;
}

interface DestinationData {
  slug: string;
  name: string;
  category: string;
  region: string;
  rating: number;
  reviewsCount: number;
  heroImage: string;
  description: string;
  highlights: string[];
  services: ServiceItem[];
}

const destinationsDatabase: Record<string, DestinationData> = {
  'river-no-2-beach': {
    slug: 'river-no-2-beach',
    name: 'River No. 2 Beach',
    category: 'Pristine Beach',
    region: 'Western Area Peninsula',
    rating: 4.9,
    reviewsCount: 184,
    heroImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    description:
      'Renowned for its blinding white sands and turquoise freshwater estuary meeting the Atlantic Ocean, River No. 2 Beach is widely acclaimed as one of West Africa’s most breathtaking coastal treasures. Managed directly by the local community association, the beach provides sustainable tourism, fresh Atlantic seafood, and tranquil lagoon boat tours.',
    highlights: [
      'Community-managed eco-tourism ensuring direct local benefit',
      'Fresh Atlantic barracuda, lobster, and cassava bread served beachside',
      'Calm, safe swimming lagoon ideal for families and water sports',
      'Direct boat excursions upriver into lush mangrove rainforests',
    ],
    services: [
      {
        id: 'srv-1',
        name: 'Private Peninsula Beach Transfer & Day Tour',
        providerName: 'Freetown Coastal Transfers',
        providerSlug: 'freetown-coastal-transfers',
        priceCents: 120000,
        duration: '6 Hours',
        maxGuests: 4,
      },
      {
        id: 'srv-2',
        name: 'Mangrove River Eco-Boat Safari & Lunch',
        providerName: 'Banana Island Eco Tours',
        providerSlug: 'banana-island-eco-tours',
        priceCents: 95000,
        duration: '3 Hours',
        maxGuests: 6,
      },
    ],
  },

  'banana-islands': {
    slug: 'banana-islands',
    name: 'Banana Islands Archipelago',
    category: 'Historic Island Excursion',
    region: 'Southern Peninsula Coast',
    rating: 4.9,
    reviewsCount: 142,
    heroImage:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85',
    description:
      'Comprising Dublin, Ricketts, and Mes-Meheux islands, the Banana Islands offer historical 18th-century stone church ruins, scenic fishing harbors, secluded Atlantic beaches, and some of the finest snorkeling and scuba reefs in West Africa.',
    highlights: [
      'Historical walking trail through colonial-era church and fort ruins',
      'Protected coral reefs with exceptional marine visibility for snorkeling',
      'Authentic fresh seafood feasts prepared by island host families',
      'Scenic island-hopping boat charters across Dublin and Ricketts',
    ],
    services: [
      {
        id: 'srv-101',
        name: 'Banana Islands Day Boat Charter & Snorkeling',
        providerName: 'Banana Island Eco Tours',
        providerSlug: 'banana-island-eco-tours',
        priceCents: 150000,
        duration: '7 Hours',
        maxGuests: 6,
      },
      {
        id: 'srv-102',
        name: 'Sunset Dolphin Cruise & Mangrove Canoe Tour',
        providerName: 'Banana Island Eco Tours',
        providerSlug: 'banana-island-eco-tours',
        priceCents: 100000,
        duration: '3.5 Hours',
        maxGuests: 4,
      },
    ],
  },

  'tacugama-sanctuary': {
    slug: 'tacugama-sanctuary',
    name: 'Tacugama Chimpanzee Sanctuary',
    category: 'Wildlife Rainforest Sanctuary',
    region: 'Western Area Rainforest',
    rating: 4.8,
    reviewsCount: 96,
    heroImage:
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1600&q=85',
    description:
      'Nestled deep inside the primary mountain rainforest of Regent village, Tacugama is world-renowned for rescuing and rehabilitating endangered Western Chimpanzees. Visitors experience educational guided treks, serene waterfall ravines, and lush canopy trails.',
    highlights: [
      'Home to over 100 rescued Western Chimpanzees in natural forest enclosures',
      'Pristine mountain rainforest canopy hiking trails and waterfalls',
      'Accredited educational naturalist guides providing wildlife conservation insights',
      'Eco-lodges and tranquil nature retreat setting in the Freetown hills',
    ],
    services: [
      {
        id: 'srv-201',
        name: 'Tacugama Chimpanzee Sanctuary & Canopy Trek',
        providerName: 'Salone Rainforest Guides',
        providerSlug: 'salone-rainforest-guides',
        priceCents: 75000,
        duration: '4 Hours',
        maxGuests: 8,
      },
      {
        id: 'srv-202',
        name: 'Peninsula Mountain Rainforest Birding Expedition',
        providerName: 'Salone Rainforest Guides',
        providerSlug: 'salone-rainforest-guides',
        priceCents: 90000,
        duration: '5 Hours',
        maxGuests: 4,
      },
    ],
  },

  'bunce-island': {
    slug: 'bunce-island',
    name: 'Bunce Island Heritage Site',
    category: 'Historic Memorial & Ruins',
    region: 'Sierra Leone River Estuary',
    rating: 4.9,
    reviewsCount: 120,
    heroImage:
      'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1600&q=85',
    description:
      'Located 30 kilometers up the Sierra Leone River, Bunce Island was one of the principal British slave-trading castles in West Africa. Today, its haunting stone fortress ruins, merchant quarters, and ancient cannons stand preserved in a peaceful forest setting.',
    highlights: [
      'Profound historical connection to the African-American Gullah diaspora',
      'Remarkably preserved 18th-century stone fortress walls, cannon batteries, and gatehouses',
      'Scenic riverboat cruise up the Sierra Leone River Estuary',
      'Accompanied by accredited national historians and heritage curators',
    ],
    services: [
      {
        id: 'srv-401',
        name: 'Bunce Island Historical River Expedition',
        providerName: 'Freetown Coastal Transfers',
        providerSlug: 'freetown-coastal-transfers',
        priceCents: 120000,
        duration: '5 Hours',
        maxGuests: 6,
      },
    ],
  },

  'bureh-beach': {
    slug: 'bureh-beach',
    name: 'Bureh Beach Surf & Lagoon',
    category: 'Watersports & Beach',
    region: 'Western Area Peninsula',
    rating: 4.8,
    reviewsCount: 85,
    heroImage:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85',
    description:
      'Bureh Beach is the epicenter of Sierra Leone’s vibrant surf culture. Featuring warm Atlantic swell breaks on one side and a crystal-clear freshwater river lagoon on the other, it offers beginner surf lessons, board rentals, and authentic beach grill shack culture.',
    highlights: [
      'Home to the Bureh Surf Club with lessons for beginners and seasoned riders',
      'Picturesque river meeting the sea, perfect for kayaking and SUP boarding',
      'Authentic relaxed beach shacks with wood-fired grilled seafood',
      'Surrounded by dramatic rainforest-clad peninsula mountains',
    ],
    services: [
      {
        id: 'srv-501',
        name: 'Bureh Surf Lesson & Peninsula Day Tour',
        providerName: 'Freetown Coastal Transfers',
        providerSlug: 'freetown-coastal-transfers',
        priceCents: 100000,
        duration: '6 Hours',
        maxGuests: 4,
      },
    ],
  },

  'tokeh-beach': {
    slug: 'tokeh-beach',
    name: 'Tokeh Sands Beach Resort',
    category: 'Luxury Coastal Resort',
    region: 'Western Area Peninsula',
    rating: 4.9,
    reviewsCount: 110,
    heroImage:
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1600&q=85',
    description:
      'Known for its endless miles of soft white sand and towering palm trees, Tokeh Beach is home to premier beachfront eco-resorts. Relax in seaside chalets, savor freshly prepared Atlantic oysters, and take sunset strolls along the tranquil shoreline.',
    highlights: [
      'Miles of uncrowded powder-white sands backed by tropical forest hills',
      'Upscale beachfront restaurants serving gourmet seafood and cocktails',
      'Private ocean boat excursions and jet ski rentals available',
      'Ideal for romantic escapes, honeymoons, and peaceful weekend getaways',
    ],
    services: [
      {
        id: 'srv-601',
        name: 'Tokeh Coastal Resort Day Pass & Sunset Dinner',
        providerName: 'Freetown Coastal Transfers',
        providerSlug: 'freetown-coastal-transfers',
        priceCents: 180000,
        duration: '8 Hours',
        maxGuests: 4,
      },
    ],
  },

  'tiwai-island': {
    slug: 'tiwai-island',
    name: 'Tiwai Island Wildlife Sanctuary',
    category: 'Pristine Wildlife Sanctuary',
    region: 'Moa River, Southern Province',
    rating: 4.8,
    reviewsCount: 65,
    heroImage:
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1600&q=85',
    description:
      'Located on the Moa River in the Southern Province, Tiwai Island boasts one of the highest concentrations and diversities of primates on Earth, including the rare pygmy hippopotamus, colobus monkeys, and over 130 species of tropical birds.',
    highlights: [
      'Over 11 primate species living in pristine river island jungle',
      'Canoe river safaris and nocturnal rainforest wildlife tracking',
      'Community-owned conservation project run with local Mende villages',
      'Immersive eco-campsite experiences under the African stars',
    ],
    services: [
      {
        id: 'srv-701',
        name: 'Tiwai Island 2-Day Wildlife & Pygmy Hippo Safari',
        providerName: 'Salone Rainforest Guides',
        providerSlug: 'salone-rainforest-guides',
        priceCents: 160000,
        duration: '2 Days',
        maxGuests: 6,
      },
    ],
  },

  'outamba-kilimi': {
    slug: 'outamba-kilimi',
    name: 'Outamba-Kilimi National Park',
    category: 'Savannah & Forest National Park',
    region: 'Northern Province (Bombali & Karene)',
    rating: 4.7,
    reviewsCount: 52,
    heroImage:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
    description:
      'Sierra Leone’s premier wilderness national park features rolling savannah grasslands, lush riverine forests, and the Great Scarcies River. Wildlife includes elephants, hippos, chimpanzees, bongo antelopes, and hundreds of bird species.',
    highlights: [
      'Canoe safaris along the Little and Great Scarcies River to spot swimming hippos',
      'Savannah game tracking trails led by indigenous Susu park rangers',
      'Breathtaking sunsets across the northern granite inselbergs',
      'True off-the-beaten-path African wilderness adventure',
    ],
    services: [
      {
        id: 'srv-801',
        name: 'Outamba-Kilimi 3-Day Savannah Wilderness Expedition',
        providerName: 'Salone Rainforest Guides',
        providerSlug: 'salone-rainforest-guides',
        priceCents: 220000,
        duration: '3 Days',
        maxGuests: 4,
      },
    ],
  },
};

export default function DestinationDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const normalizedSlug = params.slug.toLowerCase().trim();

  const destination =
    destinationsDatabase[normalizedSlug] ||
    (normalizedSlug.includes('tokeh')
      ? destinationsDatabase['tokeh-beach']
      : normalizedSlug.includes('tiwai')
      ? destinationsDatabase['tiwai-island']
      : normalizedSlug.includes('outamba') || normalizedSlug.includes('kilimi')
      ? destinationsDatabase['outamba-kilimi']
      : normalizedSlug.includes('bureh')
      ? destinationsDatabase['bureh-beach']
      : normalizedSlug.includes('tacugama')
      ? destinationsDatabase['tacugama-sanctuary']
      : normalizedSlug.includes('bunce')
      ? destinationsDatabase['bunce-island']
      : normalizedSlug.includes('banana')
      ? destinationsDatabase['banana-islands']
      : destinationsDatabase['river-no-2-beach']);

  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background">
        {/* 1. Immersive Hero Banner */}
        <div className="relative w-full h-[45vh] min-h-[360px] bg-primary-dark">
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />

          {/* Hero Content Overlays */}
          <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white">
            <div className="flex items-center gap-2 text-warning text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>{destination.category}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {destination.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-warning" />
                <span>{destination.region}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>{destination.rating}</span>
                <span className="text-white/70 font-normal">
                  ({destination.reviewsCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-success-light">
                <ShieldCheck className="w-4 h-4 text-warning" />
                <span>Verified Tourism Partner Site</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Destination Highlights & Bookable Services */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Col: Overview, Highlights, Services */}
            <div className="lg:col-span-8 space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-text mb-4">About the Destination</h2>
                <p className="text-base text-text-muted leading-relaxed font-normal">
                  {destination.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-lg font-bold text-text">Destination Highlights</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-muted">
                  {destination.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Excursions */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-text">Bookable Excursions &amp; Tours</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Direct booking with verified, accredited local operators
                  </p>
                </div>

                <div className="space-y-4">
                  {destination.services.map((service) => (
                    <div
                      key={service.id}
                      className="p-6 rounded-2xl border border-border bg-surface shadow-card hover:border-primary/40 transition-smooth space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            {service.providerName}
                          </span>
                          <h3 className="text-base font-bold text-text mt-0.5">
                            {service.name}
                          </h3>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-text-muted">Total </span>
                          <span className="text-2xl font-extrabold text-primary-dark">
                            Le {(service.priceCents / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs text-text-muted font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>Up to {service.maxGuests} guests</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link href={`/providers/${service.providerSlug}`}>
                            <Button variant="outline" size="sm" className="font-semibold">
                              View Host
                            </Button>
                          </Link>

                          <Link href={`/bookings/new?serviceId=${service.id}`}>
                            <Button variant="traveler-cta" size="sm" className="font-bold">
                              <span>Book Tour</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Concierge & Travel Tips */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                  Planning Your Trip
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-normal">
                  Need a customized itinerary or private boat coordination to {destination.name}? Our on-ground Freetown concierge team is available 24/7.
                </p>
                <Link href="/messages" className="block">
                  <Button variant="traveler-cta" size="md" className="w-full font-bold">
                    Chat with Concierge
                  </Button>
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3 text-xs text-text-muted">
                <h4 className="font-bold text-text">Best Time to Visit</h4>
                <p>Dry season (November to April) offers peak sunshine, calm ocean waters, and ideal visibility for snorkeling and hiking.</p>
              </div>
            </div>
          </div>
        </div>

        <ConciergeCTA />
      </main>

      <TravelerFooter />
    </div>
  );
}
