import type {BusinessDocument} from '../types/business';

export const BUSINESS_CATEGORIES = [
  'Hotels',
  'Restaurants',
  'Homestays',
  'Travel agencies',
  'Taxi services',
  'Local handicrafts',
  'Tour guides',
] as const;

export const BUSINESS_CATEGORY_DEFAULT_IMAGES: Record<
  (typeof BUSINESS_CATEGORIES)[number],
  string
> = {
  Hotels: '/src/assets/images/stay_forest_resort_1795509327393.jpg',
  Restaurants: '/src/assets/images/dining_garden_bistro_1795509328963.jpg',
  Homestays: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
  'Travel agencies': '/src/assets/images/biz_travel_agency_1795510568072.jpg',
  'Taxi services': '/src/assets/images/biz_hill_taxi_1795510568329.jpg',
  'Local handicrafts': '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
  'Tour guides': '/src/assets/images/biz_local_guide_1795509329782.jpg',
};

export const BUSINESSES_SEED: BusinessDocument[] = [
  {
    _id: 'biz_001',
    slug: 'kabini-timberline-eco-sanctuary',
    ownerId: 'seed_owner_1',
    ownerName: 'Devraj Hegde',
    name: 'Kabini Timberline Eco-Sanctuary',
    category: 'Hotels',
    image: '/src/assets/images/stay_forest_resort_1795509327393.jpg',
    shortDescription:
      'Teak and laterite-stone eco-lodge on the Nagarhole forest edge with infinity pool and Ayurvedic pavilion.',
    description:
      'Designed around sustainable timber joinery and rainwater harvesting, Kabini Timberline Eco-Sanctuary offers tranquil forest-view suites minutes from the Nagarhole wildlife corridor. Guests enjoy guided morning nature walks, locally sourced Kodava cuisine, and serene dusk reflection pools.',
    location: {
      city: 'Kabini / HD Kote',
      state: 'Karnataka',
      address: 'Karapura Forest Buffer Road, Mysuru District 571114',
      coordinates: {lat: 11.9389, lng: 76.3469},
    },
    contact: {
      phone: '+91 8228 264 510',
      email: 'stay@kabinitimberline.in',
      website: 'https://swadeshtrails.in/kabini-timberline',
    },
    operatingHours: '24 Hours (Check-in 01:00 PM · Check-out 11:00 AM)',
    priceRange: '₹9,200 / night',
    rating: 4.9,
    reviewCount: 248,
    status: 'approved',
    highlights: [
      'Solar-heated infinity pool overlooking reserve woodland',
      'In-house naturalist desk & dusk safari coordination',
      'Complimentary estate breakfast & zero-plastic suites',
    ],
    reviews: [
      {
        _id: 'brev_101',
        author: 'Rituja Deshpande',
        rating: 5,
        date: 'October 2026',
        comment:
          'Quiet forest atmosphere, warm lantern lighting at dusk, and exceptionally knowledgeable resident naturalists.',
      },
    ],
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    _id: 'biz_002',
    slug: 'malabar-spice-millet-pavilion',
    ownerId: 'seed_owner_2',
    ownerName: 'Lakshmi Nair',
    name: 'Malabar Spice & Millet Pavilion',
    category: 'Restaurants',
    image: '/src/assets/images/dining_garden_bistro_1795509328963.jpg',
    shortDescription:
      'Open-air farm-to-table garden restaurant serving heirloom millet thalis, wood-fired appams, and estate brews.',
    description:
      'Set beneath woven bamboo pendant lamps beside an organic kitchen garden in Wayanad, Malabar Spice & Millet Pavilion celebrates regional harvests. Every dish uses cold-pressed coconut oil, heirloom ragi, and spices sourced from neighboring cooperatives.',
    location: {
      city: 'Kalpetta',
      state: 'Kerala',
      address: 'Botanical Garden Lane, Meppadi Road, Wayanad 673121',
      coordinates: {lat: 11.6085, lng: 76.0835},
    },
    contact: {
      phone: '+91 4936 205 840',
      email: 'kitchen@malabarpavilion.in',
    },
    operatingHours: '08:00 AM – 10:00 PM (Daily)',
    priceRange: '₹950 for two',
    rating: 4.9,
    reviewCount: 342,
    status: 'approved',
    highlights: [
      'Farm-to-table Malabar thalis & Jain/vegan friendly menu',
      'Outdoor teak garden seating with evening acoustic folk music',
      'Direct UPI payment & zero service charge policy',
    ],
    reviews: [
      {
        _id: 'brev_201',
        author: 'David & Claire Bennett',
        rating: 5,
        date: 'September 2026',
        comment:
          'Fresh herbs harvested steps away from our table. The millet appam and pepper stew were unforgettable.',
      },
    ],
    createdAt: '2026-02-05T08:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    _id: 'biz_003',
    slug: 'tharavadu-athangudi-courtyard-stay',
    ownerId: 'seed_owner_3',
    ownerName: 'Meenakshi Sundaram',
    name: 'Tharavadu & Athangudi Courtyard Stay',
    category: 'Homestays',
    image: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    shortDescription:
      'Restored 110-year-old courtyard home with Burma teak pillars, brass lamps, and traditional home-cooked meals.',
    description:
      'Hosted by a third-generation heritage family, this lovingly restored courtyard homestay pairs historic timber craftsmanship with modern comfort. Guests wake up to filter coffee on the veranda and enjoy home-cooked regional breakfasts.',
    location: {
      city: 'Karaikudi',
      state: 'Tamil Nadu',
      address: '14 Kanadukathan Courtyard Lane, Chettinad 630103',
      coordinates: {lat: 10.1714, lng: 78.7795},
    },
    contact: {
      phone: '+91 4565 273 190',
      email: 'hosts@tharavadustay.in',
    },
    operatingHours: '07:00 AM – 10:00 PM Reception (24h Guest Access)',
    priceRange: '₹3,900 / night',
    rating: 4.9,
    reviewCount: 215,
    status: 'approved',
    highlights: [
      'Hand-pressed Athangudi tile courtyard & shaded veranda',
      'Authentic home-cooked Chettinad & Kerala breakfast included',
      'Hosted morning walks to local weaving & tile workshops',
    ],
    reviews: [
      {
        _id: 'brev_301',
        author: 'Siddharth Menon',
        rating: 5,
        date: 'October 2026',
        comment:
          'Felt like staying with welcoming relatives in a living architectural museum.',
      },
    ],
    createdAt: '2026-02-08T08:00:00.000Z',
    updatedAt: '2026-10-10T09:00:00.000Z',
  },
  {
    _id: 'biz_004',
    slug: 'terra-journeys-india-travel-desk',
    ownerId: 'seed_owner_4',
    ownerName: 'Anjali Krishnan',
    name: 'Terra Journeys — Regional Travel Agency',
    category: 'Travel agencies',
    image: '/src/assets/images/biz_travel_agency_1795510568072.jpg',
    shortDescription:
      'Boutique eco-travel planner crafting multi-state rail, road, and heritage homestay circuits across India.',
    description:
      'Terra Journeys specializes in low-impact, culturally immersive Indian travel circuits connecting Western Ghats estates, Rajasthan forts, and Northeast community trails. Our travel desk arranges verified permits, train transfers, and curated homestays.',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      address: '42 100 Feet Road, Indiranagar, Bengaluru 560038',
      coordinates: {lat: 12.9719, lng: 77.6412},
    },
    contact: {
      phone: '+91 80 4118 7290',
      email: 'plan@terrajourneys.in',
    },
    operatingHours: '09:30 AM – 07:30 PM (Mon – Sat)',
    priceRange: 'Custom circuits from ₹8,500',
    rating: 4.8,
    reviewCount: 176,
    status: 'approved',
    highlights: [
      'Forest permit & ASI monument pass pre-booking',
      'Seamless rail, airport & mountain cab coordination',
      '24/7 on-trip WhatsApp & regional helpline support',
    ],
    reviews: [
      {
        _id: 'brev_401',
        author: 'Vikram Sethi',
        rating: 5,
        date: 'September 2026',
        comment:
          'Planned our 6-day Coorg–Wayanad family circuit with zero stress and authentic homestays.',
      },
    ],
    createdAt: '2026-02-12T08:00:00.000Z',
    updatedAt: '2026-10-12T15:00:00.000Z',
  },
  {
    _id: 'biz_005',
    slug: 'ghat-crest-tourist-taxi-fleet',
    ownerId: 'seed_owner_5',
    ownerName: 'Mahesh Gowda',
    name: 'Ghat Crest Tourist Taxi & Cab Services',
    category: 'Taxi services',
    image: '/src/assets/images/biz_hill_taxi_1795510568329.jpg',
    shortDescription:
      'Licensed hill-driving SUVs and sedans for airport transfers, waterfall loops, and intercity Ghat routes.',
    description:
      'Operating verified yellow-board tourist vehicles with experienced local hill drivers fluent in English, Hindi, Kannada, and Malayalam. Ideal for early-morning sunrise viewpoints, monsoon waterfall trails, and station pickups.',
    location: {
      city: 'Madikeri',
      state: 'Karnataka',
      address: 'KSRTC Bypass Circle, Stuart Hill, Madikeri 571201',
      coordinates: {lat: 12.4244, lng: 75.7382},
    },
    contact: {
      phone: '+91 94480 65210',
      email: 'dispatch@ghatcrestcabs.in',
    },
    operatingHours: '05:00 AM – 11:00 PM (Pre-booked 24h Airport Transfers)',
    priceRange: '₹2,600 / full-day local cab',
    rating: 4.8,
    reviewCount: 289,
    status: 'approved',
    highlights: [
      'Experienced hill-terrain chauffeurs with tourist permits',
      'Transparent per-day & per-km rates with UPI billing',
      'Clean 6-seater Innova & compact sedan fleet',
    ],
    reviews: [
      {
        _id: 'brev_501',
        author: 'Neha Kapoor',
        rating: 5,
        date: 'October 2026',
        comment:
          'Mahesh picked us up at 5:30 AM sharp for the ridge sunrise and knew every safe scenic pull-out.',
      },
    ],
    createdAt: '2026-02-14T08:00:00.000Z',
    updatedAt: '2026-10-16T08:00:00.000Z',
  },
  {
    _id: 'biz_006',
    slug: 'idukki-spice-handloom-cooperative',
    ownerId: 'seed_owner_6',
    ownerName: 'Sulochana Devi',
    name: 'Idukki Spice & Handloom Cooperative',
    category: 'Local handicrafts',
    image: '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
    shortDescription:
      'Women-led village cooperative offering handwoven cotton stoles, bamboo basketry, wild honey, and green cardamom.',
    description:
      'Connecting forty-five rural artisan and spice-grower households directly with visitors. Watch live bamboo craft and natural-dye weaving demonstrations, sample freshly cured cardamom, and support fair-trade village craft.',
    location: {
      city: 'Kumily / Munnar',
      state: 'Kerala',
      address: 'Spice Market Cooperative Road, Idukki District 685509',
      coordinates: {lat: 9.6031, lng: 77.1615},
    },
    contact: {
      phone: '+91 4869 224 780',
      email: 'coop@idukkicrafts.in',
    },
    operatingHours: '09:00 AM – 06:30 PM (Daily)',
    priceRange: 'Crafts from ₹350 · Free loom tour',
    rating: 4.9,
    reviewCount: 218,
    status: 'approved',
    highlights: [
      '100% revenue goes directly to cooperative artisan families',
      'Live bamboo weaving & spice grading demonstrations',
      'Single-origin wild forest honey & Nilgiri handloom shawls',
    ],
    reviews: [
      {
        _id: 'brev_601',
        author: 'Kavitha Subramanian',
        rating: 5,
        date: 'September 2026',
        comment:
          'Authentic natural-dyed handloom stoles and aromatic cardamom at honest cooperative prices.',
      },
    ],
    createdAt: '2026-02-16T08:00:00.000Z',
    updatedAt: '2026-10-11T14:00:00.000Z',
  },
  {
    _id: 'biz_007',
    slug: 'vikramaditya-rao-heritage-wildlife-guide',
    ownerId: 'seed_owner_7',
    ownerName: 'Vikramaditya Rao',
    name: 'Vikramaditya Rao — Certified Tour Guide',
    category: 'Tour guides',
    image: '/src/assets/images/biz_local_guide_1795509329782.jpg',
    shortDescription:
      'Ministry-licensed heritage historian and Western Ghats naturalist guiding fort walks and dawn birding.',
    description:
      'With fourteen years guiding travelers, wildlife photographers, and university field groups across Karnataka and Rajasthan, Vikramaditya leads unhurried architectural fort walks, canopy birding sessions, and local folklore trails.',
    location: {
      city: 'Mysuru & Udaipur Circuits',
      state: 'Karnataka / Rajasthan',
      address: 'Heritage Pavilion Gate 2, Old Town Quarter 570001',
      coordinates: {lat: 12.3051, lng: 76.6551},
    },
    contact: {
      phone: '+91 98452 31044',
      email: 'vikram.walks@swadeshtrails.in',
    },
    operatingHours: '06:00 AM – 06:00 PM (By Prior Booking)',
    priceRange: '₹2,200 / half-day group',
    rating: 5.0,
    reviewCount: 164,
    status: 'approved',
    highlights: [
      'Ministry of Tourism licensed regional guide (EN / HI / KN)',
      'Field binoculars & illustrated heritage trail maps provided',
      'Custom pacing for families, solo travelers & photo groups',
    ],
    reviews: [
      {
        _id: 'brev_701',
        author: 'Aarav Chatterjee',
        rating: 5,
        date: 'September 2026',
        comment:
          'Turned our fort and forest walk into the richest storytelling afternoon of the entire trip.',
      },
    ],
    createdAt: '2026-02-20T08:00:00.000Z',
    updatedAt: '2026-10-19T11:00:00.000Z',
  },
  {
    _id: 'biz_008',
    slug: 'aravalli-folk-craft-guild',
    ownerId: 'seed_owner_8',
    ownerName: 'Harish Kumawat',
    name: 'Aravalli Terracotta & Miniature Guild',
    category: 'Local handicrafts',
    image: '/src/assets/images/dest_heritage_fort_1795509327131.jpg',
    shortDescription:
      'Family-run sandstone carving, natural-pigment miniature art, and Molela terracotta studio near Kumbhalgarh.',
    description:
      'A third-generation craft studio welcoming visitors for hands-on clay relief workshops and heritage pigment demonstrations along the Kumbhalgarh approach road.',
    location: {
      city: 'Kelwara / Kumbhalgarh',
      state: 'Rajasthan',
      address: 'Artisan Courtyard, Fort Approach Road, Rajsamand 313325',
      coordinates: {lat: 25.1416, lng: 73.5882},
    },
    contact: {
      phone: '+91 94141 88219',
      email: 'guild@aravalliterracotta.in',
    },
    operatingHours: '09:30 AM – 06:30 PM (Daily)',
    priceRange: 'Workshop ₹400 · Crafts from ₹250',
    rating: 4.7,
    reviewCount: 92,
    status: 'pending',
    highlights: [
      'Traditional Molela clay plaque molding demo',
      'Natural mineral pigment painting',
    ],
    reviews: [],
    createdAt: '2026-11-18T08:00:00.000Z',
    updatedAt: '2026-11-18T08:00:00.000Z',
  },
];
