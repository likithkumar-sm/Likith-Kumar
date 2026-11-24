import type {
  BookingDocument,
  BookingStatus,
  BookingTargetType,
} from '../types/portal';

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const bookingService = {
  async list(token: string): Promise<BookingDocument[]> {
    const res = await fetch('/api/bookings', {
      headers: {Authorization: `Bearer ${token}`},
    });
    const data = (await res.json()) as {
      bookings?: BookingDocument[];
      error?: string;
    };
    if (!res.ok || !data.bookings) {
      throw new Error(data.error || 'Unable to load bookings.');
    }
    return data.bookings;
  },

  async create(
    payload: {
      targetType: BookingTargetType;
      targetId?: string;
      targetName: string;
      targetSubtitle: string;
      priceInfo: string;
      guestName: string;
      guestEmail: string;
      visitDate: string;
      guestsCount: string;
      notes: string;
    },
    token: string | null,
  ): Promise<BookingDocument> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {booking?: BookingDocument; error?: string};
    if (!res.ok || !data.booking) {
      throw new Error(data.error || 'Unable to submit booking inquiry.');
    }
    return data.booking;
  },

  async update(
    id: string,
    payload: {
      status?: BookingStatus;
      visitDate?: string;
      guestsCount?: string;
      notes?: string;
    },
    token: string,
  ): Promise<BookingDocument> {
    const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {booking?: BookingDocument; error?: string};
    if (!res.ok || !data.booking) {
      throw new Error(data.error || 'Unable to update booking.');
    }
    return data.booking;
  },

  async remove(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Unable to delete booking.');
    }
  },
};
