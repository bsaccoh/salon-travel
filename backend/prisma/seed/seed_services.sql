-- Seed: sample services for the first approved provider
-- Run against production Neon DB:
--   psql $DATABASE_URL -f prisma/seed/seed_services.sql
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- The CTE picks whichever approved provider exists first.

WITH first_provider AS (
  SELECT id FROM providers
  WHERE status IN ('approved', 'listed')
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO services (
  id, provider_id, name, type, description, short_description,
  price_cents, currency, duration_minutes, max_capacity,
  images, inclusions, exclusions,
  is_active, review_count, created_at, updated_at, version
)
SELECT
  gen_random_uuid(),
  fp.id,
  v.name,
  v.type::service_type,
  v.description,
  v.short_description,
  v.price_cents,
  'SLE',
  v.duration_minutes,
  v.max_capacity,
  v.images,
  v.inclusions,
  v.exclusions,
  true,
  0,
  NOW(), NOW(), 1
FROM first_provider fp
CROSS JOIN (VALUES
  (
    'River No. 2 Beach Half-Day Transfer & Tour',
    'tour',
    'Door-to-door air-conditioned transfer from Freetown to River No. 2 Beach, the finest white-sand beach on the Peninsula. Includes a guided estuary boat tour, fresh seafood lunch at the community restaurant, and return transfer.',
    'Half-day guided beach tour with transfer, estuary boat trip, and seafood lunch.',
    16500000,
    360,
    6,
    ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Air-conditioned vehicle transfer', 'Community estuary boat tour', 'Fresh seafood lunch', 'Local guide'],
    ARRAY['Personal spending money', 'Drinks beyond the included meal', 'Gratuities']
  ),
  (
    'Tacugama Chimpanzee Sanctuary Full-Day Guided Trek',
    'tour',
    'A full-day immersive experience at the internationally acclaimed Tacugama Chimpanzee Sanctuary in the Western Area Rainforest. Includes a guided rainforest canopy trail, sanctuary entrance fee, and naturalist narration on West African chimpanzee conservation.',
    'Full-day guided trek through Tacugama sanctuary and the Western Area Rainforest canopy.',
    14000000,
    480,
    8,
    ARRAY['https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Sanctuary entrance fee', 'Accredited wildlife naturalist guide', 'Rainforest trail access', 'Return transfer from Freetown hotels'],
    ARRAY['Personal refreshments', 'Gratuities', 'Photography permits (optional extra)']
  ),
  (
    'Banana Islands Boat Charter & Snorkeling Excursion',
    'boat_trip',
    'A full-day private boat charter departing from the Aberdeen fishing pier to the historic Banana Islands — Dublin, Ricketts, and Mes-Meheux. Includes snorkeling equipment, island hopping, fresh coconut refreshments, and a fresh seafood feast at an island host family.',
    'Full-day island-hopping boat charter to the Banana Islands with snorkeling and fresh seafood.',
    22500000,
    480,
    6,
    ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Private motor boat charter', 'Snorkeling masks and fins', 'Island guide', 'Fresh coconut refreshments', 'Seafood lunch at host family'],
    ARRAY['Hotel transfers', 'Alcoholic beverages', 'Gratuities']
  ),
  (
    'Bunce Island Heritage River Expedition',
    'tour',
    'A deeply moving historical river expedition 30 km up the Sierra Leone River Estuary to Bunce Island — one of the most significant British slave-trading castles in West Africa. Led by an accredited national historian, the tour includes fortress ruins, cannon batteries, and a memorial ceremony.',
    'Guided historical expedition to Bunce Island slave-trade fortress ruins by river.',
    18000000,
    300,
    10,
    ARRAY['https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Return river boat transfer', 'Accredited national historian guide', 'Fortress site access', 'Printed heritage guide booklet'],
    ARRAY['Hotel transfers', 'Personal refreshments', 'Gratuities']
  ),
  (
    'Tiwai Island 2-Day Wildlife & Pygmy Hippo Safari',
    'experience',
    'A two-day overnight eco-adventure on Tiwai Island Wildlife Sanctuary on the Moa River — home to the rare pygmy hippopotamus, 11 primate species, and 135 bird species. Includes canoe river safaris, nocturnal rainforest tracking, community campsite accommodation, and all park ranger guide fees.',
    '2-day overnight wildlife safari on Tiwai Island with pygmy hippo tracking and canoe river tours.',
    28000000,
    2880,
    6,
    ARRAY['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['All park ranger fees', 'Canoe river safaris (day and night)', 'Community campsite accommodation', 'All meals during stay', 'Nocturnal tracking guide'],
    ARRAY['Transport to Bo / Moa River', 'Alcoholic beverages', 'Travel insurance']
  ),
  (
    'Bureh Beach Surf Lesson & Peninsula Beach Tour',
    'experience',
    'A full-day surf and beach experience at Bureh Beach — Sierra Leone''s premier surf destination. Includes beginner or intermediate surf tuition from the Bureh Surf Club, board and wetsuit hire, kayaking on the freshwater river lagoon, and a beachside wood-fired grilled seafood lunch.',
    'Surf lessons, kayaking on the freshwater lagoon, and grilled seafood at Bureh Beach.',
    13000000,
    360,
    4,
    ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Surf lesson (1.5 hours)', 'Surfboard and wetsuit hire', 'Kayak use on the lagoon', 'Beachside grilled seafood lunch'],
    ARRAY['Hotel transfers to Bureh Beach', 'Drinks', 'Gratuities']
  ),
  (
    'Freetown City Heritage Walk & Cotton Tree Tour',
    'guide',
    'A 3-hour immersive walking tour through historic central Freetown led by a licensed heritage guide. Sites include the 500-year-old Cotton Tree, Fourah Bay College (oldest university in West Africa), St. George''s Cathedral, the National Railway Museum, and King Jimmy Market.',
    'Licensed heritage walking tour of historic Freetown — Cotton Tree, Fourah Bay College, and more.',
    4500000,
    180,
    12,
    ARRAY['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Licensed heritage guide', 'Entrance fees for all sites', 'Printed city map', 'Welcome kola-nut ceremony'],
    ARRAY['Personal refreshments', 'Transport to start point', 'Gratuities']
  )
) AS v(name, type, description, short_description, price_cents, duration_minutes, max_capacity, images, inclusions, exclusions)
ON CONFLICT DO NOTHING;
