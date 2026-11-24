import type {
  BusinessApprovalStatus,
  BusinessCategoryValue,
  BusinessDocument,
  BusinessFilterQuery,
} from '../types/business';

export interface CreateBusinessPayload {
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
}

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const businessService = {
  async listApproved(filter: BusinessFilterQuery = {}): Promise<BusinessDocument[]> {
    const params = new URLSearchParams();
    if (filter.search?.trim()) params.set('search', filter.search.trim());
    if (filter.category && filter.category !== 'All') {
      params.set('category', filter.category);
    }
    if (filter.state && filter.state !== 'All') {
      params.set('state', filter.state);
    }
    const qs = params.toString();
    const res = await fetch(`/api/businesses${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Unable to load local businesses.');
    const data = (await res.json()) as {businesses: BusinessDocument[]};
    return data.businesses;
  },

  async getBySlugOrId(
    slugOrId: string,
    token: string | null,
  ): Promise<BusinessDocument> {
    const res = await fetch(`/api/businesses/${encodeURIComponent(slugOrId)}`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    const data = (await res.json()) as {business?: BusinessDocument; error?: string};
    if (!res.ok || !data.business) {
      throw new Error(data.error || 'Business listing not found.');
    }
    return data.business;
  },

  async listMine(token: string): Promise<BusinessDocument[]> {
    const res = await fetch('/api/businesses/mine', {
      headers: {Authorization: `Bearer ${token}`},
    });
    const data = (await res.json()) as {businesses?: BusinessDocument[]; error?: string};
    if (!res.ok || !data.businesses) {
      throw new Error(data.error || 'Unable to load your business listings.');
    }
    return data.businesses;
  },

  async create(
    payload: CreateBusinessPayload,
    token: string,
  ): Promise<BusinessDocument> {
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {business?: BusinessDocument; error?: string};
    if (!res.ok || !data.business) {
      throw new Error(data.error || 'Unable to register business.');
    }
    return data.business;
  },

  async update(
    id: string,
    payload: Partial<CreateBusinessPayload>,
    token: string,
  ): Promise<BusinessDocument> {
    const res = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {business?: BusinessDocument; error?: string};
    if (!res.ok || !data.business) {
      throw new Error(data.error || 'Unable to update business listing.');
    }
    return data.business;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Unable to remove business listing.');
    }
  },

  async submitReview(
    idOrSlug: string,
    payload: {author: string; rating: number; comment: string},
    token?: string | null,
  ): Promise<BusinessDocument> {
    const res = await fetch(
      `/api/businesses/${encodeURIComponent(idOrSlug)}/reviews`,
      {
        method: 'POST',
        headers: authHeaders(token ?? null),
        body: JSON.stringify(payload),
      },
    );
    const data = (await res.json()) as {business?: BusinessDocument; error?: string};
    if (!res.ok || !data.business) {
      throw new Error(data.error || 'Unable to publish review.');
    }
    return data.business;
  },

  async listAllForAdmin(token: string): Promise<BusinessDocument[]> {
    const res = await fetch('/api/admin/businesses', {
      headers: {Authorization: `Bearer ${token}`},
    });
    const data = (await res.json()) as {businesses?: BusinessDocument[]; error?: string};
    if (!res.ok || !data.businesses) {
      throw new Error(data.error || 'Unable to fetch moderation queue.');
    }
    return data.businesses;
  },

  async moderateStatus(
    id: string,
    status: BusinessApprovalStatus,
    moderationNote: string,
    token: string,
  ): Promise<BusinessDocument> {
    const res = await fetch(
      `/api/admin/businesses/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({status, moderationNote}),
      },
    );
    const data = (await res.json()) as {business?: BusinessDocument; error?: string};
    if (!res.ok || !data.business) {
      throw new Error(data.error || 'Unable to update business approval status.');
    }
    return data.business;
  },
};
