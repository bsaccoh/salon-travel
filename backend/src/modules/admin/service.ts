import { UserStatus, UserRole, ProviderStatus, PaymentStatus, Prisma, ServiceType, DestinationCategory } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { auditService, AuditContext } from '../audit';
import { authRepository } from '../auth/auth.repository';
import { bookingRepository } from '../bookings/repository';
import { ListUsersQuery, UserStatusActionInput, CreateUserInput } from './schemas';
import { authService } from '../auth/auth.service';
import { ListBookingsQuery } from '../bookings/schemas';
import { ListReviewsQuery } from '../reviews/schemas';
import { cache, CACHE_TTL_DASHBOARD } from '../../common/cache/redis-cache';

export class AdminService {
  async listUsers(query: ListUsersQuery) {
    const { role, status, q, limit } = query;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return paginateResults(items, limit);
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        travelerProfile: true,
        provider: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      locale: user.locale,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      travelerProfile: user.travelerProfile,
      provider: user.provider,
    };
  }

  async createUser(input: CreateUserInput) {
    const passwordHash = await authService.hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: input.role,
        phone: input.phone,
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user;
  }

  async suspendUser(
    targetUserId: string,
    input: UserStatusActionInput,
    context: AuditContext,
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundError('User', targetUserId);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user status to suspended
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.suspended },
      });

      // 2. Revoke all active sessions
      await authRepository.revokeAllUserSessions(targetUserId, tx);

      // 3. Log audit event
      await auditService.logInTransaction(tx, context, {
        action: 'USER_SUSPENDED',
        resource: 'user',
        resourceId: targetUserId,
        metadata: { reason: input.reason },
      });
    });
  }

  async reactivateUser(
    targetUserId: string,
    context: AuditContext,
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundError('User', targetUserId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.active },
      });

      await auditService.logInTransaction(tx, context, {
        action: 'USER_REACTIVATED',
        resource: 'user',
        resourceId: targetUserId,
      });
    });
  }

  async listBookings(query: ListBookingsQuery) {
    return bookingRepository.listAll(query);
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking', id);
    }
    return booking;
  }

  async getDashboardStats() {
    return cache.getOrSet('admin:dashboard', CACHE_TTL_DASHBOARD, async () => {
      const [
        totalTravelers,
        totalProviders,
        approvedProviders,
        pendingProviders,
        totalBookings,
        recentBookings,
        revenueAgg,
        bookingsByStatus,
      ] = await Promise.all([
        prisma.user.count({ where: { role: UserRole.traveler } }),
        prisma.provider.count(),
        prisma.provider.count({ where: { status: ProviderStatus.approved } }),
        prisma.provider.count({ where: { status: ProviderStatus.submitted } }),
        prisma.booking.count(),
        prisma.booking.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.succeeded },
          _sum: { amountCents: true },
        }),
        prisma.booking.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
      ]);

      const grossRevenueCents = revenueAgg._sum?.amountCents || 0;
      const commissionCents = Math.round(grossRevenueCents * 0.15);

      const statusCounts: Record<string, number> = {};
      for (const row of bookingsByStatus) {
        statusCounts[row.status] = row._count.id;
      }

      return {
        totalTravelers,
        totalProviders,
        approvedProviders,
        pendingProviders,
        totalBookings,
        recentBookings,
        grossRevenueCents,
        commissionCents,
        bookingsByStatus: statusCounts,
      };
    });
  }

  async listReviews(query: ListReviewsQuery) {
    const { limit } = query;
    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.review.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        author: { select: { id: true, fullName: true } },
        provider: { select: { id: true, businessName: true } },
        booking: { select: { id: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async getMonthlyChart(months = 6) {
    const cacheKey = `admin:monthly-chart:${months}`;

    return cache.getOrSet(cacheKey, 5 * 60, async () => {
      const now = new Date();

      // Build date ranges for all months upfront
      const ranges = Array.from({ length: months }, (_, idx) => {
        const offset = months - 1 - idx;
        const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
        const label = start.toLocaleString('en-US', { month: 'short' });
        return { start, end, label };
      });

      // Fire all DB queries in parallel (2 per month × N months)
      const settled = await Promise.all(
        ranges.map(({ start, end }) =>
          Promise.all([
            prisma.booking.count({ where: { createdAt: { gte: start, lt: end } } }),
            prisma.payment.aggregate({
              where: { status: PaymentStatus.succeeded, createdAt: { gte: start, lt: end } },
              _sum: { amountCents: true },
            }),
          ]),
        ),
      );

      return ranges.map(({ label }, i) => ({
        month: label,
        bookings: settled[i][0],
        revenueCents: settled[i][1]._sum?.amountCents || 0,
      }));
    });
  }

  async getActivityFeed(limit = 20) {
    const events = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, fullName: true, role: true } },
      },
    });

    return events.map((e) => ({
      id: e.id,
      action: e.action,
      resource: e.resource,
      resourceId: e.resourceId,
      actorName: e.actor?.fullName || 'System',
      actorRole: e.actorRole,
      metadata: e.metadata,
      createdAt: e.createdAt,
    }));
  }

  async getConciergeStats(conciergeId: string) {
    const [
      unclaimedConversations,
      myConversations,
      emergencyConversations,
      todaysBookings,
    ] = await Promise.all([
      prisma.conversation.count({ where: { conciergeId: null, isClosed: false } }),
      prisma.conversation.count({ where: { conciergeId, isClosed: false } }),
      prisma.conversation.count({ where: { isEmergency: true, isClosed: false } }),
      prisma.booking.count({
        where: {
          scheduledDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      unclaimedConversations,
      myConversations,
      openCases: unclaimedConversations + myConversations,
      emergencyConversations,
      todaysBookings,
    };
  }
  async seedDemoData() {
    const [destCount, svcCount] = await Promise.all([
      prisma.destination.count(),
      prisma.service.count(),
    ]);

    const results: Record<string, number> = { destinations: 0, services: 0 };

    if (destCount === 0) {
      const destinations = [
        { name: 'River No. 2 Beach', slug: 'river-no-2-beach', category: DestinationCategory.beach, region: 'Western Area Peninsula', description: "Renowned for its blinding white sands and turquoise freshwater estuary meeting the Atlantic Ocean, River No. 2 Beach is widely acclaimed as one of West Africa's most breathtaking coastal treasures.", shortDescription: 'Community-managed white sand beach with freshwater lagoon and mangrove boat tours.', highlights: ['Community-managed eco-tourism ensuring direct local benefit', 'Fresh Atlantic barracuda, lobster, and cassava bread served beachside', 'Calm, safe swimming lagoon ideal for families and water sports', 'Direct boat excursions upriver into lush mangrove rainforests'], images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Banana Islands Archipelago', slug: 'banana-islands', category: DestinationCategory.island, region: 'Southern Peninsula Coast', description: 'Comprising Dublin, Ricketts, and Mes-Meheux islands, the Banana Islands offer historical 18th-century stone church ruins, scenic fishing harbors, secluded Atlantic beaches, and some of the finest snorkeling and scuba reefs in West Africa.', shortDescription: 'Historic islands with 18th-century ruins, coral reefs, and world-class snorkeling.', highlights: ['Historical walking trail through colonial-era church and fort ruins', 'Protected coral reefs with exceptional marine visibility for snorkeling', 'Authentic fresh seafood feasts prepared by island host families', 'Scenic island-hopping boat charters across Dublin and Ricketts'], images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Tacugama Chimpanzee Sanctuary', slug: 'tacugama-sanctuary', category: DestinationCategory.wildlife, region: 'Western Area Rainforest', description: 'Nestled deep inside the primary mountain rainforest of Regent village, Tacugama is world-renowned for rescuing and rehabilitating endangered Western Chimpanzees. Visitors experience educational guided treks, serene waterfall ravines, and lush canopy trails.', shortDescription: 'Home to over 100 rescued Western Chimpanzees in the Freetown mountain rainforest.', highlights: ['Home to over 100 rescued Western Chimpanzees in natural forest enclosures', 'Pristine mountain rainforest canopy hiking trails and waterfalls', 'Accredited educational naturalist guides', 'Eco-lodges and tranquil nature retreat setting in the Freetown hills'], images: ['https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Bunce Island Heritage Site', slug: 'bunce-island', category: DestinationCategory.heritage, region: 'Sierra Leone River Estuary', description: "Located 30 km up the Sierra Leone River, Bunce Island was one of the principal British slave-trading castles in West Africa. Its haunting stone fortress ruins stand preserved in a peaceful forest setting.", shortDescription: 'Preserved 18th-century slave-trade fortress ruins with connections to the Gullah diaspora.', highlights: ['Profound historical connection to the African-American Gullah diaspora', 'Remarkably preserved 18th-century stone fortress walls and cannon batteries', 'Scenic riverboat cruise up the Sierra Leone River Estuary', 'Accompanied by accredited national historians'], images: ['https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Bureh Beach Surf & Lagoon', slug: 'bureh-beach', category: DestinationCategory.beach, region: 'Western Area Peninsula', description: "Bureh Beach is the epicenter of Sierra Leone's vibrant surf culture. It offers beginner surf lessons, board rentals, and authentic beach grill shack culture.", shortDescription: "Sierra Leone's top surf beach — Atlantic swell on one side, a freshwater lagoon on the other.", highlights: ['Home to the Bureh Surf Club with lessons for beginners and seasoned riders', 'Picturesque river meeting the sea, perfect for kayaking', 'Authentic relaxed beach shacks with wood-fired grilled seafood', 'Surrounded by dramatic rainforest-clad peninsula mountains'], images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85'], isFeatured: false },
        { name: 'Tokeh Sands Beach Resort', slug: 'tokeh-beach', category: DestinationCategory.beach, region: 'Western Area Peninsula', description: 'Known for its endless miles of soft white sand and towering palm trees, Tokeh Beach is home to premier beachfront eco-resorts.', shortDescription: 'Miles of uncrowded powder-white sands with upscale beachfront eco-resorts.', highlights: ['Miles of uncrowded powder-white sands backed by tropical forest hills', 'Upscale beachfront restaurants serving gourmet seafood and cocktails', 'Private ocean boat excursions and jet ski rentals available', 'Ideal for romantic escapes and honeymoons'], images: ['https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Tiwai Island Wildlife Sanctuary', slug: 'tiwai-island', category: DestinationCategory.wildlife, region: 'Moa River, Southern Province', description: "Located on the Moa River, Tiwai Island boasts one of the highest primate diversities on Earth, including the rare pygmy hippopotamus, colobus monkeys, and over 130 bird species.", shortDescription: "Pristine river island with one of the world's highest primate densities and rare pygmy hippos.", highlights: ['Over 11 primate species living in pristine river island jungle', 'Canoe river safaris and nocturnal rainforest wildlife tracking', 'Community-owned conservation project run with local Mende villages', 'Immersive eco-campsite experiences under the African stars'], images: ['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
        { name: 'Outamba-Kilimi National Park', slug: 'outamba-kilimi', category: DestinationCategory.nature, region: 'Northern Province (Bombali & Karene)', description: "Sierra Leone's premier wilderness national park features rolling savannah grasslands, lush riverine forests, and the Great Scarcies River. Wildlife includes elephants, hippos, chimpanzees, and hundreds of bird species.", shortDescription: "Sierra Leone's premier national park — elephants, hippos, and pristine savannah wilderness.", highlights: ['Canoe safaris along the Great Scarcies River to spot swimming hippos', 'Savannah game tracking trails led by indigenous Susu park rangers', 'Breathtaking sunsets across the northern granite inselbergs', 'True off-the-beaten-path African wilderness adventure'], images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85'], isFeatured: true },
      ];
      const created = await prisma.destination.createMany({ data: destinations, skipDuplicates: true });
      results.destinations = created.count;
    }

    if (svcCount === 0) {
      const provider = await prisma.provider.findFirst({
        where: { status: { in: [ProviderStatus.approved, ProviderStatus.listed] } },
        orderBy: { createdAt: 'asc' },
      });

      if (provider) {
        const services = [
          { providerId: provider.id, name: "River No. 2 Beach Half-Day Transfer & Tour", type: ServiceType.tour, shortDescription: 'Half-day guided beach tour with transfer, estuary boat trip, and seafood lunch.', description: 'Door-to-door air-conditioned transfer from Freetown to River No. 2 Beach. Includes a guided estuary boat tour, fresh seafood lunch at the community restaurant, and return transfer.', priceCents: 16500000, currency: 'SLE', durationMinutes: 360, maxCapacity: 6, images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Air-conditioned vehicle transfer', 'Community estuary boat tour', 'Fresh seafood lunch', 'Local guide'], exclusions: ['Personal spending money', 'Drinks beyond the included meal'], isActive: true },
          { providerId: provider.id, name: 'Tacugama Chimpanzee Sanctuary Full-Day Trek', type: ServiceType.tour, shortDescription: 'Full-day guided trek through Tacugama sanctuary and Western Area Rainforest canopy.', description: 'A full-day immersive experience at the internationally acclaimed Tacugama Chimpanzee Sanctuary. Includes a guided rainforest canopy trail, sanctuary entrance fee, and naturalist narration.', priceCents: 14000000, currency: 'SLE', durationMinutes: 480, maxCapacity: 8, images: ['https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Sanctuary entrance fee', 'Accredited wildlife naturalist guide', 'Rainforest trail access', 'Return transfer from Freetown hotels'], exclusions: ['Personal refreshments', 'Gratuities'], isActive: true },
          { providerId: provider.id, name: 'Banana Islands Boat Charter & Snorkeling', type: ServiceType.boat_trip, shortDescription: 'Full-day island-hopping boat charter to the Banana Islands with snorkeling and fresh seafood.', description: 'A full-day private boat charter to the historic Banana Islands — Dublin, Ricketts, and Mes-Meheux. Includes snorkeling equipment, island hopping, coconut refreshments, and a seafood feast.', priceCents: 22500000, currency: 'SLE', durationMinutes: 480, maxCapacity: 6, images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Private motor boat charter', 'Snorkeling masks and fins', 'Island guide', 'Fresh coconut refreshments', 'Seafood lunch at host family'], exclusions: ['Hotel transfers', 'Alcoholic beverages'], isActive: true },
          { providerId: provider.id, name: 'Bunce Island Heritage River Expedition', type: ServiceType.tour, shortDescription: 'Guided historical expedition to Bunce Island slave-trade fortress ruins by river.', description: "A deeply moving historical river expedition 30 km up the Sierra Leone River Estuary to Bunce Island. Led by an accredited national historian, includes fortress ruins, cannon batteries, and a memorial ceremony.", priceCents: 18000000, currency: 'SLE', durationMinutes: 300, maxCapacity: 10, images: ['https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Return river boat transfer', 'Accredited national historian guide', 'Fortress site access', 'Printed heritage guide booklet'], exclusions: ['Hotel transfers', 'Personal refreshments'], isActive: true },
          { providerId: provider.id, name: 'Tiwai Island 2-Day Wildlife & Pygmy Hippo Safari', type: ServiceType.experience, shortDescription: '2-day overnight wildlife safari with pygmy hippo tracking and canoe river tours.', description: "A two-day overnight eco-adventure on Tiwai Island Wildlife Sanctuary — home to the rare pygmy hippopotamus, 11 primate species, and 135 bird species. Includes canoe safaris, nocturnal tracking, and campsite accommodation.", priceCents: 28000000, currency: 'SLE', durationMinutes: 2880, maxCapacity: 6, images: ['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80'], inclusions: ['All park ranger fees', 'Canoe river safaris', 'Community campsite accommodation', 'All meals during stay', 'Nocturnal tracking guide'], exclusions: ['Transport to Moa River', 'Alcoholic beverages', 'Travel insurance'], isActive: true },
          { providerId: provider.id, name: 'Bureh Beach Surf Lesson & Lagoon Tour', type: ServiceType.experience, shortDescription: 'Surf lessons, kayaking on the freshwater lagoon, and grilled seafood at Bureh Beach.', description: "A full-day surf and beach experience at Bureh Beach — Sierra Leone's premier surf destination. Includes surf tuition from the Bureh Surf Club, board hire, kayaking, and a beachside seafood lunch.", priceCents: 13000000, currency: 'SLE', durationMinutes: 360, maxCapacity: 4, images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Surf lesson (1.5 hours)', 'Surfboard and wetsuit hire', 'Kayak use on the lagoon', 'Beachside grilled seafood lunch'], exclusions: ['Hotel transfers to Bureh Beach', 'Drinks', 'Gratuities'], isActive: true },
          { providerId: provider.id, name: 'Freetown City Heritage Walk & Cotton Tree Tour', type: ServiceType.guide, shortDescription: 'Licensed heritage walking tour of historic Freetown — Cotton Tree, Fourah Bay College, and more.', description: "A 3-hour immersive walking tour through historic central Freetown led by a licensed heritage guide. Sites include the 500-year-old Cotton Tree, Fourah Bay College, St. George's Cathedral, and King Jimmy Market.", priceCents: 4500000, currency: 'SLE', durationMinutes: 180, maxCapacity: 12, images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80'], inclusions: ['Licensed heritage guide', 'Entrance fees for all sites', 'Printed city map', 'Welcome kola-nut ceremony'], exclusions: ['Personal refreshments', 'Transport to start point', 'Gratuities'], isActive: true },
        ];
        const created = await prisma.service.createMany({ data: services, skipDuplicates: true });
        results.services = created.count;
      }
    }

    return results;
  }
}

export const adminService = new AdminService();
