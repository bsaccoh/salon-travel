import { PrismaClient, UserRole, ProviderCategory, ProviderStatus, VerificationStatus, DestinationCategory, ServiceType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

import argon2 from 'argon2';

/**
 * Hash a password using argon2 so seeded users can actually log in.
 */
async function generateHash(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

async function main() {
  console.log('🌱 Seeding Salone Travel database...');

  // ── Users ──────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@salonetravel.dev' },
    update: {},
    create: {
      email: 'admin@salonetravel.dev',
      fullName: 'System Administrator',
      passwordHash: await generateHash('Admin123!@#'),
      role: UserRole.admin,
      emailVerifiedAt: new Date(),
      locale: 'en-SL',
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} (${admin.id})`);

  const concierge = await prisma.user.upsert({
    where: { email: 'concierge@salonetravel.dev' },
    update: {},
    create: {
      email: 'concierge@salonetravel.dev',
      fullName: 'Sarah Kamara',
      passwordHash: await generateHash('Concierge123!@#'),
      role: UserRole.concierge,
      phone: '+23276000001',
      emailVerifiedAt: new Date(),
      locale: 'en-SL',
    },
  });
  console.log(`  ✓ Concierge user: ${concierge.email} (${concierge.id})`);

  const traveler = await prisma.user.upsert({
    where: { email: 'traveler@salonetravel.dev' },
    update: {},
    create: {
      email: 'traveler@salonetravel.dev',
      fullName: 'Alex Johnson',
      passwordHash: await generateHash('Traveler123!@#'),
      role: UserRole.traveler,
      phone: '+44700000001',
      emailVerifiedAt: new Date(),
      locale: 'en-SL',
    },
  });
  console.log(`  ✓ Traveler user: ${traveler.email} (${traveler.id})`);

  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@salonetravel.dev' },
    update: {},
    create: {
      email: 'provider@salonetravel.dev',
      fullName: 'Mohamed Sesay',
      passwordHash: await generateHash('Provider123!@#'),
      role: UserRole.provider,
      phone: '+23276000002',
      emailVerifiedAt: new Date(),
      locale: 'en-SL',
    },
  });
  console.log(`  ✓ Provider user: ${providerUser.email} (${providerUser.id})`);

  // ── Traveler Profile ───────────────────────────────────

  await prisma.travelerProfile.upsert({
    where: { userId: traveler.id },
    update: {},
    create: {
      userId: traveler.id,
      nationality: 'British',
      passportCountry: 'GB',
      interests: ['beaches', 'wildlife', 'culture'],
      dietaryPrefs: ['vegetarian'],
      emergencyName: 'Jane Johnson',
      emergencyPhone: '+44700000002',
    },
  });
  console.log('  ✓ Traveler profile created');

  // ── Provider ───────────────────────────────────────────

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      businessName: 'Freetown Beach Lodge',
      category: ProviderCategory.hotel,
      status: ProviderStatus.approved,
      verificationStatus: VerificationStatus.verified,
      description:
        'A beautiful beachfront lodge located on Lumley Beach in Freetown. Offering comfortable rooms with stunning ocean views, local cuisine, and guided tours to nearby attractions.',
      phone: '+23276000002',
      email: 'info@freetownbeachlodge.dev',
      website: 'https://freetownbeachlodge.dev',
      address: '15 Lumley Beach Road',
      city: 'Freetown',
      region: 'Western Area',
      latitude: 8.4657,
      longitude: -13.2317,
      commissionRate: 15,
      verifiedAt: new Date(),
    },
  });
  console.log(`  ✓ Provider: ${provider.businessName} (${provider.id})`);

  // ── Service ────────────────────────────────────────────

  const service = await prisma.service.upsert({
    where: { id: provider.id }, // Use provider.id as a deterministic lookup
    update: {},
    create: {
      providerId: provider.id,
      name: 'Ocean View Deluxe Room',
      type: ServiceType.accommodation,
      description:
        'Spacious deluxe room with panoramic ocean views, private balcony, air conditioning, WiFi, and complimentary breakfast.',
      shortDescription: 'Beachfront deluxe room with ocean views',
      priceCents: 15000000, // 150,000 SLL
      currency: 'SLL',
      durationMinutes: 1440, // 24 hours (1 night)
      maxCapacity: 2,
      images: [],
      inclusions: ['Breakfast', 'WiFi', 'Airport pickup'],
      exclusions: ['Lunch', 'Dinner', 'Tours'],
      isActive: true,
    },
  });
  console.log(`  ✓ Service: ${service.name} (${service.id})`);

  // ── Destinations ───────────────────────────────────────

  const destinations = [
    {
      name: 'Lumley Beach',
      slug: 'lumley-beach',
      category: DestinationCategory.beach,
      description:
        'The most popular beach in Freetown, stretching along the Atlantic coast. Known for its vibrant atmosphere, beach bars, and stunning sunsets.',
      shortDescription: 'Freetown\'s iconic Atlantic beach',
      region: 'Western Area',
      latitude: 8.4657,
      longitude: -13.2317,
      highlights: ['Sunset views', 'Beach bars', 'Water sports', 'Local cuisine'],
      isFeatured: true,
    },
    {
      name: 'Tiwai Island',
      slug: 'tiwai-island',
      category: DestinationCategory.wildlife,
      description:
        'One of the most important wildlife sanctuaries in West Africa. Home to 11 species of primates including pygmy hippos, chimpanzees, and rare birds.',
      shortDescription: 'Premier wildlife sanctuary with rare primates',
      region: 'Southern Province',
      latitude: 7.5333,
      longitude: -11.3500,
      highlights: ['Pygmy hippos', 'Chimpanzee tracking', 'Bird watching', 'Boat trips'],
      isFeatured: true,
    },
    {
      name: 'Bunce Island',
      slug: 'bunce-island',
      category: DestinationCategory.heritage,
      description:
        'A historically significant island in the Sierra Leone River. One of the most important slave trade sites in West Africa, offering a powerful and educational experience.',
      shortDescription: 'Historic slave trade heritage site',
      region: 'Western Area',
      latitude: 8.5833,
      longitude: -13.0667,
      highlights: ['Historical tours', 'River trip', 'Cultural education'],
      isFeatured: true,
    },
    {
      name: 'Banana Islands',
      slug: 'banana-islands',
      category: DestinationCategory.island,
      description:
        'A group of three islands off the coast of the Freetown Peninsula. Known for pristine beaches, snorkeling, and a peaceful escape from the city.',
      shortDescription: 'Pristine island getaway with crystal waters',
      region: 'Western Area',
      latitude: 8.2167,
      longitude: -13.2000,
      highlights: ['Snorkeling', 'Pristine beaches', 'Fishing villages', 'Boat trips'],
      isFeatured: true,
    },
  ];

  for (const dest of destinations) {
    const created = await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {},
      create: {
        ...dest,
        images: [],
      },
    });
    console.log(`  ✓ Destination: ${created.name}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Development Credentials:');
  console.log('  Admin:     admin@salonetravel.dev / Admin123!@#');
  console.log('  Concierge: concierge@salonetravel.dev / Concierge123!@#');
  console.log('  Traveler:  traveler@salonetravel.dev / Traveler123!@#');
  console.log('  Provider:  provider@salonetravel.dev / Provider123!@#');
  console.log('\n⚠️  These credentials are for development only!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
