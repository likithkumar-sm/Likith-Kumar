import crypto from 'crypto';
import type {CategoryDocument, CategoryScope} from '../../src/types/portal.ts';
import {DEFAULT_CATEGORIES_SEED, isMongoConnected} from '../db/mongo.ts';
import {CategoryModel} from '../models/index.ts';
import {slugify} from '../utils/validation.ts';

const categoryStore: CategoryDocument[] = DEFAULT_CATEGORIES_SEED.map((c) => ({
  ...c,
}));

export async function findCategories(
  scope?: CategoryScope,
): Promise<CategoryDocument[]> {
  if (isMongoConnected()) {
    const filter = scope ? {scope} : {};
    const docs = await CategoryModel.find(filter)
      .sort({scope: 1, displayOrder: 1, name: 1})
      .lean();
    return docs as unknown as CategoryDocument[];
  }

  return categoryStore
    .filter((c) => !scope || c.scope === scope)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
}

export async function createCategory(input: {
  name: string;
  scope: CategoryScope;
  description?: string;
  displayOrder?: number;
}): Promise<CategoryDocument> {
  const name = input.name.trim();
  const slug = slugify(`${input.scope}-${name}`, false);
  const now = new Date().toISOString();

  if (isMongoConnected()) {
    const existing = await CategoryModel.findOne({slug}).lean();
    if (existing) {
      throw new Error('A category with this name already exists.');
    }
    const created = await CategoryModel.create({
      _id: `cat_${crypto.randomBytes(6).toString('hex')}`,
      name,
      slug,
      scope: input.scope,
      description: (input.description ?? '').trim(),
      displayOrder: input.displayOrder ?? 10,
    });
    return created.toObject() as unknown as CategoryDocument;
  }

  if (categoryStore.some((c) => c.slug === slug)) {
    throw new Error('A category with this name already exists.');
  }
  const doc: CategoryDocument = {
    _id: `cat_${crypto.randomBytes(6).toString('hex')}`,
    name,
    slug,
    scope: input.scope,
    description: (input.description ?? '').trim(),
    displayOrder: input.displayOrder ?? 10,
    createdAt: now,
    updatedAt: now,
  };
  categoryStore.push(doc);
  return doc;
}

export async function updateCategory(
  id: string,
  updates: {name?: string; description?: string; displayOrder?: number},
): Promise<CategoryDocument | null> {
  if (isMongoConnected()) {
    const setPayload: Record<string, string | number> = {};
    if (updates.name?.trim()) setPayload.name = updates.name.trim();
    if (updates.description !== undefined) {
      setPayload.description = updates.description.trim();
    }
    if (typeof updates.displayOrder === 'number') {
      setPayload.displayOrder = updates.displayOrder;
    }
    const doc = await CategoryModel.findByIdAndUpdate(
      id,
      {$set: setPayload},
      {new: true},
    ).lean();
    return (doc as unknown as CategoryDocument) ?? null;
  }

  const target = categoryStore.find((c) => c._id === id);
  if (!target) return null;
  if (updates.name?.trim()) target.name = updates.name.trim();
  if (updates.description !== undefined) {
    target.description = updates.description.trim();
  }
  if (typeof updates.displayOrder === 'number') {
    target.displayOrder = updates.displayOrder;
  }
  target.updatedAt = new Date().toISOString();
  return target;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isMongoConnected()) {
    const deleted = await CategoryModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }
  const idx = categoryStore.findIndex((c) => c._id === id);
  if (idx === -1) return false;
  categoryStore.splice(idx, 1);
  return true;
}
