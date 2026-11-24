import type {BusinessDocument} from '../types/business';
import type {DestinationDocument} from '../types/destination';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelHub {
  id: string;
  label: string;
  coordinates: Coordinates;
}

export const INDIA_TRAVEL_HUBS: TravelHub[] = [
  {id: 'hub-bengaluru', label: 'Bengaluru (City Center)', coordinates: {lat: 12.9716, lng: 77.5946}},
  {id: 'hub-mysuru', label: 'Mysuru Junction', coordinates: {lat: 12.2958, lng: 76.6394}},
  {id: 'hub-kochi', label: 'Kochi / Ernakulam', coordinates: {lat: 9.9312, lng: 76.2673}},
  {id: 'hub-udaipur', label: 'Udaipur City', coordinates: {lat: 24.5854, lng: 73.7125}},
  {id: 'hub-shillong', label: 'Shillong (Meghalaya)', coordinates: {lat: 25.5788, lng: 91.8933}},
  {id: 'hub-madurai', label: 'Madurai (Chettinad Gate)', coordinates: {lat: 9.9252, lng: 78.1198}},
];

const STATE_FALLBACK_COORDS: Record<string, Coordinates> = {
  karnataka: {lat: 12.9716, lng: 77.5946},
  kerala: {lat: 10.8505, lng: 76.2711},
  rajasthan: {lat: 25.1479, lng: 73.5829},
  meghalaya: {lat: 25.5788, lng: 91.8933},
  'tamil nadu': {lat: 10.7905, lng: 78.7047},
  maharashtra: {lat: 18.5204, lng: 73.8567},
  himachal: {lat: 31.1048, lng: 77.1734},
  uttarakhand: {lat: 30.0668, lng: 79.0193},
};

export function getBusinessCoordinates(biz: BusinessDocument): Coordinates {
  const coords = biz.location.coordinates;
  if (
    coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat !== 0 &&
    coords.lng !== 0
  ) {
    return coords;
  }
  const stateLower = biz.location.state.toLowerCase();
  for (const [key, val] of Object.entries(STATE_FALLBACK_COORDS)) {
    if (stateLower.includes(key)) return val;
  }
  return {lat: 12.9716, lng: 77.5946};
}

export function getDestinationCoordinates(dest: DestinationDocument): Coordinates {
  const coords = dest.location.coordinates;
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    return coords;
  }
  return {lat: 12.4547, lng: 75.7163};
}

/**
 * Great-circle Haversine distance in kilometers.
 */
export function calculateDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 20) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString('en-IN')} km`;
}

export function formatDriveEstimate(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} mins`;
  const hrs = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RouteResult {
  points: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  isRoadRoute: boolean;
}

export async function fetchOsrmDrivingRoute(
  from: Coordinates,
  to: Coordinates,
): Promise<RouteResult> {
  const straightDistanceKm = calculateDistanceKm(from, to);
  const fallbackMinutes = (straightDistanceKm / 48) * 60;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, {signal: controller.signal});
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error('OSRM route unavailable');
    }
    const data = (await res.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: {coordinates?: [number, number][]};
      }>;
    };

    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!route || !coords || coords.length < 2) {
      throw new Error('No road route returned');
    }

    return {
      points: coords.map(([lng, lat]) => [lat, lng]),
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      isRoadRoute: true,
    };
  } catch {
    return {
      points: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      distanceKm: straightDistanceKm,
      durationMinutes: fallbackMinutes,
      isRoadRoute: false,
    };
  }
}

export function getOpenStreetMapDirectionsUrl(
  from: Coordinates | null,
  to: Coordinates,
): string {
  if (from) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat.toFixed(5)}%2C${from.lng.toFixed(5)}%3B${to.lat.toFixed(5)}%2C${to.lng.toFixed(5)}`;
  }
  return `https://www.openstreetmap.org/?mlat=${to.lat.toFixed(5)}&mlon=${to.lng.toFixed(5)}#map=14/${to.lat.toFixed(5)}/${to.lng.toFixed(5)}`;
}
