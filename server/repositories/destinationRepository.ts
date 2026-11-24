import crypto from 'crypto';
import {DESTINATIONS_SEED} from '../../src/data/destinationsSeed.ts';
import type {
  DestinationCategory,
  DestinationDocument,
  DestinationFilterQuery,
  DestinationReview,
} from '../../src/types/destination.ts';
import {isMongoConnected} from '../db/mongo.ts';
import {DestinationModel} from '../models/index.ts';
import {escapeRegex, sanitizeImageUrl, slugify} from '../utils/validation.ts';

const DEFAULT_DESTINATION_IMAGE =
  '/src/assets/images/hero_misty_valley_1795509326975.jpg';

const destinationStore: DestinationDocument[] = DESTINATIONS_SEED.map((doc) => ({
  ...doc,
  reviews: [...doc.reviews],
  gallery: [...doc.gallery],
  highlights: [...doc.highlights],
}));

export async function findAllDestinations(
  filter: DestinationFilterQuery = {},
): Promise<DestinationDocument[]> {
  const queryText = (filter.search ?? '').trim();
  const category = filter.category ?? 'All';
  const season = filter.season ?? 'All Seasons';

  if (isMongoConnected()) {
    const mongoQuery: Record<string, unknown> = {};
    if (category !== 'All') {
      mongoQuery.category = category;
    }
    if (season !== 'All Seasons') {
      mongoQuery.bestSeason = season;
    }
    if (queryText) {
      const regex = new RegExp(escapeRegex(queryText), 'i');
      mongoQuery.$or = [
        {name: regex},
        {category: regex},
        {shortDescription: regex},
        {'location.state': regex},
        {'location.district': regex},
        {'location.address': regex},
        {nearbyPartner: regex},
      ];
    }
    const docs = await DestinationModel.find(mongoQuery)
      .sort({createdAt: -1})
      .lean();
    return docs as unknown as DestinationDocument[];
  }

  const lower = queryText.toLowerCase();
  return destinationStore.filter((dest) => {
    const matchesCategory = category === 'All' || dest.category === category;
    const matchesSeason = season === 'All Seasons' || dest.bestSeason === season;
    const matchesSearch =
      !lower ||
      dest.name.toLowerCase().includes(lower) ||
      dest.category.toLowerCase().includes(lower) ||
      dest.shortDescription.toLowerCase().includes(lower) ||
      dest.location.state.toLowerCase().includes(lower) ||
      dest.location.district.toLowerCase().includes(lower) ||
      dest.location.address.toLowerCase().includes(lower) ||
      dest.nearbyPartner.toLowerCase().includes(lower);

    return matchesCategory && matchesSeason && matchesSearch;
  });
}

export async function findDestinationBySlugOrId(
  slugOrId: string,
): Promise<DestinationDocument | null> {
  if (isMongoConnected()) {
    const doc = await DestinationModel.findOne({
      $or: [{slug: slugOrId}, {_id: slugOrId}],
    }).lean();
    return (doc as unknown as DestinationDocument) ?? null;
  }

  const found = destinationStore.find(
    (dest) => dest.slug === slugOrId || dest._id === slugOrId,
  );
  return found ?? null;
}

export interface CreateDestinationInput {
  name: string;
  category: Exclude<DestinationCategory, 'All'>;
  shortDescription: string;
  description: string;
  state: string;
  district: string;
  address: string;
  pinCode?: string;
  lat?: number;
  lng?: number;
  openingHours: string;
  indianAdultFee?: number;
  foreignAdultFee?: number;
  entryDisplayLabel: string;
  bestSeason: string;
  duration: string;
  image?: string;
  highlights?: string[];
  nearbyPartner?: string;
}

export async function createDestination(
  input: CreateDestinationInput,
): Promise<DestinationDocument> {
  const now = new Date().toISOString();
  const safeImage = sanitizeImageUrl(input.image, DEFAULT_DESTINATION_IMAGE);
  const newDoc: DestinationDocument = {
    _id: `dest_${crypto.randomBytes(6).toString('hex')}`,
    slug: slugify(input.name),
    name: input.name.trim(),
    category: input.category,
    shortDescription: input.shortDescription.trim(),
    description: input.description.trim() || input.shortDescription.trim(),
    location: {
      state: input.state.trim(),
      district: input.district.trim(),
      address: input.address.trim(),
      pinCode: (input.pinCode ?? '').trim(),
      coordinates: {
        lat: input.lat ?? 12.2,
        lng: input.lng ?? 76.1,
      },
    },
    openingHours: input.openingHours.trim(),
    entryFee: {
      indianAdult: input.indianAdultFee ?? 0,
      foreignAdult: input.foreignAdultFee ?? 0,
      displayLabel: input.entryDisplayLabel.trim() || 'Free entry',
    },
    bestSeason: input.bestSeason.trim() || 'Year-round',
    duration: input.duration.trim() || '2–3 hrs',
    rating: 4.8,
    reviewCount: 0,
    reviews: [],
    image: safeImage,
    gallery: [safeImage],
    highlights:
      input.highlights && input.highlights.length > 0
        ? input.highlights
        : ['Community verified Indian heritage & nature landmark'],
    nearbyPartner: (input.nearbyPartner ?? '').trim() || 'Swadesh Trails Local Guides',
    createdAt: now,
    updatedAt: now,
  };

  if (isMongoConnected()) {
    const created = await DestinationModel.create(newDoc);
    return created.toObject() as unknown as DestinationDocument;
  }

  destinationStore.unshift(newDoc);
  return newDoc;
}

export async function updateDestination(
  id: string,
  updates: Partial<{
    name: string;
    category: Exclude<DestinationCategory, 'All'>;
    shortDescription: string;
    description: string;
    state: string;
    district: string;
    address: string;
    openingHours: string;
    entryDisplayLabel: string;
    bestSeason: string;
    duration: string;
    nearbyPartner: string;
  }>,
): Promise<DestinationDocument | null> {
  if (isMongoConnected()) {
    const existing = await DestinationModel.findById(id).lean();
    if (!existing) return null;

    const setPayload: Record<string, unknown> = {};
    if (updates.name?.trim()) setPayload.name = updates.name.trim();
    if (updates.category) setPayload.category = updates.category;
    if (updates.shortDescription?.trim()) {
      setPayload.shortDescription = updates.shortDescription.trim();
    }
    if (updates.description?.trim()) {
      setPayload.description = updates.description.trim();
    }
    if (updates.state?.trim()) setPayload['location.state'] = updates.state.trim();
    if (updates.district?.trim()) {
      setPayload['location.district'] = updates.district.trim();
    }
    if (updates.address?.trim()) {
      setPayload['location.address'] = updates.address.trim();
    }
    if (updates.openingHours?.trim()) {
      setPayload.openingHours = updates.openingHours.trim();
    }
    if (updates.entryDisplayLabel?.trim()) {
      setPayload['entryFee.displayLabel'] = updates.entryDisplayLabel.trim();
    }
    if (updates.bestSeason?.trim()) {
      setPayload.bestSeason = updates.bestSeason.trim();
    }
    if (updates.duration?.trim()) setPayload.duration = updates.duration.trim();
    if (updates.nearbyPartner !== undefined) {
      setPayload.nearbyPartner = updates.nearbyPartner.trim();
    }

    const updated = await DestinationModel.findByIdAndUpdate(
      id,
      {$set: setPayload},
      {new: true},
    ).lean();
    return (updated as unknown as DestinationDocument) ?? null;
  }

  const target = destinationStore.find((d) => d._id === id);
  if (!target) return null;

  if (updates.name?.trim()) target.name = updates.name.trim();
  if (updates.category) target.category = updates.category;
  if (updates.shortDescription?.trim()) {
    target.shortDescription = updates.shortDescription.trim();
  }
  if (updates.description?.trim()) target.description = updates.description.trim();
  if (updates.state?.trim()) target.location.state = updates.state.trim();
  if (updates.district?.trim()) target.location.district = updates.district.trim();
  if (updates.address?.trim()) target.location.address = updates.address.trim();
  if (updates.openingHours?.trim()) target.openingHours = updates.openingHours.trim();
  if (updates.entryDisplayLabel?.trim()) {
    target.entryFee.displayLabel = updates.entryDisplayLabel.trim();
  }
  if (updates.bestSeason?.trim()) target.bestSeason = updates.bestSeason.trim();
  if (updates.duration?.trim()) target.duration = updates.duration.trim();
  if (updates.nearbyPartner !== undefined) {
    target.nearbyPartner = updates.nearbyPartner.trim();
  }
  target.updatedAt = new Date().toISOString();
  return target;
}

export async function deleteDestination(id: string): Promise<boolean> {
  if (isMongoConnected()) {
    const deleted = await DestinationModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }
  const idx = destinationStore.findIndex((d) => d._id === id);
  if (idx === -1) return false;
  destinationStore.splice(idx, 1);
  return true;
}

export async function addDestinationReview(
  idOrSlug: string,
  payload: {author: string; hometown: string; rating: number; comment: string},
): Promise<DestinationDocument | null> {
  const newReview: DestinationReview = {
    _id: `drev_${Date.now()}`,
    author: payload.author.trim(),
    hometown: payload.hometown.trim() || 'India Traveler',
    rating: Math.max(1, Math.min(5, Math.round(payload.rating))),
    date: 'November 2026',
    comment: payload.comment.trim(),
  };

  if (isMongoConnected()) {
    const target = await DestinationModel.findOne({
      $or: [{_id: idOrSlug}, {slug: idOrSlug}],
    });
    if (!target) return null;

    const prevTotal = target.rating * target.reviewCount;
    const nextCount = target.reviewCount + 1;
    const nextRating = Number(((prevTotal + newReview.rating) / nextCount).toFixed(1));

    target.reviews = [newReview, ...target.reviews];
    target.reviewCount = nextCount;
    target.rating = nextRating;
    await target.save();
    return target.toObject() as unknown as DestinationDocument;
  }

  const target = destinationStore.find(
    (dest) => dest._id === idOrSlug || dest.slug === idOrSlug,
  );
  if (!target) return null;

  target.reviews = [newReview, ...target.reviews];
  const prevTotal = target.rating * target.reviewCount;
  target.reviewCount += 1;
  target.rating = Number(((prevTotal + newReview.rating) / target.reviewCount).toFixed(1));
  target.updatedAt = new Date().toISOString();

  return target;
}
