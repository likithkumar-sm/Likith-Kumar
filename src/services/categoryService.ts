import type {CategoryDocument, CategoryScope} from '../types/portal';

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const categoryService = {
  async list(scope?: CategoryScope): Promise<CategoryDocument[]> {
    const qs = scope ? `?scope=${encodeURIComponent(scope)}` : '';
    const res = await fetch(`/api/categories${qs}`);
    if (!res.ok) throw new Error('Unable to load categories.');
    const data = (await res.json()) as {categories: CategoryDocument[]};
    return data.categories;
  },

  async create(
    payload: {
      name: string;
      scope: CategoryScope;
      description: string;
      displayOrder?: number;
    },
    token: string,
  ): Promise<CategoryDocument> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      category?: CategoryDocument;
      error?: string;
    };
    if (!res.ok || !data.category) {
      throw new Error(data.error || 'Unable to create category.');
    }
    return data.category;
  },

  async update(
    id: string,
    payload: {name?: string; description?: string; displayOrder?: number},
    token: string,
  ): Promise<CategoryDocument> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      category?: CategoryDocument;
      error?: string;
    };
    if (!res.ok || !data.category) {
      throw new Error(data.error || 'Unable to update category.');
    }
    return data.category;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Unable to delete category.');
    }
  },
};
