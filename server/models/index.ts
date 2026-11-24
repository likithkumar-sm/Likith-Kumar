import mongoose, {Schema, type Model} from 'mongoose';
import type {BusinessDocument} from '../../src/types/business.ts';
import type {DestinationDocument} from '../../src/types/destination.ts';
import type {
  BookingDocument,
  CategoryDocument,
  ReviewDocument,
} from '../../src/types/portal.ts';

export interface UserDbDoc {
  _id: string;
  name: string;
  email: string;
  role: 'tourist' | 'business_owner' | 'admin';
  city: string;
  phone: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<UserDbDoc>(
  {
    _id: {type: String, required: true},
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    role: {
      type: String,
      enum: ['tourist', 'business_owner', 'admin'],
      default: 'tourist',
      required: true,
    },
    city: {type: String, default: 'India', trim: true},
    phone: {type: String, default: '', trim: true},
    passwordSalt: {type: String, required: true},
    passwordHash: {type: String, required: true},
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

const CategorySchema = new Schema<CategoryDocument>(
  {
    _id: {type: String, required: true},
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true, trim: true},
    scope: {type: String, enum: ['destination', 'business'], required: true},
    description: {type: String, default: '', trim: true},
    displayOrder: {type: Number, default: 1},
  },
  {
    timestamps: true,
    collection: 'categories',
  },
);

const DestinationReviewSubSchema = new Schema(
  {
    _id: {type: String, required: true},
    author: {type: String, required: true},
    hometown: {type: String, default: 'India Traveler'},
    rating: {type: Number, required: true, min: 1, max: 5},
    date: {type: String, required: true},
    comment: {type: String, required: true},
  },
  {_id: false},
);

const DestinationSchema = new Schema<DestinationDocument>(
  {
    _id: {type: String, required: true},
    slug: {type: String, required: true, unique: true, trim: true},
    name: {type: String, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    shortDescription: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    location: {
      state: {type: String, required: true, trim: true},
      district: {type: String, required: true, trim: true},
      address: {type: String, required: true, trim: true},
      pinCode: {type: String, default: '', trim: true},
      coordinates: {
        lat: {type: Number, default: 12.0},
        lng: {type: Number, default: 76.0},
      },
    },
    openingHours: {type: String, required: true, trim: true},
    entryFee: {
      indianAdult: {type: Number, default: 0},
      foreignAdult: {type: Number, default: 0},
      cameraFee: {type: Number, default: 0},
      displayLabel: {type: String, required: true, trim: true},
      notes: {type: String, default: '', trim: true},
    },
    bestSeason: {type: String, default: 'Year-round', trim: true},
    duration: {type: String, default: '2 hrs', trim: true},
    rating: {type: Number, default: 4.8, min: 0, max: 5},
    reviewCount: {type: Number, default: 0, min: 0},
    reviews: {type: [DestinationReviewSubSchema], default: []},
    image: {type: String, required: true},
    gallery: {type: [String], default: []},
    highlights: {type: [String], default: []},
    nearbyPartner: {type: String, default: '', trim: true},
  },
  {
    timestamps: true,
    collection: 'destinations',
  },
);

const BusinessReviewSubSchema = new Schema(
  {
    _id: {type: String, required: true},
    author: {type: String, required: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    date: {type: String, required: true},
    comment: {type: String, required: true},
  },
  {_id: false},
);

const BusinessSchema = new Schema<BusinessDocument>(
  {
    _id: {type: String, required: true},
    slug: {type: String, required: true, unique: true, trim: true},
    ownerId: {type: String, required: true, index: true},
    ownerName: {type: String, required: true, trim: true},
    name: {type: String, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    image: {type: String, required: true},
    shortDescription: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    location: {
      city: {type: String, required: true, trim: true},
      state: {type: String, required: true, trim: true},
      address: {type: String, required: true, trim: true},
      coordinates: {
        lat: {type: Number},
        lng: {type: Number},
      },
    },
    contact: {
      phone: {type: String, required: true, trim: true},
      email: {type: String, required: true, trim: true},
      website: {type: String, default: ''},
    },
    operatingHours: {type: String, required: true, trim: true},
    priceRange: {type: String, default: 'Contact for pricing', trim: true},
    rating: {type: Number, default: 5.0, min: 0, max: 5},
    reviewCount: {type: Number, default: 0, min: 0},
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
      index: true,
    },
    moderationNote: {type: String},
    highlights: {type: [String], default: []},
    reviews: {type: [BusinessReviewSubSchema], default: []},
  },
  {
    timestamps: true,
    collection: 'businesses',
  },
);

const ReviewSchema = new Schema<ReviewDocument>(
  {
    _id: {type: String, required: true},
    targetType: {
      type: String,
      enum: ['destination', 'business', 'portal'],
      default: 'portal',
      required: true,
      index: true,
    },
    targetId: {type: String, default: 'portal', index: true},
    targetName: {type: String, required: true, trim: true},
    category: {
      type: String,
      enum: ['Destinations', 'Stays & Dining', 'Local Businesses'],
      default: 'Destinations',
      required: true,
    },
    userId: {type: String, index: true},
    author: {type: String, required: true, trim: true},
    hometown: {type: String, default: 'Visiting Traveler', trim: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    date: {type: String, required: true},
    comment: {type: String, required: true, trim: true},
  },
  {
    timestamps: true,
    collection: 'reviews',
  },
);

const BookingSchema = new Schema<BookingDocument>(
  {
    _id: {type: String, required: true},
    userId: {type: String, index: true},
    ownerId: {type: String, index: true},
    targetType: {
      type: String,
      enum: ['business', 'stay', 'dining', 'destination_partner'],
      default: 'business',
      required: true,
    },
    targetId: {type: String},
    targetName: {type: String, required: true, trim: true},
    targetSubtitle: {type: String, default: '', trim: true},
    priceInfo: {type: String, default: '', trim: true},
    guestName: {type: String, required: true, trim: true},
    guestEmail: {type: String, required: true, lowercase: true, trim: true},
    visitDate: {type: String, required: true, trim: true},
    guestsCount: {type: String, required: true, trim: true},
    notes: {type: String, default: '', trim: true},
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'bookings',
  },
);

function getOrCreateModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) || mongoose.model<T>(name, schema);
}

export const UserModel = getOrCreateModel<UserDbDoc>('User', UserSchema);
export const CategoryModel = getOrCreateModel<CategoryDocument>('Category', CategorySchema);
export const DestinationModel = getOrCreateModel<DestinationDocument>(
  'Destination',
  DestinationSchema,
);
export const BusinessModel = getOrCreateModel<BusinessDocument>('Business', BusinessSchema);
export const ReviewModel = getOrCreateModel<ReviewDocument>('Review', ReviewSchema);
export const BookingModel = getOrCreateModel<BookingDocument>('Booking', BookingSchema);
