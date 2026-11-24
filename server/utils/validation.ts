export function safeString(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function safeOptionalString(
  value: unknown,
  maxLength = 2000,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim().slice(0, maxLength);
}

export function safeNumber(
  value: unknown,
  min: number,
  max: number,
): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(num) || num < min || num > max) return null;
  return num;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugify(text: string, withSuffix = true): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const safeBase = base || 'item';
  return withSuffix ? `${safeBase}-${Date.now().toString().slice(-4)}` : safeBase;
}

export function sanitizeImageUrl(url: string | undefined, fallback: string): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/src/assets/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Ignore malformed URLs and return safe fallback
  }
  return fallback;
}
