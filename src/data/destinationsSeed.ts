import type {DestinationDocument} from '../types/destination';

export const DESTINATIONS_SEED: DestinationDocument[] = [
  {
    _id: 'dest_001',
    slug: 'abbey-irpu-forest-cascades',
    name: 'Abbey & Irpu Forest Cascades',
    category: 'Waterfalls',
    shortDescription:
      'Monsoon-fed Western Ghats cascades plunging over mossy basalt rock into an emerald pool lined with giant ferns.',
    description:
      'Nestled along the Brahmagiri wildlife border in Kodagu, these twin forest waterfalls rush down ancient volcanic basalt surrounded by wild cardamom and evergreen shola canopy. A paved stone footpath with bamboo bridges guides visitors safely through coffee estates to the lower mist deck.\n\nManaged jointly by the Karnataka Forest Department and village eco-tourism stewards, the reserve enforces a strict plastic-free zone with steel bottle refill stations at the trailhead.',
    location: {
      state: 'Karnataka',
      district: 'Kodagu (Coorg)',
      address: 'Abbey Falls Eco-Road, Hebbettageri, Madikeri',
      pinCode: '571201',
      coordinates: {lat: 12.4547, lng: 75.7163},
    },
    openingHours: '06:30 AM – 05:30 PM (Daily)',
    entryFee: {
      indianAdult: 80,
      foreignAdult: 300,
      cameraFee: 50,
      displayLabel: '₹80 Indian · ₹300 Foreign',
      notes: 'Includes forest eco-conservation fee; refundable ₹50 bottle deposit.',
    },
    bestSeason: 'Jun – Nov',
    duration: '2.5 hrs',
    rating: 4.9,
    reviewCount: 412,
    image: '/src/assets/images/dest_emerald_falls_1795509327499.jpg',
    gallery: [
      '/src/assets/images/dest_emerald_falls_1795509327499.jpg',
      '/src/assets/images/hero_misty_valley_1795509326975.jpg',
    ],
    highlights: [
      'Morning light beams peak between 07:30 AM and 09:30 AM',
      'Suspension viewing bridge & lifeguard-monitored mist deck',
      'Direct trail link to Kodava spice & coffee estates nearby',
    ],
    nearbyPartner: 'Sahyadri Eco-Trails & River Collective',
    reviews: [
      {
        _id: 'drev_101',
        author: 'Ananya Deshmukh',
        hometown: 'Bengaluru, Karnataka',
        rating: 5,
        date: 'October 2026',
        comment:
          'Arrived at 7:15 AM before tour buses. The forest mist, zero-plastic bottle check, and bamboo bridge view were magical.',
      },
      {
        _id: 'drev_102',
        author: 'Nikhil Verma',
        hometown: 'Pune, Maharashtra',
        rating: 5,
        date: 'September 2026',
        comment:
          'Clean stone walkways and well-maintained viewing rails even during light monsoon drizzle. Entry tickets via UPI took seconds.',
      },
    ],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-10-20T10:30:00.000Z',
  },
  {
    _id: 'dest_002',
    slug: 'kumbhalgarh-sandstone-citadel',
    name: 'Kumbhalgarh Sandstone Citadel',
    category: 'Heritage',
    shortDescription:
      '15th-century Mewar hill fort famous for its 36 km stone ramparts, domed chhatris, and Aravalli sunset views.',
    description:
      'Rising 1,100 meters above sea level in the Aravalli hills, Kumbhalgarh Fort is a UNESCO-recognized Rajput citadel built by Maharana Kumbha in the 15th century. Its massive perimeter walls wind across thirteen mountain peaks, enclosing over three hundred ancient temples, stepwells, and the sandstone Badal Mahal palace.\n\nGolden-hour visitors can walk the broad ramparts while overlooking the Kumbhalgarh Wildlife Sanctuary below, accompanied by ASI-licensed regional historians.',
    location: {
      state: 'Rajasthan',
      district: 'Rajsamand',
      address: 'Kumbhalgarh Fort Road, Kelwara Tehsil',
      pinCode: '313325',
      coordinates: {lat: 25.1479, lng: 73.5829},
    },
    openingHours: '09:00 AM – 06:00 PM (Light Show 06:45 PM)',
    entryFee: {
      indianAdult: 40,
      foreignAdult: 600,
      cameraFee: 25,
      displayLabel: '₹40 Indian · ₹600 Foreign',
      notes: 'Evening Sound & Light Show ticket ₹150 separate at counter.',
    },
    bestSeason: 'Oct – Mar',
    duration: '3 hrs',
    rating: 4.8,
    reviewCount: 368,
    image: '/src/assets/images/dest_heritage_fort_1795509327131.jpg',
    gallery: [
      '/src/assets/images/dest_heritage_fort_1795509327131.jpg',
      '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    ],
    highlights: [
      'Walkable 36 km historic fortification wall with Aravalli views',
      'Sculpted Badal Mahal rooftop pavilions & breeze courtyards',
      'Evening light & Mewar heritage narration in Hindi & English',
    ],
    nearbyPartner: 'Vikramaditya Rao — Heritage & Wildlife Guide',
    reviews: [
      {
        _id: 'drev_201',
        author: 'Aarav Chatterjee',
        hometown: 'Kolkata, West Bengal',
        rating: 5,
        date: 'October 2026',
        comment:
          'Walking the upper Badal Mahal terraces at 5 PM with a local historian brought Mewar architecture to life.',
      },
      {
        _id: 'drev_202',
        author: 'Claire Bennett',
        hometown: 'Bristol, UK',
        rating: 5,
        date: 'September 2026',
        comment:
          'Less crowded than Jaipur forts and surrounded by surprisingly lush green Aravalli hills right after the monsoon.',
      },
    ],
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-10-18T11:15:00.000Z',
  },
  {
    _id: 'dest_003',
    slug: 'mawphlang-laitlum-cloud-ridge',
    name: 'Mawphlang & Laitlum Cloud Ridge',
    category: 'Viewpoints',
    shortDescription:
      'Dramatic Khasi canyon rim overlooking drifting morning valley clouds, terraced ridges, and sacred groves.',
    description:
      'Perched above steep limestone gorges in the East Khasi Hills of Meghalaya, Laitlum ("End of Hills") and nearby Mawphlang Sacred Grove present one of Northeast India’s finest high-altitude panoramas. At dawn, cloud blankets settle inside the canyon floor while stone footpaths connect tiny hillside hamlets.\n\nCommunity elders oversee trail upkeep and guide visitors respectfully through the centuries-old sacred forest where no twig or leaf may be removed.',
    location: {
      state: 'Meghalaya',
      district: 'East Khasi Hills',
      address: 'Laitlum Canyon & Mawphlang Road, Smit',
      pinCode: '793015',
      coordinates: {lat: 25.4488, lng: 91.9083},
    },
    openingHours: '05:30 AM – 05:30 PM (Daily)',
    entryFee: {
      indianAdult: 50,
      foreignAdult: 100,
      displayLabel: '₹50 Community Fee',
      notes: 'Optional sacred grove local guide ₹500 per group.',
    },
    bestSeason: 'Sep – Feb',
    duration: '2 hrs',
    rating: 4.9,
    reviewCount: 445,
    image: '/src/assets/images/dest_cloud_ridge_1795509327763.jpg',
    gallery: [
      '/src/assets/images/dest_cloud_ridge_1795509327763.jpg',
      '/src/assets/images/hero_misty_valley_1795509326975.jpg',
    ],
    highlights: [
      'Unobstructed sunrise cloud inversion from 06:00 AM – 07:30 AM',
      'Village stalls serving hot Khasi red tea and steamed rice cakes',
      'Direct trail access to ancient Mawphlang Sacred Forest',
    ],
    nearbyPartner: 'Vikramaditya Rao — Heritage & Wildlife Guide',
    reviews: [
      {
        _id: 'drev_301',
        author: 'Tenzing Bhutia',
        hometown: 'Gangtok, Sikkim',
        rating: 5,
        date: 'October 2026',
        comment:
          'Reached the ridge before 6 AM and watched the entire valley fill with golden mist. Peaceful and completely uncommercialized.',
      },
    ],
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-10-15T09:00:00.000Z',
  },
  {
    _id: 'dest_004',
    slug: 'munnar-shola-ridge-trail',
    name: 'Munnar Shola & Ridge Trail',
    category: 'Trails',
    shortDescription:
      'Guided 7 km stone-flagged ridge walk weaving through misty tea terraces and endemic Nilgiri bird habitats.',
    description:
      'Traversing the high ranges of Idukki district at 1,850 meters, this 7-kilometer ridge trail links sculpted emerald tea gardens with protected montane shola forests. Along the crest, stone paths reveal sweeping views across Kerala’s Western Ghats divide.\n\nTrail permits pair small groups with trained local trackers who spot Nilgiri pipits, Malabar whistling thrushes, and rare wild orchids.',
    location: {
      state: 'Kerala',
      district: 'Idukki',
      address: 'Lakshmi Estate Ridge Trailhead, Munnar',
      pinCode: '685612',
      coordinates: {lat: 10.0889, lng: 77.0595},
    },
    openingHours: '06:00 AM – 04:00 PM (Last trek entry 01:30 PM)',
    entryFee: {
      indianAdult: 200,
      foreignAdult: 500,
      displayLabel: '₹200 Forest Permit',
      notes: 'Permit includes mandatory local eco-tracker and spring refill.',
    },
    bestSeason: 'Year-round',
    duration: '4 hrs',
    rating: 4.8,
    reviewCount: 254,
    image: '/src/assets/images/hero_misty_valley_1795509326975.jpg',
    gallery: [
      '/src/assets/images/hero_misty_valley_1795509326975.jpg',
      '/src/assets/images/dest_emerald_falls_1795509327499.jpg',
    ],
    highlights: [
      'Over 120 Western Ghats endemic and migratory bird species',
      'Stone rest mandapas every 2 km along the ridge',
      'Permit proceeds directly support local forest-watcher families',
    ],
    nearbyPartner: 'Idukki Spice & Handloom Cooperative',
    reviews: [
      {
        _id: 'drev_401',
        author: 'Rohan Kulkarni',
        hometown: 'Mysuru, Karnataka',
        rating: 5,
        date: 'September 2026',
        comment:
          'Moderate climb with incredible ridgeline views above the tea slopes. Our local tracker spotted three Nilgiri flycatchers.',
      },
    ],
    createdAt: '2026-01-22T08:00:00.000Z',
    updatedAt: '2026-10-12T14:20:00.000Z',
  },
  {
    _id: 'dest_005',
    slug: 'wayanad-spice-tea-terraces',
    name: 'Wayanad Spice & Tea Terraces',
    category: 'Viewpoints',
    shortDescription:
      'Shade-grown organic pepper, green cardamom, and tea slopes managed by multi-generational family estates.',
    description:
      'Sweeping across the lush Chembra foothills in Wayanad, these terraced hills showcase traditional multi-crop agroforestry where black pepper climbs silver oak trees above fragrant cardamom bushes.\n\nOpen village footpaths invite slow travelers to walk the contours, visit sun-drying spice yards, and purchase single-origin honey and cured spices directly from grower cooperatives.',
    location: {
      state: 'Kerala',
      district: 'Wayanad',
      address: 'Meppadi – Ripon Estate Contour Road, Kalpetta',
      pinCode: '673577',
      coordinates: {lat: 11.5564, lng: 76.132},
    },
    openingHours: '07:00 AM – 06:00 PM (Daily)',
    entryFee: {
      indianAdult: 0,
      foreignAdult: 0,
      displayLabel: 'Free Entry · Tasting ₹250',
      notes: 'Public estate ridge walk is free; guided spice curing tour ₹250.',
    },
    bestSeason: 'Aug – Jan',
    duration: '2 hrs',
    rating: 4.8,
    reviewCount: 291,
    image: '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
    gallery: [
      '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
      '/src/assets/images/dining_garden_bistro_1795509328963.jpg',
    ],
    highlights: [
      'Guided spice-curing courtyard walk & fresh green cardamom tasting',
      'Gentle gradient footpath accessible for families and seniors',
      'Zero-middleman farm shop supporting 40+ local growers',
    ],
    nearbyPartner: 'Wayanad Wild Forest Honey & Botanicals',
    reviews: [
      {
        _id: 'drev_501',
        author: 'Kavitha Subramanian',
        hometown: 'Chennai, Tamil Nadu',
        rating: 5,
        date: 'September 2026',
        comment:
          'Smelling freshly harvested cardamom on the drying mats while mist lifted off the tea valley was unforgettable.',
      },
    ],
    createdAt: '2026-01-25T08:00:00.000Z',
    updatedAt: '2026-10-10T16:40:00.000Z',
  },
  {
    _id: 'dest_006',
    slug: 'chettinad-kaveri-heritage-quarter',
    name: 'Chettinad & Kaveri Heritage Quarter',
    category: 'Heritage',
    shortDescription:
      'Restored Athangudi-tiled mansions, Burma teak colonnades, and living handloom weaving courtyards.',
    description:
      'In the historic towns around Karaikudi in Tamil Nadu, palatial nineteenth-century Chettiar courtyard homes stand as masterpieces of passive climate design—combining rainwater-harvesting central courtyards, carved Burma teak pillars, and luminous handmade Athangudi floor tiles.\n\nCommunity custodians welcome travelers for architectural heritage walks, live tile-making demonstrations, and traditional cotton weaving studio visits.',
    location: {
      state: 'Tamil Nadu',
      district: 'Sivaganga (Chettinad)',
      address: 'Kanadukathan Heritage Street, Karaikudi',
      pinCode: '630103',
      coordinates: {lat: 10.1714, lng: 78.7785},
    },
    openingHours: '09:00 AM – 05:30 PM (Closed Tuesdays)',
    entryFee: {
      indianAdult: 100,
      foreignAdult: 250,
      displayLabel: '₹100 Heritage Pass',
      notes: 'Covers courtyard mansion access & Athangudi tile workshop visit.',
    },
    bestSeason: 'Year-round',
    duration: '2 hrs',
    rating: 4.7,
    reviewCount: 198,
    image: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    gallery: [
      '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
      '/src/assets/images/dining_garden_bistro_1795509328963.jpg',
    ],
    highlights: [
      'Live demonstration of hand-pressed Athangudi floor tiles',
      'Visit to traditional Chettinad cotton sari loom studios',
      'Walking distance to restored family courtyard homestays',
    ],
    nearbyPartner: 'Tharavadu & Athangudi Courtyard Stay',
    reviews: [
      {
        _id: 'drev_601',
        author: 'Siddharth & Meera Menon',
        hometown: 'Mumbai, Maharashtra',
        rating: 5,
        date: 'October 2026',
        comment:
          'Every doorway and courtyard pillar tells a story. Seeing artisans craft Athangudi tiles by hand was a highlight of our South India trip.',
      },
    ],
    createdAt: '2026-01-28T08:00:00.000Z',
    updatedAt: '2026-10-08T12:00:00.000Z',
  },
];
