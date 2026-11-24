import type {
  PortalReviewCategory,
  ReviewDocument,
  ReviewTargetType,
} from '../types/portal';

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const reviewService = {
  async list(filter?: {
    targetType?: ReviewTargetType;
    targetId?: string;
    category?: PortalReviewCategory;
  }): Promise<ReviewDocument[]> {
    const params = new URLSearchParams();
    if (filter?.targetType) params.set('targetType', filter.targetType);
    if (filter?.targetId) params.set('targetId', filter.targetId);
    if (filter?.category) params.set('category', filter.category);
    const qs = params.toString();

    const res = await fetch(`/api/reviews${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Unable to load reviews.');
    const data = (await res.json()) as {reviews: ReviewDocument[]};
    return data.reviews;
  },

  async create(
    payload: {
      author: string;
      hometown: string;
      targetName: string;
      category: PortalReviewCategory;
      rating: number;
      comment: string;
      targetType?: ReviewTargetType;
      targetId?: string;
    },
    token: string | null,
  ): Promise<ReviewDocument> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {review?: ReviewDocument; error?: string};
    if (!res.ok || !data.review) {
      throw new Error(data.error || 'Unable to publish review.');
    }
    return data.review;
  },

  async update(
    id: string,
    payload: {rating?: number; comment?: string; targetName?: string},
    token: string,
  ): Promise<ReviewDocument> {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {review?: ReviewDocument; error?: string};
    if (!res.ok || !data.review) {
      throw new Error(data.error || 'Unable to update review.');
    }
    return data.review;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Unable to delete review.');
    }
  },
};
