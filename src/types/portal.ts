export type CategoryScope = 'destination' | 'business';

export interface CategoryDocument {
  _id: string;
  name: string;
  slug: string;
  scope: CategoryScope;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewTargetType = 'destination' | 'business' | 'portal';

export type PortalReviewCategory =
  | 'Destinations'
  | 'Stays & Dining'
  | 'Local Businesses';

export interface ReviewDocument {
  _id: string;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  category: PortalReviewCategory;
  userId?: string;
  author: string;
  hometown: string;
  rating: number;
  date: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingTargetType =
  | 'business'
  | 'stay'
  | 'dining'
  | 'destination_partner';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingDocument {
  _id: string;
  userId?: string;
  ownerId?: string;
  targetType: BookingTargetType;
  targetId?: string;
  targetName: string;
  targetSubtitle: string;
  priceInfo: string;
  guestName: string;
  guestEmail: string;
  visitDate: string;
  guestsCount: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
