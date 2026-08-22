export const seedDestinations = [
  {
    id: 'dest-paris',
    name: 'Paris',
    country: 'France',
    continent: 'Europe',
    cost_index: '$$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    description: 'The City of Light dazzles with iconic monuments, world-class gastronomy, vibrant art museums, and romantic Seine strolls.',
    best_season: 'April - October',
    lat: 48.8566,
    lng: 2.3522,
    tags: JSON.stringify(['Romantic', 'Art & Museums', 'Culinary', 'Architecture', 'Culture']),
    activities: [
      {
        title: 'Eiffel Tower Summit & Sunset Experience',
        description: 'Ascend to the top of Paris for breathtaking panoramic views of the city at golden hour.',
        category: 'Sightseeing',
        cost: 38,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Louvre Museum Masterpieces Guided Tour',
        description: 'Explore the Mona Lisa, Venus de Milo, and Winged Victory with skip-the-line priority access.',
        category: 'Culture',
        cost: 55,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Seine River Gourmet Dinner Cruise',
        description: 'Enjoy a 3-course French dinner with live violin music while sailing past illuminated landmarks.',
        category: 'Food',
        cost: 95,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1508050919630-b135583b29ab?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Montmartre & Sacré-Cœur Walking Tour',
        description: 'Wander through cobblestone streets, artist squares, and bohemian cafes with panoramic city views.',
        category: 'Sightseeing',
        cost: 25,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?auto=format&fit=crop&w=800&q=80',
        rating: 4.7
      }
    ]
  },
  {
    id: 'dest-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    cost_index: '$$$',
    popularity_score: 5.0,
    hero_image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    description: 'An electrifying metropolis where neon-lit futuristic skyscrapers harmonize seamlessly with ancient temples and culinary mastery.',
    best_season: 'March - May & Sept - Nov',
    lat: 35.6762,
    lng: 139.6503,
    tags: JSON.stringify(['Futuristic', 'Foodie Heaven', 'Anime & Tech', 'Temples', 'Nightlife']),
    activities: [
      {
        title: 'Shibuya Crossing & Izakaya Alley Tour',
        description: 'Experience the world busiest crosswalk and dive into hidden Omoide Yokocho food stalls.',
        category: 'Food',
        cost: 45,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'teamLab Borderless Digital Art Museum',
        description: 'Immerse your senses in a three-dimensional world of interactive light art and digital waterfalls.',
        category: 'Culture',
        cost: 42,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Senso-ji Temple & Asakusa Rickshaw Ride',
        description: 'Discover Tokyo oldest temple, stroll through Nakamise shopping street, and ride a traditional rickshaw.',
        category: 'Culture',
        cost: 35,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Mount Fuji & Lake Kawaguchi Day Excursion',
        description: 'Scenic day trip to Japan sacred peak with pagoda views and traditional village sightseeing.',
        category: 'Adventure',
        cost: 90,
        duration_hours: 8,
        image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
        rating: 5.0
      }
    ]
  },
  {
    id: 'dest-rome',
    name: 'Rome',
    country: 'Italy',
    continent: 'Europe',
    cost_index: '$$',
    popularity_score: 4.8,
    hero_image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    description: 'An open-air living museum packed with millennia of imperial ruins, Renaissance fountains, Vatican treasures, and handcrafted pasta.',
    best_season: 'April - June & Sept - Oct',
    lat: 41.9028,
    lng: 12.4964,
    tags: JSON.stringify(['History', 'Architecture', 'Italian Food', 'Ancient Ruins', 'Culture']),
    activities: [
      {
        title: 'Colosseum Gladiator Arena & Roman Forum',
        description: 'Walk on the reconstructed arena floor and explore the heart of Ancient Rome with an archaeologist.',
        category: 'Sightseeing',
        cost: 48,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Vatican Museums & Sistine Chapel Tour',
        description: 'Witness Michelangelo ceiling frescoes and St. Peter Basilica with VIP fast-track entry.',
        category: 'Culture',
        cost: 65,
        duration_hours: 3.5,
        image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Authentic Roman Pasta & Gelato Masterclass',
        description: 'Learn to make fettuccine and tiramisu from scratch with a local Roman chef in Trastevere.',
        category: 'Food',
        cost: 70,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
        rating: 5.0
      }
    ]
  },
  {
    id: 'dest-barcelona',
    name: 'Barcelona',
    country: 'Spain',
    continent: 'Europe',
    cost_index: '$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    description: 'A sun-drenched Mediterranean jewel famous for Gaudí architectural whimsy, lively tapas bars, and sandy beaches.',
    best_season: 'May - October',
    lat: 41.3879,
    lng: 2.1699,
    tags: JSON.stringify(['Gaudí', 'Beach', 'Tapas', 'Nightlife', 'Mediterranean']),
    activities: [
      {
        title: 'Sagrada Família Fast-Track Tower Access',
        description: 'Marvel at Gaudí crowning masterpiece and climb the Nativity tower for spectacular city vistas.',
        category: 'Sightseeing',
        cost: 40,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Gothic Quarter Tapas & Sangria Tasting',
        description: 'Stroll medieval alleyways while sampling Iberian ham, patatas bravas, and Spanish wines.',
        category: 'Food',
        cost: 50,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Park Güell Mosaic Wonderland Tour',
        description: 'Explore the colourful dragon staircase and serpentine benches overlooking the Mediterranean.',
        category: 'Culture',
        cost: 22,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
        rating: 4.7
      }
    ]
  },
  {
    id: 'dest-bali',
    name: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    cost_index: '$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    description: 'An island paradise of lush emerald rice terraces, cliffside ocean temples, holistic wellness retreats, and vibrant beach clubs.',
    best_season: 'April - October',
    lat: -8.4095,
    lng: 115.1889,
    tags: JSON.stringify(['Tropical', 'Wellness', 'Beaches', 'Adventure', 'Budget-Friendly']),
    activities: [
      {
        title: 'Mount Batur Sunrise Trek & Hot Springs',
        description: 'Hike an active volcano in time to catch sunrise above the clouds, followed by natural hot springs.',
        category: 'Adventure',
        cost: 45,
        duration_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Tegalalang Rice Terraces & Jungle Swing',
        description: 'Walk through cascading rice fields in Ubud and soar over the jungle canopy on a giant swing.',
        category: 'Adventure',
        cost: 25,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Uluwatu Sunset Temple & Kecak Fire Dance',
        description: 'Watch the sunset from a dramatic 70-meter cliff followed by the traditional hypnotic trance dance.',
        category: 'Culture',
        cost: 20,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      }
    ]
  },
  {
    id: 'dest-newyork',
    name: 'New York City',
    country: 'USA',
    continent: 'Americas',
    cost_index: '$$$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    description: 'The city that never sleeps: soaring skylines, Broadway theaters, Central Park tranquility, and world-class dining at every block.',
    best_season: 'September - November & April - June',
    lat: 40.7128,
    lng: -74.0060,
    tags: JSON.stringify(['Skylines', 'Broadway', 'Shopping', 'Nightlife', 'Museums']),
    activities: [
      {
        title: 'Summit One Vanderbilt Immersive Experience',
        description: 'Step into mirrored multi-sensory observation decks with 360-degree views of Manhattan.',
        category: 'Sightseeing',
        cost: 46,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Broadway Musical Evening Ticket',
        description: 'Witness an award-winning theatrical spectacle in the heart of Times Square theater district.',
        category: 'Culture',
        cost: 110,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Central Park Bicycle Tour & Picnic',
        description: 'Pedal past Bethesda Fountain, Strawberry Fields, and Bow Bridge with a curated picnic basket.',
        category: 'Relax',
        cost: 35,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80',
        rating: 4.7
      }
    ]
  },
  {
    id: 'dest-swissalps',
    name: 'Swiss Alps (Interlaken & Zermatt)',
    country: 'Switzerland',
    continent: 'Europe',
    cost_index: '$$$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    description: 'Pristine alpine peaks, crystal-clear glacial lakes, iconic Matterhorn views, and scenic mountain railway journeys.',
    best_season: 'December - March (Ski) & June - September (Hiking)',
    lat: 46.5197,
    lng: 7.9620,
    tags: JSON.stringify(['Mountains', 'Hiking', 'Skiing', 'Scenic Trains', 'Nature']),
    activities: [
      {
        title: 'Jungfraujoch - Top of Europe Cogwheel Train',
        description: 'Ride Europe highest railway station to 3,454m for panoramic ice palace and glacier vistas.',
        category: 'Sightseeing',
        cost: 180,
        duration_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Tandem Paragliding Over Interlaken',
        description: 'Soar like a bird between Lake Thun and Lake Brienz with the snowcapped peaks as your backdrop.',
        category: 'Adventure',
        cost: 170,
        duration_hours: 1.5,
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        rating: 5.0
      }
    ]
  },
  {
    id: 'dest-dubai',
    name: 'Dubai',
    country: 'UAE',
    continent: 'Asia',
    cost_index: '$$$$',
    popularity_score: 4.8,
    hero_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    description: 'A dazzling futuristic oasis of luxury shopping, record-breaking architecture, desert dunes, and palm-fringed coastlines.',
    best_season: 'November - April',
    lat: 25.2048,
    lng: 55.2708,
    tags: JSON.stringify(['Luxury', 'Architecture', 'Desert Safari', 'Shopping', 'Modern']),
    activities: [
      {
        title: 'Burj Khalifa Level 148 At the Top SKY',
        description: 'Access the world highest outdoor observation deck with luxury lounge hospitality.',
        category: 'Sightseeing',
        cost: 95,
        duration_hours: 2,
        image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Desert Dune Bashing & Bedouin Camp BBQ',
        description: 'Exciting 4x4 dune drive, camel riding, sandboarding, belly dancing show, and barbecue dinner.',
        category: 'Adventure',
        cost: 65,
        duration_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      }
    ]
  },
  {
    id: 'dest-kyoto',
    name: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    cost_index: '$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    description: 'The cultural soul of Japan, adorned with thousands of classical Buddhist temples, bamboo groves, geisha districts, and serene Zen gardens.',
    best_season: 'March - May & October - November',
    lat: 35.0116,
    lng: 135.7681,
    tags: JSON.stringify(['Temples', 'Culture', 'Bamboo Forest', 'Geisha', 'Tradition']),
    activities: [
      {
        title: 'Fushimi Inari 10,000 Torii Gates Sunrise Hike',
        description: 'Beat the crowds and ascend the sacred mountain trail framed by vermillion gates.',
        category: 'Sightseeing',
        cost: 0,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1478436127897-769e00d0c715?auto=format&fit=crop&w=800&q=80',
        rating: 5.0
      },
      {
        title: 'Arashiyama Bamboo Grove & Monkey Park',
        description: 'Stroll through towering green bamboo stalks and meet friendly macaque monkeys atop the hill.',
        category: 'Sightseeing',
        cost: 15,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Traditional Tea Ceremony in Gion',
        description: 'Participate in the meditative art of matcha preparation with a certified tea master.',
        category: 'Culture',
        cost: 40,
        duration_hours: 1.5,
        image_url: 'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      }
    ]
  },
  {
    id: 'dest-santorini',
    name: 'Santorini',
    country: 'Greece',
    continent: 'Europe',
    cost_index: '$$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    description: 'Iconic whitewashed cliffside villages, cobalt blue domes, volcanic beaches, and legendary Aegean sunsets.',
    best_season: 'May - October',
    lat: 36.3932,
    lng: 25.4615,
    tags: JSON.stringify(['Romantic', 'Sunsets', 'Islands', 'Beaches', 'Winery']),
    activities: [
      {
        title: 'Oia Sunset Catamaran Cruise with Greek BBQ',
        description: 'Sail around the volcanic caldera, swim in sulfur hot springs, and watch Oia sunset from the water.',
        category: 'Adventure',
        cost: 130,
        duration_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Volcanic Winery Tour & Assyrtiko Tasting',
        description: 'Sample crisp mineral wines aged in volcanic soil across 3 family-owned cliffside wineries.',
        category: 'Food',
        cost: 75,
        duration_hours: 3.5,
        image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      }
    ]
  },
  {
    id: 'dest-cairo',
    name: 'Cairo',
    country: 'Egypt',
    continent: 'Africa',
    cost_index: '$',
    popularity_score: 4.7,
    hero_image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
    description: 'A timeless city straddling the Nile River, home to the Great Pyramids of Giza, Sphinx, and treasure-filled museums.',
    best_season: 'October - April',
    lat: 30.0444,
    lng: 31.2357,
    tags: JSON.stringify(['Ancient Wonders', 'Pyramids', 'History', 'Nile River', 'Bazaars']),
    activities: [
      {
        title: 'Giza Pyramids & Sphinx Camel Trek',
        description: 'Explore the only remaining wonder of the ancient world with a professional Egyptologist guide.',
        category: 'Sightseeing',
        cost: 40,
        duration_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Grand Egyptian Museum Guided Tour',
        description: 'Witness the complete collection of King Tutankhamun treasures in the state-of-the-art museum.',
        category: 'Culture',
        cost: 35,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      }
    ]
  },
  {
    id: 'dest-sydney',
    name: 'Sydney',
    country: 'Australia',
    continent: 'Oceania',
    cost_index: '$$$',
    popularity_score: 4.8,
    hero_image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    description: 'A dazzling harbor city blending world-renowned architecture, golden surf beaches, and coastal walks.',
    best_season: 'September - November & March - May',
    lat: -33.8688,
    lng: 151.2093,
    tags: JSON.stringify(['Harbor', 'Surfing', 'Beaches', 'Opera House', 'Coastal']),
    activities: [
      {
        title: 'Sydney Opera House Architectural Tour',
        description: 'Go behind the scenes of the UNESCO World Heritage masterpiece and discover its engineering feat.',
        category: 'Culture',
        cost: 32,
        duration_hours: 1.5,
        image_url: 'https://images.unsplash.com/photo-1523428096881-5cb799f659c6?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Bondi to Coogee Coastal Walk & Surf Lesson',
        description: 'Learn to catch Pacific waves on iconic Bondi Beach followed by a cliffside scenic coastal trek.',
        category: 'Adventure',
        cost: 60,
        duration_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      }
    ]
  },
  {
    id: 'dest-capetown',
    name: 'Cape Town',
    country: 'South Africa',
    continent: 'Africa',
    cost_index: '$$',
    popularity_score: 4.9,
    hero_image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    description: 'Where majestic Table Mountain meets two oceans, featuring penguin beaches, Stellenbosch winelands, and coastal drives.',
    best_season: 'November - March',
    lat: -33.9249,
    lng: 18.4241,
    tags: JSON.stringify(['Nature', 'Wine', 'Mountains', 'Wildlife', 'Ocean']),
    activities: [
      {
        title: 'Table Mountain Cable Car & Summit Hike',
        description: 'Revolving cable car ride to the flat summit for dramatic views over the Atlantic coastline.',
        category: 'Adventure',
        cost: 25,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Boulders Beach Penguin Sanctuary & Cape Point',
        description: 'Get up close with wild African penguins and stand at the southwestern tip of the African continent.',
        category: 'Sightseeing',
        cost: 50,
        duration_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      }
    ]
  },
  {
    id: 'dest-london',
    name: 'London',
    country: 'United Kingdom',
    continent: 'Europe',
    cost_index: '$$$$',
    popularity_score: 4.8,
    hero_image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    description: 'A global epicenter of royalty, theatre, historic landmarks, world-class free museums, and vibrant neighborhood markets.',
    best_season: 'May - September',
    lat: 51.5074,
    lng: -0.1278,
    tags: JSON.stringify(['Royalty', 'Museums', 'Theatre', 'History', 'Pubs']),
    activities: [
      {
        title: 'Tower of London & Crown Jewels Tour',
        description: 'Explore the 1,000-year-old fortress with a Yeoman Warder (Beefeater) and view the sparkling Crown Jewels.',
        category: 'Culture',
        cost: 42,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      },
      {
        title: 'Westminster Abbey & Buckingham Palace Walk',
        description: 'Witness the Changing of the Guard and step inside the royal coronation church of British monarchs.',
        category: 'Sightseeing',
        cost: 36,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      }
    ]
  },
  {
    id: 'dest-riodejaneiro',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    continent: 'Americas',
    cost_index: '$$',
    popularity_score: 4.8,
    hero_image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    description: 'The Marvelous City where lush rainforest mountains meet legendary Copacabana and Ipanema beaches with samba rhythms.',
    best_season: 'December - March',
    lat: -22.9068,
    lng: -43.1729,
    tags: JSON.stringify(['Beaches', 'Carnival', 'Samba', 'Mountains', 'Culture']),
    activities: [
      {
        title: 'Christ the Redeemer & Corcovado Train',
        description: 'Ride through Tijuca Rainforest to the summit of Corcovado Mountain and stand before the monumental statue.',
        category: 'Sightseeing',
        cost: 35,
        duration_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Sugarloaf Mountain Sunset Cable Car',
        description: 'Glide in glass cable cars above Guanabara Bay for golden hour views over Rio beaches.',
        category: 'Sightseeing',
        cost: 30,
        duration_hours: 2.5,
        image_url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
        rating: 4.8
      }
    ]
  }
];
