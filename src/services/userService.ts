import type {UserProfile, UserRole} from '../types/business';

export const userService = {
  async listAll(token: string): Promise<UserProfile[]> {
    const res = await fetch('/api/users', {
      headers: {Authorization: `Bearer ${token}`},
    });
    const data = (await res.json()) as {users?: UserProfile[]; error?: string};
    if (!res.ok || !data.users) {
      throw new Error(data.error || 'Unable to load portal users.');
    }
    return data.users;
  },

  async update(
    id: string,
    payload: {name?: string; city?: string; phone?: string; role?: UserRole},
    token: string,
  ): Promise<UserProfile> {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {user?: UserProfile; error?: string};
    if (!res.ok || !data.user) {
      throw new Error(data.error || 'Unable to update user.');
    }
    return data.user;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Unable to delete user.');
    }
  },
};
