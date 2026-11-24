export type BusinessDirectoryCategory =
  | 'All'
  | 'Hotels'
  | 'Restaurants'
  | 'Homestays'
  | 'Travel agencies'
  | 'Taxi services'
  | 'Local handicrafts'
  | 'Tour guides';

export type BusinessCategoryValue = Exclude<BusinessDirectoryCategory, 'All'>;

export type BusinessApprovalStatus = 'approved' | 'pending' | 'rejected';

export type UserRole = 'tourist' | 'business_owner' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  phone: string;
  createdAt: string;
}

export interface BusinessReview {
  _id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface BusinessDocument {
  _id: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: BusinessCategoryValue;
  image: string;
  shortDescription: string;
  description: string;
  location: {
    city: string;
    state: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  operatingHours: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  status: BusinessApprovalStatus;
  moderationNote?: string;
  highlights: string[];
  reviews: BusinessReview[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFilterQuery {
  search?: string;
  category?: BusinessDirectoryCategory;
  state?: string;
}
