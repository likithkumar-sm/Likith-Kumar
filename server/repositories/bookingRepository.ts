import crypto from 'crypto';
import type {UserRole} from '../../src/types/business.ts';
import type {
  BookingDocument,
  BookingStatus,
  BookingTargetType,
} from '../../src/types/portal.ts';
import {isMongoConnected} from '../db/mongo.ts';
import {BookingModel} from '../models/index.ts';
import {findBusinessBySlugOrId} from './businessRepository.ts';

const bookingStore: BookingDocument[] = [];

export interface CreateBookingInput {
  userId?: string;
  targetType: BookingTargetType;
  targetId?: string;
  targetName: string;
  targetSubtitle?: string;
  priceInfo?: string;
  guestName: string;
  guestEmail: string;
  visitDate: string;
  guestsCount: string;
  notes?: string;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingDocument> {
  let ownerId: string | undefined;

  if (input.targetType === 'business' && input.targetId) {
    const biz = await findBusinessBySlugOrId(input.targetId);
    if (biz?.ownerId) {
      ownerId = biz.ownerId;
    }
  }

  const now = new Date().toISOString();
  const doc: BookingDocument = {
    _id: `bkg_${crypto.randomBytes(6).toString('hex')}`,
    userId: input.userId,
    ownerId,
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: input.targetName.trim(),
    targetSubtitle: (input.targetSubtitle ?? '').trim(),
    priceInfo: (input.priceInfo ?? '').trim(),
    guestName: input.guestName.trim(),
    guestEmail: input.guestEmail.trim().toLowerCase(),
    visitDate: input.visitDate.trim(),
    guestsCount: input.guestsCount.trim(),
    notes: (input.notes ?? '').trim(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  if (isMongoConnected()) {
    const created = await BookingModel.create(doc);
    return created.toObject() as unknown as BookingDocument;
  }

  bookingStore.unshift(doc);
  return doc;
}

export async function findBookingsForRequester(requester: {
  id: string;
  role: UserRole;
}): Promise<BookingDocument[]> {
  if (isMongoConnected()) {
    let query: Record<string, unknown> = {};
    if (requester.role === 'tourist') {
      query = {userId: requester.id};
    } else if (requester.role === 'business_owner') {
      query = {$or: [{ownerId: requester.id}, {userId: requester.id}]};
    }
    const docs = await BookingModel.find(query).sort({createdAt: -1}).lean();
    return docs as unknown as BookingDocument[];
  }

  if (requester.role === 'admin') {
    return [...bookingStore];
  }
  if (requester.role === 'business_owner') {
    return bookingStore.filter(
      (b) => b.ownerId === requester.id || b.userId === requester.id,
    );
  }
  return bookingStore.filter((b) => b.userId === requester.id);
}

export async function updateBooking(
  id: string,
  requester: {id: string; role: UserRole},
  updates: {
    status?: BookingStatus;
    visitDate?: string;
    guestsCount?: string;
    notes?: string;
  },
): Promise<BookingDocument | null> {
  if (isMongoConnected()) {
    const existing = await BookingModel.findById(id).lean();
    if (!existing) return null;

    const isAdmin = requester.role === 'admin';
    const isOwner = existing.ownerId === requester.id;
    const isTraveler = existing.userId === requester.id;

    if (!isAdmin && !isOwner && !isTraveler) {
      throw new Error('FORBIDDEN');
    }

    const setPayload: Record<string, string> = {};
    if (updates.status) {
      // Travelers may cancel their own booking; only admins/business owners can confirm
      if (updates.status === 'confirmed' && !isAdmin && !isOwner) {
        throw new Error('FORBIDDEN');
      }
      setPayload.status = updates.status;
    }
    if (updates.visitDate?.trim() && (isAdmin || isTraveler)) {
      setPayload.visitDate = updates.visitDate.trim();
    }
    if (updates.guestsCount?.trim() && (isAdmin || isTraveler)) {
      setPayload.guestsCount = updates.guestsCount.trim();
    }
    if (updates.notes !== undefined && (isAdmin || isTraveler)) {
      setPayload.notes = updates.notes.trim();
    }

    const updated = await BookingModel.findByIdAndUpdate(
      id,
      {$set: setPayload},
      {new: true},
    ).lean();
    return (updated as unknown as BookingDocument) ?? null;
  }

  const target = bookingStore.find((b) => b._id === id);
  if (!target) return null;

  const isAdmin = requester.role === 'admin';
  const isOwner = target.ownerId === requester.id;
  const isTraveler = target.userId === requester.id;

  if (!isAdmin && !isOwner && !isTraveler) {
    throw new Error('FORBIDDEN');
  }

  if (updates.status) {
    if (updates.status === 'confirmed' && !isAdmin && !isOwner) {
      throw new Error('FORBIDDEN');
    }
    target.status = updates.status;
  }
  if (updates.visitDate?.trim() && (isAdmin || isTraveler)) {
    target.visitDate = updates.visitDate.trim();
  }
  if (updates.guestsCount?.trim() && (isAdmin || isTraveler)) {
    target.guestsCount = updates.guestsCount.trim();
  }
  if (updates.notes !== undefined && (isAdmin || isTraveler)) {
    target.notes = updates.notes.trim();
  }
  target.updatedAt = new Date().toISOString();
  return target;
}

export async function deleteBooking(
  id: string,
  requester: {id: string; role: UserRole},
): Promise<boolean> {
  if (isMongoConnected()) {
    const existing = await BookingModel.findById(id).lean();
    if (!existing) return false;
    if (
      requester.role !== 'admin' &&
      existing.userId !== requester.id &&
      existing.ownerId !== requester.id
    ) {
      throw new Error('FORBIDDEN');
    }
    await BookingModel.findByIdAndDelete(id);
    return true;
  }

  const idx = bookingStore.findIndex((b) => b._id === id);
  if (idx === -1) return false;
  const target = bookingStore[idx];
  if (
    requester.role !== 'admin' &&
    target.userId !== requester.id &&
    target.ownerId !== requester.id
  ) {
    throw new Error('FORBIDDEN');
  }
  bookingStore.splice(idx, 1);
  return true;
}
