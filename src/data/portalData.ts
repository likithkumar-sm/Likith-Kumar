export type DestinationCategory = 'All' | 'Waterfalls' | 'Heritage' | 'Viewpoints' | 'Trails';

export interface Destination {
  id: string;
  name: string;
  region: string;
  category: Exclude<DestinationCategory, 'All'>;
  distance: string;
  duration: string;
  bestSeason: string;
  entryFee: string;
  rating: number;
  reviewCount: number;
  image: string;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  nearbyPartner: string;
}

export type BusinessCategory = 'All' | 'Tour Guides' | 'Local Crafts' | 'Estate Shops' | 'Eco Adventures';

export interface LocalBusiness {
  id: string;
  name: string;
  category: Exclude<BusinessCategory, 'All'>;
  specialty: string;
  hours: string;
  priceInfo: string;
  rating: number;
  reviewCount: number;
  verifiedPartner: boolean;
  location: string;
  image: string;
  description: string;
  contactEmail: string;
}

export type StayDiningCategory = 'All' | 'Hotels' | 'Homestays' | 'Restaurants';

export interface StayOrDining {
  id: string;
  name: string;
  type: 'Hotels' | 'Homestays' | 'Restaurants';
  neighborhood: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  image: string;
  summary: string;
  amenities: string[];
}

export type ReviewCategory = 'All' | 'Destinations' | 'Stays & Dining' | 'Local Businesses';

export interface ReviewItem {
  id: string;
  author: string;
  hometown: string;
  placeName: string;
  category: Exclude<ReviewCategory, 'All'>;
  rating: number;
  date: string;
  comment: string;
}

export const HERO_IMAGE = '/src/assets/images/hero_misty_valley_1795509326975.jpg';

export const DESTINATIONS: Destination[] = [
  {
    id: 'emerald-cascade-falls',
    name: 'Abbey & Irpu Forest Cascades',
    region: 'Kodagu, Karnataka',
    category: 'Waterfalls',
    distance: 'Kodagu · Western Ghats',
    duration: '2.5 hrs',
    bestSeason: 'Jun – Nov',
    entryFee: '₹80 entry',
    rating: 4.9,
    reviewCount: 412,
    image: '/src/assets/images/dest_emerald_falls_1795509327499.jpg',
    shortDescription:
      'Monsoon-fed Western Ghats cascades plunging over mossy basalt rock into an emerald pool lined with giant ferns.',
    fullDescription:
      'Nestled along the Brahmagiri wildlife border in Kodagu, these twin forest waterfalls rush down ancient volcanic basalt surrounded by wild cardamom and evergreen shola canopy. A paved eco-trail with bamboo bridges guides visitors safely to the lower viewing deck.',
    highlights: [
      'Peak mist & morning sunbeams between 07:30 and 09:30',
      'Forest department check-post with plastic-free bottle deposit',
      'Direct trail link to Kodava coffee estates nearby',
    ],
    nearbyPartner: 'Sahyadri Eco-Trails & River Collective',
  },
  {
    id: 'surya-crest-fort',
    name: 'Kumbhalgarh Sandstone Citadel',
    region: 'Rajsamand, Rajasthan',
    category: 'Heritage',
    distance: 'Aravalli Hills · Rajasthan',
    duration: '3 hrs',
    bestSeason: 'Oct – Mar',
    entryFee: '₹150 entry',
    rating: 4.8,
    reviewCount: 368,
    image: '/src/assets/images/dest_heritage_fort_1795509327131.jpg',
    shortDescription:
      '15th-century Mewar hill fort famous for its 36 km stone ramparts, domed chhatris, and Aravalli sunset views.',
    fullDescription:
      'Rising high above the forested Aravalli range, this UNESCO-recognized Rajput citadel features carved sandstone pavilions, Badal Mahal terraces, and panoramic watchtowers overlooking wildlife sanctuary valleys.',
    highlights: [
      'Golden-hour walk along the sculpted Badal Mahal ramparts',
      'Evening light & heritage storytelling at the main courtyard',
      'ASI-certified local historian walks available daily',
    ],
    nearbyPartner: 'Vikramaditya Rao — Certified Heritage & Wildlife Guide',
  },
  {
    id: 'cloudline-ridge',
    name: 'Mawphlang & Laitlum Cloud Ridge',
    region: 'East Khasi Hills, Meghalaya',
    category: 'Viewpoints',
    distance: 'Khasi Hills · Meghalaya',
    duration: '2 hrs',
    bestSeason: 'Sep – Feb',
    entryFee: '₹50 community fee',
    rating: 4.9,
    reviewCount: 445,
    image: '/src/assets/images/dest_cloud_ridge_1795509327763.jpg',
    shortDescription:
      'Dramatic Khasi canyon rim overlooking drifting morning valley clouds, terraced ridges, and sacred groves.',
    fullDescription:
      'Perched above deep limestone gorges in Meghalaya, this quiet stone viewpoint offers sweeping vistas of mist-filled valleys and ancient village footpaths maintained by the local Khasi community council.',
    highlights: [
      'Best cloud inversion views between 06:00 and 07:30',
      'Local village tea stalls serving red Khasi tea & steamed pitha',
      'Community-stewarded trail preserving indigenous sacred forest',
    ],
    nearbyPartner: 'Vikramaditya Rao — Certified Heritage & Wildlife Guide',
  },
  {
    id: 'whispering-canopy-trail',
    name: 'Munnar Shola & Ridge Trail',
    region: 'Idukki, Kerala',
    category: 'Trails',
    distance: 'Idukki · Kerala',
    duration: '4 hrs',
    bestSeason: 'Year-round',
    entryFee: '₹200 forest permit',
    rating: 4.8,
    reviewCount: 254,
    image: '/src/assets/images/hero_misty_valley_1795509326975.jpg',
    shortDescription:
      'Guided 7 km stone-flagged ridge walk weaving through misty tea terraces and endemic Nilgiri bird habitats.',
    fullDescription:
      'Linking manicured high-range tea slopes with protected shola grasslands, this trail showcases Malabar whistling thrushes, Neelakurinji hill slopes, and uninterrupted views across the Western Ghats divide.',
    highlights: [
      'Over 120 Western Ghats endemic and migratory bird species',
      'Stone rest mandapas and natural spring water stations',
      'Guide fees directly fund local tribal forest-watcher livelihoods',
    ],
    nearbyPartner: 'Idukki Spice & Handloom Cooperative',
  },
  {
    id: 'terrace-mist-valley',
    name: 'Wayanad Spice & Tea Terraces',
    region: 'Wayanad, Kerala',
    category: 'Viewpoints',
    distance: 'Wayanad · Kerala',
    duration: '2 hrs',
    bestSeason: 'Aug – Jan',
    entryFee: 'Free entry',
    rating: 4.8,
    reviewCount: 291,
    image: '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
    shortDescription:
      'Shade-grown organic pepper, green cardamom, and tea slopes managed by multi-generational family estates.',
    fullDescription:
      'Walk shaded estate paths lined with silver oak and pepper vines as mist lifts off the Wayanad plateau. Visitors meet local growers curing cardamom pods and weaving bamboo harvest baskets.',
    highlights: [
      'Guided spice-curing yard walk and fresh cardamom tasting',
      'Gentle terraced paths suitable for families and elders',
      'Zero-middleman farm store supporting 40+ local growers',
    ],
    nearbyPartner: 'Wayanad Wild Forest Honey & Botanicals',
  },
  {
    id: 'kaveri-stone-pavilion',
    name: 'Chettinad & Kaveri Heritage Quarter',
    region: 'Karaikudi, Tamil Nadu',
    category: 'Heritage',
    distance: 'Chettinad · Tamil Nadu',
    duration: '2 hrs',
    bestSeason: 'Year-round',
    entryFee: '₹100 heritage pass',
    rating: 4.7,
    reviewCount: 198,
    image: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    shortDescription:
      'Restored Athangudi-tiled mansions, Burma teak colonnades, and living handloom weaving courtyards.',
    fullDescription:
      'Step inside century-old Chettinad courtyard homes built with lime plaster, carved teak pillars, and hand-pressed Athangudi floor tiles. Local custodians lead architectural walks paired with traditional filter coffee.',
    highlights: [
      'Live demonstration of hand-pressed Athangudi tile craftsmanship',
      'Visit to traditional Kandasamy cotton sari weavers',
      'Adjacent to authentic family-run courtyard homestays',
    ],
    nearbyPartner: 'Tharavadu & Athangudi Courtyard Stay',
  },
];

export const LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    id: 'aranya-spice-loom',
    name: 'Idukki Spice & Handloom Cooperative',
    category: 'Local Crafts',
    specialty: 'Green Cardamom, Handloom Cotton & Bamboo Basketry',
    hours: '09:00 – 18:30 daily',
    priceInfo: 'Free workshop tour · Tastings ₹250',
    rating: 4.9,
    reviewCount: 218,
    verifiedPartner: true,
    location: 'Munnar – Thekkady Belt, Kerala',
    image: '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
    description:
      'A women-led rural cooperative connecting forty-five Kerala spice growers and bamboo weavers directly with travelers. Experience live loom weaving, spice grading, and fair-trade farm purchases via UPI or cash.',
    contactEmail: 'coop@swadeshtrails.in',
  },
  {
    id: 'raghav-menon-guide',
    name: 'Vikramaditya Rao — Heritage & Wildlife Guide',
    category: 'Tour Guides',
    specialty: 'ASI Fort Walks, Birding & Western Ghats Ecology',
    hours: '06:00 – 18:00 by booking',
    priceInfo: '₹2,200 per half-day group',
    rating: 5.0,
    reviewCount: 164,
    verifiedPartner: true,
    location: 'Karnataka & Rajasthan Circuits',
    image: '/src/assets/images/biz_local_guide_1795509329782.jpg',
    description:
      'Ministry of Tourism licensed regional guide with fourteen years leading architectural heritage walks, monsoon trail photography, and dawn birding expeditions in English, Hindi, and Kannada.',
    contactEmail: 'vikram.guides@swadeshtrails.in',
  },
  {
    id: 'shola-wild-honey',
    name: 'Wayanad Wild Forest Honey & Botanicals',
    category: 'Estate Shops',
    specialty: 'Single-Origin Forest Honey, Tellicherry Pepper & Oils',
    hours: '09:30 – 19:00 daily',
    priceInfo: 'Artisan gift boxes from ₹480',
    rating: 4.8,
    reviewCount: 147,
    verifiedPartner: true,
    location: 'Kalpetta Market Square, Kerala',
    image: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    description:
      'Community-sourced apothecary partnering with indigenous Kurumba honey collectors and organic spice farmers across the Nilgiri foothills. Every jar carries harvest elevation and batch origin.',
    contactEmail: 'hello@wayanadbotanicals.in',
  },
  {
    id: 'highland-trail-outfitters',
    name: 'Sahyadri Eco-Trails & River Collective',
    category: 'Eco Adventures',
    specialty: 'Shola Ridge Treks, Estate Cycling & Bamboo Rafting',
    hours: '06:30 – 18:00 daily',
    priceInfo: 'Guided excursions from ₹1,450',
    rating: 4.8,
    reviewCount: 232,
    verifiedPartner: true,
    location: 'Madikeri & Kabini Approach, Karnataka',
    image: '/src/assets/images/dest_cloud_ridge_1795509327763.jpg',
    description:
      'Certified eco-tourism outfitter organizing small-group sunrise ridge treks, coffee-estate gravel cycling loops, and calm-water coracle and bamboo rafting with trained village lifeguards.',
    contactEmail: 'trails@sahyadricollective.in',
  },
];

export const STAYS_AND_DINING: StayOrDining[] = [
  {
    id: 'timberline-sanctuary',
    name: 'Kabini Timberline Eco-Sanctuary',
    type: 'Hotels',
    neighborhood: 'Nagarhole Edge, Karnataka',
    priceLabel: '₹9,200 / night',
    rating: 4.9,
    reviewCount: 248,
    image: '/src/assets/images/stay_forest_resort_1795509327393.jpg',
    summary:
      'Teak and laterite-stone eco-lodge nestled along the Kabini forest buffer with a reflection pool, Ayurvedic wellness pavilion, and naturalist-led dusk safaris.',
    amenities: ['Infinity Forest Pool', 'Ayurvedic Spa', 'Breakfast Included'],
  },
  {
    id: 'sylvan-ridge-lodge',
    name: 'Aravalli Ridge Heritage Haveli',
    type: 'Hotels',
    neighborhood: 'Kumbhalgarh Hills, Rajasthan',
    priceLabel: '₹6,800 / night',
    rating: 4.8,
    reviewCount: 189,
    image: '/src/assets/images/dest_heritage_fort_1795509327131.jpg',
    summary:
      'Restored sandstone hilltop haveli featuring jharokha balconies facing the Aravalli reserve, rooftop folk music evenings, and fort shuttle service.',
    amenities: ['Aravalli View Suites', 'Cultural Evenings', 'EV Charging'],
  },
  {
    id: 'veranda-heritage-courtyard',
    name: 'Tharavadu & Athangudi Courtyard Stay',
    type: 'Homestays',
    neighborhood: 'Fort Kochi & Chettinad Heritage Belt',
    priceLabel: '₹3,900 / night',
    rating: 4.9,
    reviewCount: 215,
    image: '/src/assets/images/stay_heritage_homestay_1795509328203.jpg',
    summary:
      'A 110-year-old family-hosted traditional courtyard home with carved teak pillars, brass oil lamps, and freshly cooked regional sadya & appam breakfasts.',
    amenities: ['Home-Cooked Meals', 'Central Courtyard', 'Host Heritage Walk'],
  },
  {
    id: 'cardamom-grove-cottage',
    name: 'Kodava Estate Coffee Bungalow',
    type: 'Homestays',
    neighborhood: 'Madikeri, Kodagu (Coorg)',
    priceLabel: '₹3,400 / night',
    rating: 4.8,
    reviewCount: 156,
    image: '/src/assets/images/dest_emerald_falls_1795509327499.jpg',
    summary:
      'Intimate four-room planter bungalow inside a shade-grown Arabica and pepper plantation, offering Akki Roti breakfasts and guided estate birding.',
    amenities: ['Plantation Walk', 'Estate Coffee Breakfast', 'High-Speed Wi-Fi'],
  },
  {
    id: 'hearth-and-leaf-pavilion',
    name: 'Malabar Spice & Millet Pavilion',
    type: 'Restaurants',
    neighborhood: 'Wayanad Botanical Quarter, Kerala',
    priceLabel: '₹950 for two',
    rating: 4.9,
    reviewCount: 342,
    image: '/src/assets/images/dining_garden_bistro_1795509328963.jpg',
    summary:
      'Open-air garden kitchen serving heirloom ragi & Malabar thalis, wood-fired appams, coconut-milk stews, and freshly harvested organic greens.',
    amenities: ['Farm-to-Table', 'Jain & Vegan Options', 'Garden Seating'],
  },
  {
    id: 'peppercorn-terrace-cafe',
    name: 'Chikmagalur Filter Coffee Terrace',
    type: 'Restaurants',
    neighborhood: 'Baba Budangiri Foothills, Karnataka',
    priceLabel: '₹550 for two',
    rating: 4.8,
    reviewCount: 274,
    image: '/src/assets/images/biz_spice_artisan_1795509329470.jpg',
    summary:
      'Canopy-level timber café brewing single-estate Chikmagalur brass filter coffee paired with warm jaggery-cardamom buns and spiced millet bowls.',
    amenities: ['Single-Estate Coffee', 'Sunrise Opening', 'Artisan Bakery'],
  },
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Ananya Deshmukh',
    hometown: 'Bengaluru, Karnataka',
    placeName: 'Abbey & Irpu Forest Cascades',
    category: 'Destinations',
    rating: 5,
    date: 'October 2026',
    comment:
      'Reached the Kodagu trailhead at 7:15 AM through the portal recommendations. The zero-plastic bottle check and local naturalist walk made the monsoon waterfall trek unforgettable.',
  },
  {
    id: 'rev-2',
    author: 'Siddharth & Meera Menon',
    hometown: 'Mumbai, Maharashtra',
    placeName: 'Tharavadu & Athangudi Courtyard Stay',
    category: 'Stays & Dining',
    rating: 5,
    date: 'October 2026',
    comment:
      'Waking up in a century-old teak courtyard with brass lamps and fresh appam stew felt worlds apart from commercial hotels. Our hosts even arranged a weaver studio visit nearby.',
  },
  {
    id: 'rev-3',
    author: 'Kavitha Subramanian',
    hometown: 'Chennai, Tamil Nadu',
    placeName: 'Idukki Spice & Handloom Cooperative',
    category: 'Local Businesses',
    rating: 5,
    date: 'September 2026',
    comment:
      'Authentic green cardamom, handwoven cotton stoles, and zero tourist-trap markups. Being able to meet the women weavers and pay directly via UPI was wonderful.',
  },
  {
    id: 'rev-4',
    author: 'Aarav Chatterjee',
    hometown: 'Kolkata, West Bengal',
    placeName: 'Kumbhalgarh Sandstone Citadel',
    category: 'Destinations',
    rating: 5,
    date: 'September 2026',
    comment:
      'Booked Vikramaditya as our heritage guide for the sunset fort walk. Learning the Mewar engineering history while watching clouds roll over the Aravalli hills was worth every minute.',
  },
];
