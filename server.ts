import 'dotenv/config';
import express, {type NextFunction, type Request, type Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI} from '@google/genai';
import {connectToDatabase, isMongoConnected} from './server/db/mongo.ts';
import {
  createBooking,
  deleteBooking,
  findBookingsForRequester,
  updateBooking,
} from './server/repositories/bookingRepository.ts';
import {
  addBusinessReview,
  createBusinessListing,
  deleteBusinessListing,
  findAllBusinessesForAdmin,
  findApprovedBusinesses,
  findBusinessBySlugOrId,
  findBusinessesByOwner,
  moderateBusinessStatus,
  updateBusinessListing,
} from './server/repositories/businessRepository.ts';
import {
  createCategory,
  deleteCategory,
  findCategories,
  updateCategory,
} from './server/repositories/categoryRepository.ts';
import {
  addDestinationReview,
  createDestination,
  deleteDestination,
  findAllDestinations,
  findDestinationBySlugOrId,
  updateDestination,
} from './server/repositories/destinationRepository.ts';
import {
  createReview,
  deleteReview,
  findReviews,
  updateReview,
} from './server/repositories/reviewRepository.ts';
import {
  changeUserPassword,
  claimFirstAdmin,
  deleteUserById,
  getPublicUserProfile,
  isAdminClaimed,
  isAdminPasscodeConfigured,
  listAllUsers,
  loginAccount,
  logoutToken,
  optionalAuth,
  recordPasswordResetRequest,
  registerAccount,
  requireAuth,
  requireRole,
  updateUserById,
  updateUserProfile,
  type AuthenticatedRequest,
} from './server/services/authService.ts';
import {
  isValidEmail,
  safeNumber,
  safeOptionalString,
  safeString,
} from './server/utils/validation.ts';
import type {BusinessCategoryValue, BusinessDirectoryCategory, UserRole} from './src/types/business.ts';
import type {DestinationCategory} from './src/types/destination.ts';
import type {
  BookingStatus,
  BookingTargetType,
  CategoryScope,
  PortalReviewCategory,
  ReviewTargetType,
} from './src/types/portal.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const PORTAL_SYSTEM_INSTRUCTION = `You are the official Swadesh Trails — India Local Tourism & Community Business Concierge AI.
Your role is to help domestic and international travelers explore India's eco-heritage regions, connect with verified local cooperatives, certified guides, hotels, heritage homestays, and regional kitchens, and plan practical day-by-day itineraries.

Here is the verified India Local Tourism directory:
1. Destinations:
   - Abbey & Irpu Forest Cascades (Kodagu, Karnataka · Waterfalls, 2.5 hrs, Entry ₹80, Best Jun-Nov): Western Ghats basalt waterfalls with plastic-free forest trail.
   - Kumbhalgarh Sandstone Citadel (Rajsamand, Rajasthan · Heritage, 3 hrs, Entry ₹150, Best Oct-Mar): 15th-century Mewar hill fort with 36 km ramparts and Aravalli sunset views.
   - Mawphlang & Laitlum Cloud Ridge (East Khasi Hills, Meghalaya · Viewpoints, 2 hrs, ₹50 community fee, Best Sep-Feb): Khasi canyon rim overlooking valley clouds and sacred forest groves.
   - Munnar Shola & Ridge Trail (Idukki, Kerala · Trails, 4 hrs, ₹200 forest permit, Best Year-round): Guided 7 km tea terrace and endemic shola birding loop.
   - Wayanad Spice & Tea Terraces (Wayanad, Kerala · Viewpoints, 2 hrs, Free entry, Best Aug-Jan): Shade-grown organic pepper, cardamom, and tea slopes.
   - Chettinad & Kaveri Heritage Quarter (Karaikudi, Tamil Nadu · Heritage, 2 hrs, ₹100 heritage pass, Best Year-round): Athangudi-tiled mansions, Burma teak courtyards, and cotton weaving studios.

2. Local Businesses & Certified Guides:
   - Idukki Spice & Handloom Cooperative (Munnar–Thekkady, Kerala · Local handicrafts, Open 09:00-18:30): Women-led cooperative for green cardamom, bamboo craft, and handwoven shawls.
   - Vikramaditya Rao — Heritage & Wildlife Guide (Karnataka & Rajasthan · Tour guides, ₹2,200/half-day): Ministry-licensed guide for ASI fort walks & Western Ghats birding in English, Hindi, and Kannada.
   - Wayanad Wild Forest Honey & Botanicals (Kalpetta, Kerala · Local handicrafts, Open 09:30-19:00): Single-origin forest honey, Tellicherry pepper, and cold-pressed oils.
   - Sahyadri Eco-Trails & River Collective (Madikeri & Kabini, Karnataka · Travel agencies, Open 06:30-18:00): Guided sunrise ridge treks, estate cycling, and calm-water coracle floats.

3. Hotels, Homestays & Restaurants:
   - Kabini Timberline Eco-Sanctuary (Nagarhole Edge, Karnataka · Hotels, ₹9,200/night): Teak eco-lodge with infinity reflection pool and Ayurvedic spa.
   - Aravalli Ridge Heritage Haveli (Kumbhalgarh Hills, Rajasthan · Hotels, ₹6,800/night): Sandstone hilltop haveli with jharokha balconies and cultural evenings.
   - Tharavadu & Athangudi Courtyard Stay (Fort Kochi & Chettinad · Homestays, ₹3,900/night): 110-year-old family courtyard home with home-cooked appam & regional sadya.
   - Kodava Estate Coffee Bungalow (Madikeri, Coorg · Homestays, ₹3,400/night): 4-room coffee plantation bungalow with Akki Roti breakfasts.
   - Malabar Spice & Millet Pavilion (Wayanad, Kerala · Restaurants, ₹950 for two): Farm-to-table regional thalis, wood-fired appams, and Jain/vegan options.
   - Chikmagalur Filter Coffee Terrace (Chikmagalur, Karnataka · Restaurants, ₹550 for two): Single-estate brass filter coffee and spiced millet bowls.

Guidelines:
- Give warm, concise, practical India travel recommendations using bullet points and clear headings when building itineraries.
- Mention regional connectivity, ideal Indian seasons (SW Monsoon Jun–Sep, Winter Oct–Mar), UPI/direct cooperative support, and local guide pairings.
- Keep responses focused and under 250 words unless asked for a multi-day circuit.`;

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  await connectToDatabase();

  const app = express();
  app.use(express.json({limit: '1mb'}));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      database: isMongoConnected() ? 'mongodb' : 'in-memory-fallback',
    });
  });

  // ---------------------------------------------------------------------------
  // 1. Categories Collection CRUD (/api/categories)
  // ---------------------------------------------------------------------------
  app.get('/api/categories', async (req: Request, res: Response) => {
    try {
      const rawScope = safeOptionalString(req.query.scope, 30);
      const scope: CategoryScope | undefined =
        rawScope === 'destination' || rawScope === 'business'
          ? rawScope
          : undefined;
      const categories = await findCategories(scope);
      res.json({categories, total: categories.length});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch categories.';
      res.status(500).json({error: message});
    }
  });

  app.post(
    '/api/categories',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const name = safeString(body.name, 80);
        const scope = body.scope;
        const description = safeString(body.description, 300);
        const displayOrder = safeNumber(body.displayOrder ?? 10, 1, 999);

        if (!name || (scope !== 'destination' && scope !== 'business')) {
          res.status(400).json({
            error: 'Category name and valid scope (destination or business) are required.',
          });
          return;
        }

        const category = await createCategory({
          name,
          scope,
          description,
          displayOrder: displayOrder ?? 10,
        });
        res.status(201).json({category});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to create category.';
        res.status(400).json({error: message});
      }
    },
  );

  app.patch(
    '/api/categories/:id',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const name = safeOptionalString(body.name, 80);
        const description = safeOptionalString(body.description, 300);
        const displayOrder =
          body.displayOrder !== undefined
            ? safeNumber(body.displayOrder, 1, 999)
            : null;

        const updated = await updateCategory(String(req.params.id), {
          name,
          description,
          displayOrder: displayOrder ?? undefined,
        });
        if (!updated) {
          res.status(404).json({error: 'Category not found.'});
          return;
        }
        res.json({category: updated});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to update category.';
        res.status(500).json({error: message});
      }
    },
  );

  app.delete(
    '/api/categories/:id',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const deleted = await deleteCategory(String(req.params.id));
        if (!deleted) {
          res.status(404).json({error: 'Category not found.'});
          return;
        }
        res.json({status: 'deleted'});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete category.';
        res.status(500).json({error: message});
      }
    },
  );

  // ---------------------------------------------------------------------------
  // 2. Destinations Collection CRUD (/api/destinations)
  // ---------------------------------------------------------------------------
  app.get('/api/destinations', async (req: Request, res: Response) => {
    try {
      const search = safeOptionalString(req.query.search, 120);
      const rawCat = safeOptionalString(req.query.category, 60) || 'All';
      const category = rawCat as DestinationCategory;
      const season = safeOptionalString(req.query.season, 60);

      const destinations = await findAllDestinations({search, category, season});
      res.json({destinations, total: destinations.length});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch destinations.';
      res.status(500).json({error: message});
    }
  });

  app.get('/api/destinations/:slugOrId', async (req: Request, res: Response) => {
    try {
      const destination = await findDestinationBySlugOrId(String(req.params.slugOrId));
      if (!destination) {
        res.status(404).json({error: 'Tourist destination not found.'});
        return;
      }
      res.json({destination});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load destination.';
      res.status(500).json({error: message});
    }
  });

  app.post(
    '/api/destinations',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const name = safeString(body.name, 140);
        const category = safeString(body.category, 60);
        const shortDescription = safeString(body.shortDescription, 400);
        const description = safeString(body.description, 2500);
        const state = safeString(body.state, 80);
        const district = safeString(body.district, 80);
        const address = safeString(body.address, 250);
        const openingHours = safeString(body.openingHours, 120);
        const entryDisplayLabel = safeString(body.entryDisplayLabel, 80);
        const bestSeason = safeString(body.bestSeason, 60);
        const duration = safeString(body.duration, 60);
        const nearbyPartner = safeString(body.nearbyPartner, 140);
        const image = safeOptionalString(body.image, 500);

        if (
          !name ||
          !category ||
          !shortDescription ||
          !state ||
          !district ||
          !address ||
          !openingHours
        ) {
          res.status(400).json({
            error:
              'Please provide destination name, category, summary, state, district, address, and opening hours.',
          });
          return;
        }

        const created = await createDestination({
          name,
          category: category as Exclude<DestinationCategory, 'All'>,
          shortDescription,
          description,
          state,
          district,
          address,
          openingHours,
          entryDisplayLabel: entryDisplayLabel || 'Free entry',
          bestSeason: bestSeason || 'Year-round',
          duration: duration || '2–3 hrs',
          nearbyPartner,
          image,
        });
        res.status(201).json({destination: created});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to create destination.';
        res.status(500).json({error: message});
      }
    },
  );

  app.patch(
    '/api/destinations/:id',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const updated = await updateDestination(String(req.params.id), {
          name: safeOptionalString(body.name, 140),
          category: safeOptionalString(body.category, 60) as
            | Exclude<DestinationCategory, 'All'>
            | undefined,
          shortDescription: safeOptionalString(body.shortDescription, 400),
          description: safeOptionalString(body.description, 2500),
          state: safeOptionalString(body.state, 80),
          district: safeOptionalString(body.district, 80),
          address: safeOptionalString(body.address, 250),
          openingHours: safeOptionalString(body.openingHours, 120),
          entryDisplayLabel: safeOptionalString(body.entryDisplayLabel, 80),
          bestSeason: safeOptionalString(body.bestSeason, 60),
          duration: safeOptionalString(body.duration, 60),
          nearbyPartner: safeOptionalString(body.nearbyPartner, 140),
        });
        if (!updated) {
          res.status(404).json({error: 'Tourist destination not found.'});
          return;
        }
        res.json({destination: updated});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to update destination.';
        res.status(500).json({error: message});
      }
    },
  );

  app.delete(
    '/api/destinations/:id',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const deleted = await deleteDestination(String(req.params.id));
        if (!deleted) {
          res.status(404).json({error: 'Tourist destination not found.'});
          return;
        }
        res.json({status: 'deleted'});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete destination.';
        res.status(500).json({error: message});
      }
    },
  );

  app.post(
    '/api/destinations/:id/reviews',
    optionalAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const author = safeString(body.author, 80);
        const hometown = safeString(body.hometown, 80);
        const comment = safeString(body.comment, 1000);
        const rating = safeNumber(body.rating, 1, 5);

        if (!author || comment.length < 10 || rating === null) {
          res.status(400).json({
            error:
              'Please enter your name, a 1-5 star rating, and a review of at least 10 characters.',
          });
          return;
        }

        const updated = await addDestinationReview(String(req.params.id), {
          author,
          hometown,
          rating,
          comment,
        });

        if (!updated) {
          res.status(404).json({error: 'Destination not found.'});
          return;
        }

        // Also record in centralized Reviews collection
        await createReview({
          targetType: 'destination',
          targetId: updated._id,
          targetName: updated.name,
          category: 'Destinations',
          userId: req.authUser?.id,
          author,
          hometown,
          rating,
          comment,
        });

        res.status(201).json({destination: updated});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to save review.';
        res.status(500).json({error: message});
      }
    },
  );

  // ---------------------------------------------------------------------------
  // 3. Authentication & Users Collection CRUD (/api/auth/* & /api/users/*)
  // ---------------------------------------------------------------------------
  app.get('/api/auth/bootstrap-status', async (_req: Request, res: Response) => {
    try {
      res.json({
        adminClaimed: await isAdminClaimed(),
        passcodeRequired: isAdminPasscodeConfigured(),
      });
    } catch {
      res.json({adminClaimed: false, passcodeRequired: isAdminPasscodeConfigured()});
    }
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const name = safeString(body.name, 80);
      const email = safeString(body.email, 120);
      const password = typeof body.password === 'string' ? body.password : '';
      const role = body.role === 'business_owner' ? 'business_owner' : 'tourist';
      const city = safeString(body.city, 80);
      const phone = safeString(body.phone, 40);

      if (!name || !isValidEmail(email)) {
        res.status(400).json({error: 'Please enter a valid name and email address.'});
        return;
      }
      if (password.length < 6) {
        res.status(400).json({error: 'Password must be at least 6 characters.'});
        return;
      }

      const session = await registerAccount({name, email, password, role, city, phone});
      res.status(201).json(session);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      res.status(400).json({error: message});
    }
  });

  app.post('/api/auth/claim-admin', async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const name = safeString(body.name, 80);
      const email = safeString(body.email, 120);
      const password = typeof body.password === 'string' ? body.password : '';
      const passcode = safeOptionalString(body.passcode, 120);

      if (!name || !isValidEmail(email)) {
        res.status(400).json({error: 'Please provide a valid name and email address.'});
        return;
      }
      if (password.length < 8) {
        res
          .status(400)
          .json({error: 'Administrator password must be at least 8 characters.'});
        return;
      }

      const session = await claimFirstAdmin({name, email, password, passcode});
      res.status(201).json(session);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Administrator setup failed.';
      res.status(403).json({error: message});
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const email = safeString(body.email, 120);
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) {
        res.status(400).json({error: 'Email and password are required.'});
        return;
      }
      const session = await loginAccount({email, password});
      res.json(session);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign-in failed.';
      res.status(401).json({error: message});
    }
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    logoutToken(req.authTokenId);
    res.json({status: 'signed_out'});
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    res.json({user: getPublicUserProfile(req.authUser)});
  });

  app.patch('/api/auth/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({error: 'Unauthorized'});
        return;
      }
      const body = req.body as Record<string, unknown>;
      const updated = await updateUserProfile(req.authUser.id, {
        name: safeOptionalString(body.name, 80),
        city: safeOptionalString(body.city, 80),
        phone: safeOptionalString(body.phone, 40),
      });
      res.json({user: updated});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Profile update failed.';
      res.status(400).json({error: message});
    }
  });

  app.post(
    '/api/auth/change-password',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.authUser) {
          res.status(401).json({error: 'Unauthorized'});
          return;
        }
        const body = req.body as Record<string, unknown>;
        const currentPassword =
          typeof body.currentPassword === 'string' ? body.currentPassword : '';
        const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
        if (newPassword.length < 6) {
          res.status(400).json({error: 'New password must be at least 6 characters.'});
          return;
        }
        await changeUserPassword(req.authUser.id, currentPassword, newPassword);
        res.json({status: 'password_updated'});
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Password change failed.';
        res.status(400).json({error: message});
      }
    },
  );

  app.post('/api/auth/request-reset', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const email = safeString(body.email, 120);
    if (!isValidEmail(email)) {
      res.status(400).json({error: 'Please enter a valid email address.'});
      return;
    }
    recordPasswordResetRequest(email);
    res.json({
      message:
        'If an account exists for that email, your password reset request has been logged for portal verification.',
    });
  });

  // Users CRUD routes
  app.get(
    '/api/users',
    requireAuth,
    requireRole(['admin']),
    async (_req: AuthenticatedRequest, res: Response) => {
      try {
        const users = await listAllUsers();
        res.json({users, total: users.length});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to list users.';
        res.status(500).json({error: message});
      }
    },
  );

  app.get('/api/users/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    res.json({user: getPublicUserProfile(req.authUser)});
  });

  app.patch('/api/users/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const body = req.body as Record<string, unknown>;
      const role =
        body.role === 'tourist' || body.role === 'business_owner' || body.role === 'admin'
          ? (body.role as UserRole)
          : undefined;

      const updated = await updateUserById(
        String(req.params.id),
        {
          name: safeOptionalString(body.name, 80),
          city: safeOptionalString(body.city, 80),
          phone: safeOptionalString(body.phone, 40),
          role,
        },
        {id: req.authUser.id, role: req.authUser.role},
      );
      if (!updated) {
        res.status(404).json({error: 'User not found.'});
        return;
      }
      res.json({user: updated});
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        res.status(403).json({error: 'Insufficient permission to update this user.'});
        return;
      }
      res.status(500).json({error: 'Failed to update user.'});
    }
  });

  app.delete(
    '/api/users/:id',
    requireAuth,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.authUser) return;
        const deleted = await deleteUserById(String(req.params.id), req.authUser.id);
        if (!deleted) {
          res.status(404).json({error: 'User not found.'});
          return;
        }
        res.json({status: 'deleted'});
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'SELF_DELETE_FORBIDDEN') {
          res.status(400).json({error: 'Administrators cannot delete their own active account.'});
          return;
        }
        res.status(500).json({error: 'Failed to remove user.'});
      }
    },
  );

  // ---------------------------------------------------------------------------
  // 4. Businesses Collection CRUD (/api/businesses/*)
  // ---------------------------------------------------------------------------
  app.get('/api/businesses', async (req: Request, res: Response) => {
    try {
      const search = safeOptionalString(req.query.search, 120);
      const rawCat = safeOptionalString(req.query.category, 60) || 'All';
      const category = rawCat as BusinessDirectoryCategory;
      const state = safeOptionalString(req.query.state, 80);

      const businesses = await findApprovedBusinesses({search, category, state});
      res.json({businesses, total: businesses.length});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch businesses.';
      res.status(500).json({error: message});
    }
  });

  app.get(
    '/api/businesses/mine',
    requireAuth,
    requireRole(['business_owner', 'admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.authUser) return;
      const businesses = await findBusinessesByOwner(req.authUser.id);
      res.json({businesses});
    },
  );

  app.get('/api/businesses/:slugOrId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    const business = await findBusinessBySlugOrId(
      String(req.params.slugOrId),
      req.authUser ? {id: req.authUser.id, role: req.authUser.role} : undefined,
    );
    if (!business) {
      res.status(404).json({error: 'Business listing not found.'});
      return;
    }
    res.json({business});
  });

  app.post(
    '/api/businesses',
    requireAuth,
    requireRole(['business_owner', 'admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.authUser) return;
        const body = req.body as Record<string, unknown>;
        const name = safeString(body.name, 140);
        const category = safeString(body.category, 60);
        const shortDescription = safeString(body.shortDescription, 400);
        const description = safeString(body.description, 2500);
        const city = safeString(body.city, 80);
        const state = safeString(body.state, 80);
        const address = safeString(body.address, 250);
        const phone = safeString(body.phone, 40);
        const email = safeString(body.email, 120);
        const operatingHours = safeString(body.operatingHours, 120);
        const priceRange = safeString(body.priceRange, 100);
        const image = safeOptionalString(body.image, 500);

        const validCategories = (await findCategories('business')).map((c) => c.name);
        if (
          !name ||
          !validCategories.includes(category) ||
          !shortDescription ||
          !city ||
          !state ||
          !address ||
          !phone ||
          !isValidEmail(email) ||
          !operatingHours
        ) {
          res.status(400).json({
            error:
              'Please complete all required business fields (name, valid category, description, location, valid contact email/phone, and operating hours).',
          });
          return;
        }

        const created = await createBusinessListing({
          ownerId: req.authUser.id,
          ownerName: req.authUser.name,
          name,
          category: category as BusinessCategoryValue,
          image,
          shortDescription,
          description,
          city,
          state,
          address,
          phone,
          email,
          operatingHours,
          priceRange,
          initialStatus: req.authUser.role === 'admin' ? 'approved' : 'pending',
        });

        res.status(201).json({business: created});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to create business.';
        res.status(500).json({error: message});
      }
    },
  );

  app.patch(
    '/api/businesses/:id',
    requireAuth,
    requireRole(['business_owner', 'admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.authUser) return;
        const body = req.body as Record<string, unknown>;
        const rawCategory = safeOptionalString(body.category, 60);
        const validCategories = (await findCategories('business')).map((c) => c.name);
        const category =
          rawCategory && validCategories.includes(rawCategory)
            ? (rawCategory as BusinessCategoryValue)
            : undefined;

        const updated = await updateBusinessListing(
          String(req.params.id),
          {id: req.authUser.id, role: req.authUser.role},
          {
            name: safeOptionalString(body.name, 140),
            category,
            shortDescription: safeOptionalString(body.shortDescription, 400),
            description: safeOptionalString(body.description, 2500),
            city: safeOptionalString(body.city, 80),
            state: safeOptionalString(body.state, 80),
            address: safeOptionalString(body.address, 250),
            phone: safeOptionalString(body.phone, 40),
            email: safeOptionalString(body.email, 120),
            operatingHours: safeOptionalString(body.operatingHours, 120),
            priceRange: safeOptionalString(body.priceRange, 100),
          },
        );

        if (!updated) {
          res.status(404).json({error: 'Business not found.'});
          return;
        }
        res.json({business: updated});
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'FORBIDDEN') {
          res.status(403).json({error: 'You can only edit your own business listings.'});
          return;
        }
        res.status(500).json({error: 'Failed to update business.'});
      }
    },
  );

  app.delete(
    '/api/businesses/:id',
    requireAuth,
    requireRole(['business_owner', 'admin']),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.authUser) return;
        const deleted = await deleteBusinessListing(String(req.params.id), {
          id: req.authUser.id,
          role: req.authUser.role,
        });
        if (!deleted) {
          res.status(404).json({error: 'Business not found.'});
          return;
        }
        res.json({status: 'deleted'});
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'FORBIDDEN') {
          res.status(403).json({error: 'You can only remove your own business listings.'});
          return;
        }
        res.status(500).json({error: 'Failed to delete business.'});
      }
    },
  );

  app.post(
    '/api/businesses/:id/reviews',
    optionalAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = req.body as Record<string, unknown>;
        const author = safeString(body.author, 80);
        const comment = safeString(body.comment, 1000);
        const rating = safeNumber(body.rating, 1, 5);

        if (!author || comment.length < 10 || rating === null) {
          res.status(400).json({
            error:
              'Please enter your name, a 1-5 rating, and a review of at least 10 characters.',
          });
          return;
        }

        const updated = await addBusinessReview(String(req.params.id), {
          author,
          rating,
          comment,
        });
        if (!updated) {
          res.status(404).json({error: 'Business listing not found.'});
          return;
        }

        await createReview({
          targetType: 'business',
          targetId: updated._id,
          targetName: updated.name,
          category: 'Local Businesses',
          userId: req.authUser?.id,
          author,
          hometown: req.authUser?.city || 'India Traveler',
          rating,
          comment,
        });

        res.status(201).json({business: updated});
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to publish review.';
        res.status(500).json({error: message});
      }
    },
  );

  // Administrator Business Moderation Routes
  app.get(
    '/api/admin/businesses',
    requireAuth,
    requireRole(['admin']),
    async (_req: Request, res: Response) => {
      const businesses = await findAllBusinessesForAdmin();
      res.json({businesses});
    },
  );

  app.patch(
    '/api/admin/businesses/:id/status',
    requireAuth,
    requireRole(['admin']),
    async (req: Request, res: Response) => {
      const body = req.body as Record<string, unknown>;
      const status = body.status;
      if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
        res.status(400).json({error: 'Status must be approved, rejected, or pending.'});
        return;
      }
      const moderationNote = safeOptionalString(body.moderationNote, 300);

      const updated = await moderateBusinessStatus(
        String(req.params.id),
        status,
        moderationNote,
      );
      if (!updated) {
        res.status(404).json({error: 'Business listing not found.'});
        return;
      }
      res.json({business: updated});
    },
  );

  // ---------------------------------------------------------------------------
  // 5. Reviews Collection CRUD (/api/reviews/*)
  // ---------------------------------------------------------------------------
  app.get('/api/reviews', async (req: Request, res: Response) => {
    try {
      const rawType = safeOptionalString(req.query.targetType, 30);
      const targetType: ReviewTargetType | undefined =
        rawType === 'destination' || rawType === 'business' || rawType === 'portal'
          ? rawType
          : undefined;
      const targetId = safeOptionalString(req.query.targetId, 80);
      const rawCat = safeOptionalString(req.query.category, 40);
      const category: PortalReviewCategory | undefined =
        rawCat === 'Destinations' ||
        rawCat === 'Stays & Dining' ||
        rawCat === 'Local Businesses'
          ? rawCat
          : undefined;

      const reviews = await findReviews({targetType, targetId, category});
      res.json({reviews, total: reviews.length});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load reviews.';
      res.status(500).json({error: message});
    }
  });

  app.post('/api/reviews', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const author = safeString(body.author, 80);
      const hometown = safeString(body.hometown, 80);
      const targetName = safeString(body.targetName, 140);
      const comment = safeString(body.comment, 1200);
      const rating = safeNumber(body.rating, 1, 5);
      const category: PortalReviewCategory =
        body.category === 'Stays & Dining' || body.category === 'Local Businesses'
          ? body.category
          : 'Destinations';
      const targetType: ReviewTargetType =
        body.targetType === 'destination' || body.targetType === 'business'
          ? body.targetType
          : 'portal';
      const targetId = safeOptionalString(body.targetId, 80);

      if (!author || !targetName || comment.length < 10 || rating === null) {
        res.status(400).json({
          error:
            'Please provide your name, the place visited, a 1-5 star rating, and a review of at least 10 characters.',
        });
        return;
      }

      const review = await createReview({
        targetType,
        targetId,
        targetName,
        category,
        userId: req.authUser?.id,
        author,
        hometown,
        rating,
        comment,
      });

      res.status(201).json({review});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to publish review.';
      res.status(500).json({error: message});
    }
  });

  app.patch('/api/reviews/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const body = req.body as Record<string, unknown>;
      const rating =
        body.rating !== undefined ? safeNumber(body.rating, 1, 5) : null;
      const comment = safeOptionalString(body.comment, 1200);
      const targetName = safeOptionalString(body.targetName, 140);

      if (comment !== undefined && comment.length < 10) {
        res.status(400).json({error: 'Review comment must be at least 10 characters.'});
        return;
      }

      const updated = await updateReview(
        String(req.params.id),
        {id: req.authUser.id, role: req.authUser.role},
        {
          rating: rating ?? undefined,
          comment,
          targetName,
        },
      );
      if (!updated) {
        res.status(404).json({error: 'Review not found.'});
        return;
      }
      res.json({review: updated});
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        res.status(403).json({error: 'You can only edit your own reviews.'});
        return;
      }
      res.status(500).json({error: 'Failed to update review.'});
    }
  });

  app.delete('/api/reviews/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const deleted = await deleteReview(String(req.params.id), {
        id: req.authUser.id,
        role: req.authUser.role,
      });
      if (!deleted) {
        res.status(404).json({error: 'Review not found.'});
        return;
      }
      res.json({status: 'deleted'});
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        res.status(403).json({error: 'You can only delete your own reviews.'});
        return;
      }
      res.status(500).json({error: 'Failed to delete review.'});
    }
  });

  // ---------------------------------------------------------------------------
  // 6. Bookings Collection CRUD (/api/bookings/*)
  // ---------------------------------------------------------------------------
  app.get('/api/bookings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const bookings = await findBookingsForRequester({
        id: req.authUser.id,
        role: req.authUser.role,
      });
      res.json({bookings, total: bookings.length});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch bookings.';
      res.status(500).json({error: message});
    }
  });

  app.post('/api/bookings', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const targetName = safeString(body.targetName, 140);
      const targetSubtitle = safeString(body.targetSubtitle, 180);
      const priceInfo = safeString(body.priceInfo, 80);
      const targetId = safeOptionalString(body.targetId, 80);
      const guestName = safeString(body.guestName, 80);
      const guestEmail = safeString(body.guestEmail, 120);
      const visitDate = safeString(body.visitDate, 40);
      const guestsCount = safeString(body.guestsCount, 20);
      const notes = safeString(body.notes, 600);
      const rawType = body.targetType;
      const targetType: BookingTargetType =
        rawType === 'stay' || rawType === 'dining' || rawType === 'destination_partner'
          ? rawType
          : 'business';

      if (
        !targetName ||
        !guestName ||
        !isValidEmail(guestEmail) ||
        !visitDate ||
        !guestsCount
      ) {
        res.status(400).json({
          error:
            'Please provide your name, valid email address, preferred date, and party size.',
        });
        return;
      }

      const booking = await createBooking({
        userId: req.authUser?.id,
        targetType,
        targetId,
        targetName,
        targetSubtitle,
        priceInfo,
        guestName,
        guestEmail,
        visitDate,
        guestsCount,
        notes,
      });

      res.status(201).json({booking});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create booking.';
      res.status(500).json({error: message});
    }
  });

  app.patch('/api/bookings/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const body = req.body as Record<string, unknown>;
      const status: BookingStatus | undefined =
        body.status === 'pending' ||
        body.status === 'confirmed' ||
        body.status === 'cancelled'
          ? body.status
          : undefined;

      const updated = await updateBooking(
        String(req.params.id),
        {id: req.authUser.id, role: req.authUser.role},
        {
          status,
          visitDate: safeOptionalString(body.visitDate, 40),
          guestsCount: safeOptionalString(body.guestsCount, 20),
          notes: safeOptionalString(body.notes, 600),
        },
      );
      if (!updated) {
        res.status(404).json({error: 'Booking not found.'});
        return;
      }
      res.json({booking: updated});
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        res.status(403).json({error: 'You do not have permission to update this booking.'});
        return;
      }
      res.status(500).json({error: 'Failed to update booking.'});
    }
  });

  app.delete('/api/bookings/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) return;
      const deleted = await deleteBooking(String(req.params.id), {
        id: req.authUser.id,
        role: req.authUser.role,
      });
      if (!deleted) {
        res.status(404).json({error: 'Booking not found.'});
        return;
      }
      res.json({status: 'deleted'});
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        res.status(403).json({error: 'You do not have permission to delete this booking.'});
        return;
      }
      res.status(500).json({error: 'Failed to delete booking.'});
    }
  });

  // ---------------------------------------------------------------------------
  // AI Tourism Concierge (Server-side @google/genai proxy)
  // ---------------------------------------------------------------------------
  app.post('/api/tourism-assistant', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        message?: unknown;
        history?: unknown;
        savedPlaces?: unknown;
      };

      const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
      if (!rawMessage) {
        res.status(400).json({error: 'Please enter a travel question or itinerary request.'});
        return;
      }
      if (rawMessage.length > 1200) {
        res.status(400).json({error: 'Message is too long. Please keep questions under 1200 characters.'});
        return;
      }

      const savedPlaces = Array.isArray(body.savedPlaces)
        ? body.savedPlaces.filter((item): item is string => typeof item === 'string').slice(0, 12)
        : [];

      const historyItems: ChatHistoryItem[] = Array.isArray(body.history)
        ? body.history
            .filter(
              (item): item is ChatHistoryItem =>
                Boolean(item) &&
                typeof item === 'object' &&
                ((item as ChatHistoryItem).role === 'user' || (item as ChatHistoryItem).role === 'model') &&
                typeof (item as ChatHistoryItem).text === 'string',
            )
            .slice(-8)
        : [];

      const ai = createGeminiClient();

      const savedContext =
        savedPlaces.length > 0
          ? `\n\n[Traveler's currently saved places in their trip shortlist: ${savedPlaces.join(', ')}]`
          : '';

      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        config: {
          systemInstruction: PORTAL_SYSTEM_INSTRUCTION + savedContext,
        },
        history: historyItems.map((h) => ({
          role: h.role,
          parts: [{text: h.text}],
        })),
      });

      const response = await chat.sendMessage({
        message: rawMessage,
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({error: 'The tourism assistant returned an empty response. Please try again.'});
        return;
      }

      res.json({reply: replyText});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to reach the AI tourism assistant.';
      const status =
        message.includes('GEMINI_API_KEY') || message.includes('API_KEY_INVALID')
          ? 503
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({
        error:
          status === 503
            ? 'AI Tourism Assistant requires a valid GEMINI_API_KEY configured in Settings > Secrets.'
            : message,
      });
    }
  });

  // Malformed JSON / unhandled route error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({error: 'Malformed JSON request payload.'});
      return;
    }
    res.status(500).json({error: 'Unexpected server error.'});
  });

  if (!isProduction) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Swadesh Trails server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
