import crypto from 'crypto';
import type {UserRole} from '../../src/types/business.ts';
import type {
  PortalReviewCategory,
  ReviewDocument,
  ReviewTargetType,
} from '../../src/types/portal.ts';
import {INITIAL_PORTAL_REVIEWS_SEED, isMongoConnected} from '../db/mongo.ts';
import {ReviewModel} from '../models/index.ts';

const reviewStore: ReviewDocument[] = INITIAL_PORTAL_REVIEWS_SEED.map((r) => ({
  ...r,
}));

export interface ReviewFilterQuery {
  targetType?: ReviewTargetType;
  targetId?: string;
  category?: PortalReviewCategory;
}

export async function findReviews(
  filter: ReviewFilterQuery = {},
): Promise<ReviewDocument[]> {
  if (isMongoConnected()) {
    const query: Record<string, string> = {};
    if (filter.targetType) query.targetType = filter.targetType;
    if (filter.targetId) query.targetId = filter.targetId;
    if (filter.category) query.category = filter.category;

    const docs = await ReviewModel.find(query).sort({createdAt: -1}).lean();
    return docs as unknown as ReviewDocument[];
  }

  return reviewStore.filter((r) => {
    if (filter.targetType && r.targetType !== filter.targetType) return false;
    if (filter.targetId && r.targetId !== filter.targetId) return false;
    if (filter.category && r.category !== filter.category) return false;
    return true;
  });
}

export async function createReview(input: {
  targetType?: ReviewTargetType;
  targetId?: string;
  targetName: string;
  category: PortalReviewCategory;
  userId?: string;
  author: string;
  hometown?: string;
  rating: number;
  comment: string;
}): Promise<ReviewDocument> {
  const now = new Date().toISOString();
  const doc: ReviewDocument = {
    _id: `rev_${crypto.randomBytes(6).toString('hex')}`,
    targetType: input.targetType ?? 'portal',
    targetId: input.targetId ?? 'portal',
    targetName: input.targetName.trim(),
    category: input.category,
    userId: input.userId,
    author: input.author.trim(),
    hometown: (input.hometown ?? '').trim() || 'Visiting Traveler',
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    date: 'November 2026',
    comment: input.comment.trim(),
    createdAt: now,
    updatedAt: now,
  };

  if (isMongoConnected()) {
    const created = await ReviewModel.create(doc);
    return created.toObject() as unknown as ReviewDocument;
  }

  reviewStore.unshift(doc);
  return doc;
}

export async function updateReview(
  id: string,
  requester: {id: string; role: UserRole},
  updates: {rating?: number; comment?: string; targetName?: string},
): Promise<ReviewDocument | null> {
  if (isMongoConnected()) {
    const existing = await ReviewModel.findById(id).lean();
    if (!existing) return null;
    if (requester.role !== 'admin' && existing.userId !== requester.id) {
      throw new Error('FORBIDDEN');
    }

    const setPayload: Record<string, string | number> = {};
    if (typeof updates.rating === 'number') {
      setPayload.rating = Math.max(1, Math.min(5, Math.round(updates.rating)));
    }
    if (updates.comment?.trim()) setPayload.comment = updates.comment.trim();
    if (updates.targetName?.trim()) {
      setPayload.targetName = updates.targetName.trim();
    }

    const updated = await ReviewModel.findByIdAndUpdate(
      id,
      {$set: setPayload},
      {new: true},
    ).lean();
    return (updated as unknown as ReviewDocument) ?? null;
  }

  const target = reviewStore.find((r) => r._id === id);
  if (!target) return null;
  if (requester.role !== 'admin' && target.userId !== requester.id) {
    throw new Error('FORBIDDEN');
  }

  if (typeof updates.rating === 'number') {
    target.rating = Math.max(1, Math.min(5, Math.round(updates.rating)));
  }
  if (updates.comment?.trim()) target.comment = updates.comment.trim();
  if (updates.targetName?.trim()) target.targetName = updates.targetName.trim();
  target.updatedAt = new Date().toISOString();
  return target;
}

export async function deleteReview(
  id: string,
  requester: {id: string; role: UserRole},
): Promise<boolean> {
  if (isMongoConnected()) {
    const existing = await ReviewModel.findById(id).lean();
    if (!existing) return false;
    if (requester.role !== 'admin' && existing.userId !== requester.id) {
      throw new Error('FORBIDDEN');
    }
    await ReviewModel.findByIdAndDelete(id);
    return true;
  }

  const idx = reviewStore.findIndex((r) => r._id === id);
  if (idx === -1) return false;
  const target = reviewStore[idx];
  if (requester.role !== 'admin' && target.userId !== requester.id) {
    throw new Error('FORBIDDEN');
  }
  reviewStore.splice(idx, 1);
  return true;
}
