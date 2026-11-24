import type {
  DestinationCategory,
  DestinationDocument,
  DestinationFilterQuery,
} from '../types/destination';

export interface CreateDestinationPayload {
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
  image?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const destinationService = {
  async list(filter: DestinationFilterQuery = {}): Promise<DestinationDocument[]> {
    const params = new URLSearchParams();
    if (filter.search?.trim()) params.set('search', filter.search.trim());
    if (filter.category && filter.category !== 'All') {
      params.set('category', filter.category);
    }
    if (filter.season && filter.season !== 'All Seasons') {
      params.set('season', filter.season);
    }

    const qs = params.toString();
    const res = await fetch(`/api/destinations${qs ? `?${qs}` : ''}`);
    if (!res.ok) {
      throw new Error('Unable to load tourist destinations.');
    }
    const data = (await res.json()) as {destinations: DestinationDocument[]};
    return data.destinations;
  },

  async getBySlugOrId(slugOrId: string): Promise<DestinationDocument> {
    const res = await fetch(`/api/destinations/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(errData.error || 'Destination not found.');
    }
    const data = (await res.json()) as {destination: DestinationDocument};
    return data.destination;
  },

  async create(
    payload: CreateDestinationPayload,
    token: string,
  ): Promise<DestinationDocument> {
    const res = await fetch('/api/destinations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      destination?: DestinationDocument;
      error?: string;
    };
    if (!res.ok || !data.destination) {
      throw new Error(data.error || 'Failed to create destination.');
    }
    return data.destination;
  },

  async update(
    id: string,
    payload: Partial<CreateDestinationPayload>,
    token: string,
  ): Promise<DestinationDocument> {
    const res = await fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      destination?: DestinationDocument;
      error?: string;
    };
    if (!res.ok || !data.destination) {
      throw new Error(data.error || 'Failed to update destination.');
    }
    return data.destination;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Failed to delete destination.');
    }
  },

  async submitReview(
    idOrSlug: string,
    payload: {author: string; hometown: string; rating: number; comment: string},
    token?: string | null,
  ): Promise<DestinationDocument> {
    const headers: Record<string, string> = {'Content-Type': 'application/json'};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `/api/destinations/${encodeURIComponent(idOrSlug)}/reviews`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
    );
    const data = (await res.json()) as {
      destination?: DestinationDocument;
      error?: string;
    };
    if (!res.ok || !data.destination) {
      throw new Error(data.error || 'Failed to submit destination review.');
    }
    return data.destination;
  },
};
