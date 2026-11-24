import crypto from 'crypto';
import type {NextFunction, Request, Response} from 'express';
import type {UserProfile, UserRole} from '../../src/types/business.ts';
import {isMongoConnected} from '../db/mongo.ts';
import {UserModel, type UserDbDoc} from '../models/index.ts';

interface StoredUser extends UserProfile {
  passwordSalt: string;
  passwordHash: string;
}

interface ResetRequestRecord {
  email: string;
  requestedAt: string;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const usersStore: StoredUser[] = [];
const revokedTokenIds = new Set<string>();
const resetRequests: ResetRequestRecord[] = [];

function hashPassword(password: string, salt?: string): {salt: string; hash: string} {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return {salt: actualSalt, hash: derived};
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const {hash} = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function dbDocToStoredUser(doc: UserDbDoc): StoredUser {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    city: doc.city,
    phone: doc.phone,
    passwordSalt: doc.passwordSalt,
    passwordHash: doc.passwordHash,
    createdAt:
      typeof doc.createdAt === 'string'
        ? doc.createdAt
        : new Date(doc.createdAt).toISOString(),
  };
}

function toPublicUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    city: user.city,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

interface TokenPayload {
  sub: string;
  role: UserRole;
  jti: string;
  exp: number;
}

function signToken(user: StoredUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    jti: crypto.randomBytes(12).toString('hex'),
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as TokenPayload;
    if (!payload.sub || !payload.jti || payload.exp < Date.now()) return null;
    if (revokedTokenIds.has(payload.jti)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function findStoredUserById(id: string): Promise<StoredUser | null> {
  if (isMongoConnected()) {
    const doc = await UserModel.findById(id).lean();
    return doc ? dbDocToStoredUser(doc as unknown as UserDbDoc) : null;
  }
  return usersStore.find((u) => u.id === id) ?? null;
}

async function findStoredUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  if (isMongoConnected()) {
    const doc = await UserModel.findOne({email: normalized}).lean();
    return doc ? dbDocToStoredUser(doc as unknown as UserDbDoc) : null;
  }
  return usersStore.find((u) => u.email === normalized) ?? null;
}

export interface AuthenticatedRequest extends Request {
  authUser?: StoredUser;
  authTokenId?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({error: 'Authentication required. Please sign in.'});
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({error: 'Session expired or invalid. Please sign in again.'});
    return;
  }

  const user = await findStoredUserById(payload.sub);
  if (!user) {
    res.status(401).json({error: 'User account not found.'});
    return;
  }

  req.authUser = user;
  req.authTokenId = payload.jti;
  next();
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    const payload = verifyToken(token);
    if (payload) {
      const user = await findStoredUserById(payload.sub);
      if (user) {
        req.authUser = user;
        req.authTokenId = payload.jti;
      }
    }
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      res.status(401).json({error: 'Authentication required.'});
      return;
    }
    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({
        error: 'You do not have permission to perform this action for your account role.',
      });
      return;
    }
    next();
  };
}

export async function isAdminClaimed(): Promise<boolean> {
  if (isMongoConnected()) {
    const count = await UserModel.countDocuments({role: 'admin'});
    return count > 0;
  }
  return usersStore.some((u) => u.role === 'admin');
}

export function isAdminPasscodeConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: 'tourist' | 'business_owner';
  city?: string;
  phone?: string;
}): Promise<{user: UserProfile; token: string}> {
  const email = input.email.trim().toLowerCase();
  const existing = await findStoredUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const {salt, hash} = hashPassword(input.password);
  const id = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const newUser: StoredUser = {
    id,
    name: input.name.trim(),
    email,
    role: input.role,
    city: (input.city ?? '').trim() || 'India',
    phone: (input.phone ?? '').trim(),
    passwordSalt: salt,
    passwordHash: hash,
    createdAt,
  };

  if (isMongoConnected()) {
    await UserModel.create({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      city: newUser.city,
      phone: newUser.phone,
      passwordSalt: newUser.passwordSalt,
      passwordHash: newUser.passwordHash,
    });
  } else {
    usersStore.push(newUser);
  }

  const token = signToken(newUser);
  return {user: toPublicUser(newUser), token};
}

export async function claimFirstAdmin(input: {
  name: string;
  email: string;
  password: string;
  passcode?: string;
}): Promise<{user: UserProfile; token: string}> {
  const envPasscode = (process.env.ADMIN_PASSCODE ?? '').trim();

  if (envPasscode) {
    if (!input.passcode || input.passcode !== envPasscode) {
      throw new Error('Invalid Administrator passcode.');
    }
  } else if (await isAdminClaimed()) {
    throw new Error(
      'An Administrator account has already been claimed. Please sign in with your administrator credentials.',
    );
  }

  const email = input.email.trim().toLowerCase();
  const existing = await findStoredUserByEmail(email);
  if (existing) {
    throw new Error('This email is already registered under another account.');
  }

  const {salt, hash} = hashPassword(input.password);
  const adminUser: StoredUser = {
    id: `adm_${crypto.randomBytes(8).toString('hex')}`,
    name: input.name.trim(),
    email,
    role: 'admin',
    city: 'Portal Administration',
    phone: '',
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  if (isMongoConnected()) {
    await UserModel.create({
      _id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: 'admin',
      city: adminUser.city,
      phone: adminUser.phone,
      passwordSalt: adminUser.passwordSalt,
      passwordHash: adminUser.passwordHash,
    });
  } else {
    usersStore.push(adminUser);
  }

  const token = signToken(adminUser);
  return {user: toPublicUser(adminUser), token};
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<{user: UserProfile; token: string}> {
  const user = await findStoredUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) {
    throw new Error('Invalid email address or password.');
  }
  const token = signToken(user);
  return {user: toPublicUser(user), token};
}

export function logoutToken(tokenId?: string): void {
  if (tokenId) {
    revokedTokenIds.add(tokenId);
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {name?: string; city?: string; phone?: string},
): Promise<UserProfile> {
  if (isMongoConnected()) {
    const updatePayload: Record<string, string> = {};
    if (updates.name && updates.name.trim()) updatePayload.name = updates.name.trim();
    if (updates.city !== undefined) updatePayload.city = updates.city.trim();
    if (updates.phone !== undefined) updatePayload.phone = updates.phone.trim();

    const doc = await UserModel.findByIdAndUpdate(
      userId,
      {$set: updatePayload},
      {new: true},
    ).lean();
    if (!doc) throw new Error('User not found.');
    return toPublicUser(dbDocToStoredUser(doc as unknown as UserDbDoc));
  }

  const user = usersStore.find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');
  if (updates.name && updates.name.trim()) user.name = updates.name.trim();
  if (updates.city !== undefined) user.city = updates.city.trim();
  if (updates.phone !== undefined) user.phone = updates.phone.trim();
  return toPublicUser(user);
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await findStoredUserById(userId);
  if (!user) throw new Error('User not found.');
  if (!verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
    throw new Error('Current password is incorrect.');
  }
  const {salt, hash} = hashPassword(newPassword);

  if (isMongoConnected()) {
    await UserModel.findByIdAndUpdate(userId, {
      $set: {passwordSalt: salt, passwordHash: hash},
    });
    return;
  }

  const memUser = usersStore.find((u) => u.id === userId);
  if (memUser) {
    memUser.passwordSalt = salt;
    memUser.passwordHash = hash;
  }
}

export async function listAllUsers(): Promise<UserProfile[]> {
  if (isMongoConnected()) {
    const docs = await UserModel.find().sort({createdAt: -1}).lean();
    return docs.map((d) => toPublicUser(dbDocToStoredUser(d as unknown as UserDbDoc)));
  }
  return [...usersStore]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toPublicUser);
}

export async function updateUserById(
  id: string,
  updates: {name?: string; city?: string; phone?: string; role?: UserRole},
  requester: {id: string; role: UserRole},
): Promise<UserProfile | null> {
  if (requester.role !== 'admin' && requester.id !== id) {
    throw new Error('FORBIDDEN');
  }
  if (updates.role && requester.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const cleanUpdates: Record<string, string> = {};
  if (updates.name?.trim()) cleanUpdates.name = updates.name.trim();
  if (updates.city !== undefined) cleanUpdates.city = updates.city.trim();
  if (updates.phone !== undefined) cleanUpdates.phone = updates.phone.trim();
  if (updates.role && requester.role === 'admin') {
    cleanUpdates.role = updates.role;
  }

  if (isMongoConnected()) {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      {$set: cleanUpdates},
      {new: true},
    ).lean();
    return doc ? toPublicUser(dbDocToStoredUser(doc as unknown as UserDbDoc)) : null;
  }

  const user = usersStore.find((u) => u.id === id);
  if (!user) return null;
  if (cleanUpdates.name) user.name = cleanUpdates.name;
  if (cleanUpdates.city !== undefined) user.city = cleanUpdates.city;
  if (cleanUpdates.phone !== undefined) user.phone = cleanUpdates.phone;
  if (cleanUpdates.role) user.role = cleanUpdates.role as UserRole;
  return toPublicUser(user);
}

export async function deleteUserById(
  id: string,
  requesterId: string,
): Promise<boolean> {
  if (id === requesterId) {
    throw new Error('SELF_DELETE_FORBIDDEN');
  }
  if (isMongoConnected()) {
    const result = await UserModel.findByIdAndDelete(id);
    return Boolean(result);
  }
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  usersStore.splice(idx, 1);
  return true;
}

export function recordPasswordResetRequest(email: string): void {
  resetRequests.push({
    email: email.trim().toLowerCase(),
    requestedAt: new Date().toISOString(),
  });
}

export function getPublicUserProfile(user: StoredUser): UserProfile {
  return toPublicUser(user);
}
