import crypto from 'crypto';
import {
  BUSINESS_CATEGORY_DEFAULT_IMAGES,
  BUSINESSES_SEED,
} from '../../src/data/businessesSeed.ts';
import type {
  BusinessApprovalStatus,
  BusinessCategoryValue,
  BusinessDocument,
  BusinessFilterQuery,
  BusinessReview,
  UserRole,
} from '../../src/types/business.ts';
import {isMongoConnected} from '../db/mongo.ts';
import {BusinessModel} from '../models/index.ts';
import {escapeRegex, sanitizeImageUrl, slugify} from '../utils/validation.ts';

const businessStore: BusinessDocument[] = BUSINESSES_SEED.map((b) => ({
  ...b,
  highlights: [...b.highlights],
  reviews: [...b.reviews],
}));

export async function findApprovedBusinesses(
  filter: BusinessFilterQuery = {},
): Promise<BusinessDocument[]> {
  const q = (filter.search ?? '').trim();
  const category = filter.category ?? 'All';
  const stateFilter = (filter.state ?? '').trim();

  if (isMongoConnected()) {
    const mongoQuery: Record<string, unknown> = {status: 'approved'};
    if (category !== 'All') {
      mongoQuery.category = category;
    }
    if (stateFilter && stateFilter.toLowerCase() !== 'all') {
      mongoQuery['location.state'] = new RegExp(escapeRegex(stateFilter), 'i');
    }
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      mongoQuery.$or = [
        {name: regex},
        {category: regex},
        {shortDescription: regex},
        {'location.city': regex},
        {'location.state': regex},
        {'location.address': regex},
      ];
    }
    const docs = await BusinessModel.find(mongoQuery)
      .sort({createdAt: -1})
      .lean();
    return docs as unknown as BusinessDocument[];
  }

  const lowerQ = q.toLowerCase();
  const lowerState = stateFilter.toLowerCase();
  return businessStore.filter((biz) => {
    if (biz.status !== 'approved') return false;
    const matchesCategory = category === 'All' || biz.category === category;
    const matchesState =
      !lowerState ||
      lowerState === 'all' ||
      biz.location.state.toLowerCase().includes(lowerState);
    const matchesSearch =
      !lowerQ ||
      biz.name.toLowerCase().includes(lowerQ) ||
      biz.category.toLowerCase().includes(lowerQ) ||
      biz.shortDescription.toLowerCase().includes(lowerQ) ||
      biz.location.city.toLowerCase().includes(lowerQ) ||
      biz.location.state.toLowerCase().includes(lowerQ) ||
      biz.location.address.toLowerCase().includes(lowerQ);
    return matchesCategory && matchesState && matchesSearch;
  });
}

export async function findBusinessBySlugOrId(
  slugOrId: string,
  requester?: {id: string; role: UserRole},
): Promise<BusinessDocument | null> {
  let found: BusinessDocument | null = null;
  if (isMongoConnected()) {
    const doc = await BusinessModel.findOne({
      $or: [{slug: slugOrId}, {_id: slugOrId}],
    }).lean();
    found = (doc as unknown as BusinessDocument) ?? null;
  } else {
    found =
      businessStore.find((b) => b.slug === slugOrId || b._id === slugOrId) ?? null;
  }

  if (!found) return null;
  if (found.status === 'approved') return found;
  if (requester && (requester.role === 'admin' || requester.id === found.ownerId)) {
    return found;
  }
  return null;
}

export async function findBusinessesByOwner(
  ownerId: string,
): Promise<BusinessDocument[]> {
  if (isMongoConnected()) {
    const docs = await BusinessModel.find({ownerId}).sort({createdAt: -1}).lean();
    return docs as unknown as BusinessDocument[];
  }
  return businessStore.filter((b) => b.ownerId === ownerId);
}

export async function findAllBusinessesForAdmin(): Promise<BusinessDocument[]> {
  let all: BusinessDocument[];
  if (isMongoConnected()) {
    const docs = await BusinessModel.find().sort({createdAt: -1}).lean();
    all = docs as unknown as BusinessDocument[];
  } else {
    all = [...businessStore];
  }

  return all.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export interface CreateBusinessInput {
  ownerId: string;
  ownerName: string;
  name: string;
  category: BusinessCategoryValue;
  image?: string;
  shortDescription: string;
  description: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  priceRange: string;
  highlights?: string[];
  initialStatus?: BusinessApprovalStatus;
}

export async function createBusinessListing(
  input: CreateBusinessInput,
): Promise<BusinessDocument> {
  const now = new Date().toISOString();
  const doc: BusinessDocument = {
    _id: `biz_${crypto.randomBytes(6).toString('hex')}`,
    slug: slugify(input.name),
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    name: input.name.trim(),
    category: input.category,
    image: sanitizeImageUrl(
      input.image,
      BUSINESS_CATEGORY_DEFAULT_IMAGES[input.category],
    ),
    shortDescription: input.shortDescription.trim(),
    description: input.description.trim() || input.shortDescription.trim(),
    location: {
      city: input.city.trim(),
      state: input.state.trim(),
      address: input.address.trim(),
    },
    contact: {
      phone: input.phone.trim(),
      email: input.email.trim(),
    },
    operatingHours: input.operatingHours.trim(),
    priceRange: input.priceRange.trim() || 'Contact for pricing',
    rating: 5.0,
    reviewCount: 0,
    status: input.initialStatus ?? 'pending',
    highlights:
      input.highlights && input.highlights.length > 0
        ? input.highlights
        : ['Community directory member', 'Direct local inquiry'],
    reviews: [],
    createdAt: now,
    updatedAt: now,
  };

  if (isMongoConnected()) {
    const created = await BusinessModel.create(doc);
    return created.toObject() as unknown as BusinessDocument;
  }

  businessStore.unshift(doc);
  return doc;
}

export async function updateBusinessListing(
  id: string,
  requester: {id: string; role: UserRole},
  updates: Partial<{
    name: string;
    category: BusinessCategoryValue;
    shortDescription: string;
    description: string;
    city: string;
    state: string;
    address: string;
    phone: string;
    email: string;
    operatingHours: string;
    priceRange: string;
  }>,
): Promise<BusinessDocument | null> {
  if (isMongoConnected()) {
    const existing = await BusinessModel.findById(id).lean();
    if (!existing) return null;
    if (requester.role !== 'admin' && existing.ownerId !== requester.id) {
      throw new Error('FORBIDDEN');
    }

    const setPayload: Record<string, string> = {};
    if (updates.name?.trim()) setPayload.name = updates.name.trim();
    if (updates.category) setPayload.category = updates.category;
    if (updates.shortDescription?.trim()) {
      setPayload.shortDescription = updates.shortDescription.trim();
    }
    if (updates.description?.trim()) {
      setPayload.description = updates.description.trim();
    }
    if (updates.city?.trim()) setPayload['location.city'] = updates.city.trim();
    if (updates.state?.trim()) setPayload['location.state'] = updates.state.trim();
    if (updates.address?.trim()) {
      setPayload['location.address'] = updates.address.trim();
    }
    if (updates.phone?.trim()) setPayload['contact.phone'] = updates.phone.trim();
    if (updates.email?.trim()) setPayload['contact.email'] = updates.email.trim();
    if (updates.operatingHours?.trim()) {
      setPayload.operatingHours = updates.operatingHours.trim();
    }
    if (updates.priceRange?.trim()) {
      setPayload.priceRange = updates.priceRange.trim();
    }

    const updated = await BusinessModel.findByIdAndUpdate(
      id,
      {$set: setPayload},
      {new: true},
    ).lean();
    return (updated as unknown as BusinessDocument) ?? null;
  }

  const target = businessStore.find((b) => b._id === id);
  if (!target) return null;

  if (requester.role !== 'admin' && target.ownerId !== requester.id) {
    throw new Error('FORBIDDEN');
  }

  if (updates.name?.trim()) target.name = updates.name.trim();
  if (updates.category) target.category = updates.category;
  if (updates.shortDescription?.trim()) {
    target.shortDescription = updates.shortDescription.trim();
  }
  if (updates.description?.trim()) target.description = updates.description.trim();
  if (updates.city?.trim()) target.location.city = updates.city.trim();
  if (updates.state?.trim()) target.location.state = updates.state.trim();
  if (updates.address?.trim()) target.location.address = updates.address.trim();
  if (updates.phone?.trim()) target.contact.phone = updates.phone.trim();
  if (updates.email?.trim()) target.contact.email = updates.email.trim();
  if (updates.operatingHours?.trim()) {
    target.operatingHours = updates.operatingHours.trim();
  }
  if (updates.priceRange?.trim()) target.priceRange = updates.priceRange.trim();

  target.updatedAt = new Date().toISOString();
  return target;
}

export async function deleteBusinessListing(
  id: string,
  requester: {id: string; role: UserRole},
): Promise<boolean> {
  if (isMongoConnected()) {
    const existing = await BusinessModel.findById(id).lean();
    if (!existing) return false;
    if (requester.role !== 'admin' && existing.ownerId !== requester.id) {
      throw new Error('FORBIDDEN');
    }
    await BusinessModel.findByIdAndDelete(id);
    return true;
  }

  const idx = businessStore.findIndex((b) => b._id === id);
  if (idx === -1) return false;
  const target = businessStore[idx];
  if (requester.role !== 'admin' && target.ownerId !== requester.id) {
    throw new Error('FORBIDDEN');
  }
  businessStore.splice(idx, 1);
  return true;
}

export async function moderateBusinessStatus(
  id: string,
  status: BusinessApprovalStatus,
  moderationNote?: string,
): Promise<BusinessDocument | null> {
  if (isMongoConnected()) {
    const updated = await BusinessModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          moderationNote: moderationNote?.trim() || undefined,
        },
      },
      {new: true},
    ).lean();
    return (updated as unknown as BusinessDocument) ?? null;
  }

  const target = businessStore.find((b) => b._id === id);
  if (!target) return null;
  target.status = status;
  target.moderationNote = moderationNote?.trim() || undefined;
  target.updatedAt = new Date().toISOString();
  return target;
}

export async function addBusinessReview(
  idOrSlug: string,
  payload: {author: string; rating: number; comment: string},
): Promise<BusinessDocument | null> {
  const newReview: BusinessReview = {
    _id: `brev_${Date.now()}`,
    author: payload.author.trim(),
    rating: Math.max(1, Math.min(5, Math.round(payload.rating))),
    date: 'November 2026',
    comment: payload.comment.trim(),
  };

  if (isMongoConnected()) {
    const target = await BusinessModel.findOne({
      $or: [{_id: idOrSlug}, {slug: idOrSlug}],
      status: 'approved',
    });
    if (!target) return null;

    const prevTotal = target.rating * target.reviewCount;
    const nextCount = target.reviewCount + 1;
    const nextRating = Number(((prevTotal + newReview.rating) / nextCount).toFixed(1));

    target.reviews = [newReview, ...target.reviews];
    target.reviewCount = nextCount;
    target.rating = nextRating;
    await target.save();
    return target.toObject() as unknown as BusinessDocument;
  }

  const target = businessStore.find(
    (b) => (b._id === idOrSlug || b.slug === idOrSlug) && b.status === 'approved',
  );
  if (!target) return null;

  target.reviews = [newReview, ...target.reviews];
  const prevTotal = target.rating * target.reviewCount;
  target.reviewCount += 1;
  target.rating = Number(((prevTotal + newReview.rating) / target.reviewCount).toFixed(1));
  target.updatedAt = new Date().toISOString();

  return target;
}
