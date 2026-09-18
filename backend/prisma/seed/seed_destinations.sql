-- Seed: 8 Sierra Leone destinations
-- Run once against the production Neon DB:
--   psql $DATABASE_URL -f prisma/seed/seed_destinations.sql
-- Safe to re-run: uses INSERT ... ON CONFLICT (slug) DO UPDATE

INSERT INTO destinations (id, name, slug, category, region, description, short_description, highlights, images, is_featured, created_at, updated_at, version)
VALUES
  (
    gen_random_uuid(),
    'River No. 2 Beach',
    'river-no-2-beach',
    'beach',
    'Western Area Peninsula',
    'Renowned for its blinding white sands and turquoise freshwater estuary meeting the Atlantic Ocean, River No. 2 Beach is widely acclaimed as one of West Africa''s most breathtaking coastal treasures. Managed directly by the local community association, the beach provides sustainable tourism, fresh Atlantic seafood, and tranquil lagoon boat tours.',
    'Community-managed white sand beach with a freshwater lagoon and boat tours into mangrove forests.',
    ARRAY[
      'Community-managed eco-tourism ensuring direct local benefit',
      'Fresh Atlantic barracuda, lobster, and cassava bread served beachside',
      'Calm, safe swimming lagoon ideal for families and water sports',
      'Direct boat excursions upriver into lush mangrove rainforests'
    ],
    ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Banana Islands Archipelago',
    'banana-islands',
    'island',
    'Southern Peninsula Coast',
    'Comprising Dublin, Ricketts, and Mes-Meheux islands, the Banana Islands offer historical 18th-century stone church ruins, scenic fishing harbors, secluded Atlantic beaches, and some of the finest snorkeling and scuba reefs in West Africa.',
    'A trio of historic islands with 18th-century ruins, coral reefs, and world-class snorkeling.',
    ARRAY[
      'Historical walking trail through colonial-era church and fort ruins',
      'Protected coral reefs with exceptional marine visibility for snorkeling',
      'Authentic fresh seafood feasts prepared by island host families',
      'Scenic island-hopping boat charters across Dublin and Ricketts'
    ],
    ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Tacugama Chimpanzee Sanctuary',
    'tacugama-sanctuary',
    'wildlife',
    'Western Area Rainforest',
    'Nestled deep inside the primary mountain rainforest of Regent village, Tacugama is world-renowned for rescuing and rehabilitating endangered Western Chimpanzees. Visitors experience educational guided treks, serene waterfall ravines, and lush canopy trails.',
    'Home to over 100 rescued Western Chimpanzees in the Freetown mountain rainforest.',
    ARRAY[
      'Home to over 100 rescued Western Chimpanzees in natural forest enclosures',
      'Pristine mountain rainforest canopy hiking trails and waterfalls',
      'Accredited educational naturalist guides providing wildlife conservation insights',
      'Eco-lodges and tranquil nature retreat setting in the Freetown hills'
    ],
    ARRAY['https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Bunce Island Heritage Site',
    'bunce-island',
    'heritage',
    'Sierra Leone River Estuary',
    'Located 30 kilometers up the Sierra Leone River, Bunce Island was one of the principal British slave-trading castles in West Africa. Today, its haunting stone fortress ruins, merchant quarters, and ancient cannons stand preserved in a peaceful forest setting.',
    'Profoundly preserved 18th-century slave-trade fortress ruins with connections to the Gullah diaspora.',
    ARRAY[
      'Profound historical connection to the African-American Gullah diaspora',
      'Remarkably preserved 18th-century stone fortress walls, cannon batteries, and gatehouses',
      'Scenic riverboat cruise up the Sierra Leone River Estuary',
      'Accompanied by accredited national historians and heritage curators'
    ],
    ARRAY['https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Bureh Beach Surf & Lagoon',
    'bureh-beach',
    'beach',
    'Western Area Peninsula',
    'Bureh Beach is the epicenter of Sierra Leone''s vibrant surf culture. Featuring warm Atlantic swell breaks on one side and a crystal-clear freshwater river lagoon on the other, it offers beginner surf lessons, board rentals, and authentic beach grill shack culture.',
    'Sierra Leone''s top surf beach — Atlantic swell on one side, a freshwater lagoon on the other.',
    ARRAY[
      'Home to the Bureh Surf Club with lessons for beginners and seasoned riders',
      'Picturesque river meeting the sea, perfect for kayaking and SUP boarding',
      'Authentic relaxed beach shacks with wood-fired grilled seafood',
      'Surrounded by dramatic rainforest-clad peninsula mountains'
    ],
    ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85'],
    false,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Tokeh Sands Beach Resort',
    'tokeh-beach',
    'beach',
    'Western Area Peninsula',
    'Known for its endless miles of soft white sand and towering palm trees, Tokeh Beach is home to premier beachfront eco-resorts. Relax in seaside chalets, savor freshly prepared Atlantic oysters, and take sunset strolls along the tranquil shoreline.',
    'Miles of uncrowded powder-white sands with upscale beachfront eco-resorts and sunset views.',
    ARRAY[
      'Miles of uncrowded powder-white sands backed by tropical forest hills',
      'Upscale beachfront restaurants serving gourmet seafood and cocktails',
      'Private ocean boat excursions and jet ski rentals available',
      'Ideal for romantic escapes, honeymoons, and peaceful weekend getaways'
    ],
    ARRAY['https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Tiwai Island Wildlife Sanctuary',
    'tiwai-island',
    'wildlife',
    'Moa River, Southern Province',
    'Located on the Moa River in the Southern Province, Tiwai Island boasts one of the highest concentrations and diversities of primates on Earth, including the rare pygmy hippopotamus, colobus monkeys, and over 130 species of tropical birds.',
    'Pristine river island with one of the world''s highest primate densities and rare pygmy hippos.',
    ARRAY[
      'Over 11 primate species living in pristine river island jungle',
      'Canoe river safaris and nocturnal rainforest wildlife tracking',
      'Community-owned conservation project run with local Mende villages',
      'Immersive eco-campsite experiences under the African stars'
    ],
    ARRAY['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  ),
  (
    gen_random_uuid(),
    'Outamba-Kilimi National Park',
    'outamba-kilimi',
    'nature',
    'Northern Province (Bombali & Karene)',
    'Sierra Leone''s premier wilderness national park features rolling savannah grasslands, lush riverine forests, and the Great Scarcies River. Wildlife includes elephants, hippos, chimpanzees, bongo antelopes, and hundreds of bird species.',
    'Sierra Leone''s premier national park — elephants, hippos, and pristine savannah wilderness.',
    ARRAY[
      'Canoe safaris along the Little and Great Scarcies River to spot swimming hippos',
      'Savannah game tracking trails led by indigenous Susu park rangers',
      'Breathtaking sunsets across the northern granite inselbergs',
      'True off-the-beaten-path African wilderness adventure'
    ],
    ARRAY['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85'],
    true,
    NOW(), NOW(), 1
  )
ON CONFLICT (slug) DO UPDATE SET
  name              = EXCLUDED.name,
  category          = EXCLUDED.category,
  region            = EXCLUDED.region,
  description       = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  highlights        = EXCLUDED.highlights,
  images            = EXCLUDED.images,
  is_featured       = EXCLUDED.is_featured,
  updated_at        = NOW();
