export type DestinationCategory = 'All' | 'Waterfalls' | 'Heritage' | 'Viewpoints' | 'Trails';

export interface DestinationLocation {
  state: string;
  district: string;
  address: string;
  pinCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DestinationEntryFee {
  indianAdult: number;
  foreignAdult: number;
  cameraFee?: number;
  displayLabel: string;
  notes?: string;
}

export interface DestinationReview {
  _id: string;
  author: string;
  hometown: string;
  rating: number;
  date: string;
  comment: string;
}

/**
 * MongoDB-ready Destination schema.
 * Mirrors a Mongoose/MongoDB document structure (_id, slug, nested subdocuments, timestamps)
 * so switching the repository from seed data to MongoDB Atlas requires zero UI changes.
 */
export interface DestinationDocument {
  _id: string;
  slug: string;
  name: string;
  category: Exclude<DestinationCategory, 'All'>;
  shortDescription: string;
  description: string;
  location: DestinationLocation;
  openingHours: string;
  entryFee: DestinationEntryFee;
  bestSeason: string;
  duration: string;
  rating: number;
  reviewCount: number;
  reviews: DestinationReview[];
  image: string;
  gallery: string[];
  highlights: string[];
  nearbyPartner: string;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationFilterQuery {
  search?: string;
  category?: DestinationCategory;
  season?: string;
}
