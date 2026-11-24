import mongoose from 'mongoose';
import {BUSINESSES_SEED} from '../../src/data/businessesSeed.ts';
import {DESTINATIONS_SEED} from '../../src/data/destinationsSeed.ts';
import {INITIAL_REVIEWS} from '../../src/data/portalData.ts';
import type {CategoryDocument, ReviewDocument} from '../../src/types/portal.ts';
import {
  BusinessModel,
  CategoryModel,
  DestinationModel,
  ReviewModel,
} from '../models/index.ts';

export const DEFAULT_CATEGORIES_SEED: CategoryDocument[] = [
  {
    _id: 'cat_dest_waterfalls',
    name: 'Waterfalls',
    slug: 'dest-waterfalls',
    scope: 'destination',
    description: 'Forest cascades, river gorges, and monsoon-fed natural pools.',
    displayOrder: 1,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_dest_heritage',
    name: 'Heritage',
    slug: 'dest-heritage',
    scope: 'destination',
    description: 'Hill forts, temple towns, mansions, and cultural quarters.',
    displayOrder: 2,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_dest_viewpoints',
    name: 'Viewpoints',
    slug: 'dest-viewpoints',
    scope: 'destination',
    description: 'Canyon rims, cloud ridges, and plantation overlooks.',
    displayOrder: 3,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_dest_trails',
    name: 'Trails',
    slug: 'dest-trails',
    scope: 'destination',
    description: 'Guided shola walks, forest corridors, and ridge treks.',
    displayOrder: 4,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_hotels',
    name: 'Hotels',
    slug: 'biz-hotels',
    scope: 'business',
    description: 'Eco-resorts, heritage havelis, and verified regional hotels.',
    displayOrder: 1,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_restaurants',
    name: 'Restaurants',
    slug: 'biz-restaurants',
    scope: 'business',
    description: 'Regional kitchens, farm-to-table eateries, and estate cafés.',
    displayOrder: 2,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_homestays',
    name: 'Homestays',
    slug: 'biz-homestays',
    scope: 'business',
    description: 'Family-hosted courtyard homes and plantation cottages.',
    displayOrder: 3,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_travel_agencies',
    name: 'Travel agencies',
    slug: 'biz-travel-agencies',
    scope: 'business',
    description: 'Licensed regional tour planners and circuit coordinators.',
    displayOrder: 4,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_taxi_services',
    name: 'Taxi services',
    slug: 'biz-taxi-services',
    scope: 'business',
    description: 'Hill-certified cabs, station transfers, and sightseeing fleets.',
    displayOrder: 5,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_local_handicrafts',
    name: 'Local handicrafts',
    slug: 'biz-local-handicrafts',
    scope: 'business',
    description: 'Artisan cooperatives, handlooms, spice collectives, and pottery.',
    displayOrder: 6,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    _id: 'cat_biz_tour_guides',
    name: 'Tour guides',
    slug: 'biz-tour-guides',
    scope: 'business',
    description: 'Ministry-licensed heritage historians and wildlife naturalists.',
    displayOrder: 7,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
];

export const INITIAL_PORTAL_REVIEWS_SEED: ReviewDocument[] = INITIAL_REVIEWS.map(
  (r) => ({
    _id: r.id,
    targetType: 'portal',
    targetId: 'portal',
    targetName: r.placeName,
    category: r.category,
    author: r.author,
    hometown: r.hometown,
    rating: r.rating,
    date: r.date,
    comment: r.comment,
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-10T09:00:00.000Z',
  }),
);

let mongoConnected = false;

export function isMongoConnected(): boolean {
  return mongoConnected && mongoose.connection.readyState === 1;
}

async function seedMongoIfEmpty(): Promise<void> {
  const [catCount, destCount, bizCount, revCount] = await Promise.all([
    CategoryModel.countDocuments(),
    DestinationModel.countDocuments(),
    BusinessModel.countDocuments(),
    ReviewModel.countDocuments(),
  ]);

  if (catCount === 0) {
    await CategoryModel.insertMany(DEFAULT_CATEGORIES_SEED);
  }
  if (destCount === 0) {
    await DestinationModel.insertMany(DESTINATIONS_SEED);
  }
  if (bizCount === 0) {
    await BusinessModel.insertMany(BUSINESSES_SEED);
  }
  if (revCount === 0) {
    await ReviewModel.insertMany(INITIAL_PORTAL_REVIEWS_SEED);
  }
}

export async function connectToDatabase(): Promise<boolean> {
  const uri = (process.env.MONGODB_URI ?? '').trim();
  if (!uri) {
    mongoConnected = false;
    console.log(
      'MONGODB_URI is not configured — using in-memory repository fallback.',
    );
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    mongoConnected = true;
    await seedMongoIfEmpty();
    console.log('Connected to MongoDB and verified initial collection seeds.');
    return true;
  } catch (error: unknown) {
    mongoConnected = false;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `MongoDB connection unavailable (${message}) — using in-memory repository fallback.`,
    );
    return false;
  }
}
