import L from 'leaflet';
import {
  ArrowRight,
  Compass,
  Crosshair,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
  Star,
} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {BusinessDocument} from '../types/business';
import type {DestinationDocument} from '../types/destination';
import {
  calculateDistanceKm,
  escapeHtml,
  fetchOsrmDrivingRoute,
  formatDistanceKm,
  formatDriveEstimate,
  getBusinessCoordinates,
  getDestinationCoordinates,
  getOpenStreetMapDirectionsUrl,
  INDIA_TRAVEL_HUBS,
  type Coordinates,
  type RouteResult,
} from '../utils/geo';
import {PortalImage} from './PortalImage';

export type MapMarkerItem =
  | {
      kind: 'destination';
      id: string;
      title: string;
      subtitle: string;
      category: string;
      address: string;
      hours: string;
      priceOrFee: string;
      rating: number;
      reviewCount: number;
      image: string;
      coordinates: Coordinates;
      raw: DestinationDocument;
    }
  | {
      kind: 'business';
      id: string;
      title: string;
      subtitle: string;
      category: string;
      address: string;
      hours: string;
      priceOrFee: string;
      rating: number;
      reviewCount: number;
      image: string;
      coordinates: Coordinates;
      raw: BusinessDocument;
    };

interface PortalMapSectionProps {
  destinations: DestinationDocument[];
  businesses: BusinessDocument[];
  onViewDestinationDetails: (dest: DestinationDocument) => void;
  onViewBusinessDetails: (biz: BusinessDocument) => void;
}

function createPinIcon(
  kind: 'destination' | 'business' | 'user',
  isSelected: boolean,
): L.DivIcon {
  if (kind === 'user') {
    return L.divIcon({
      className: 'swadesh-user-pin',
      html: `<div style="width:18px;height:18px;border-radius:9999px;background:#1D4ED8;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  const fill = kind === 'destination' ? '#133828' : '#B88B3A';
  const stroke = isSelected ? '#E2C583' : '#FFFFFF';
  const size = isSelected ? 34 : 28;

  return L.divIcon({
    className: 'swadesh-map-pin',
    html: `<svg width="${size}" height="${Math.round(size * 1.2)}" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(12,36,25,0.35));">
      <path d="M14 1C7.37258 1 2 6.37258 2 13C2 21.25 14 33 14 33C14 33 26 21.25 26 13C26 6.37258 20.6274 1 14 1Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
      <circle cx="14" cy="13" r="4.5" fill="#FAF8F4"/>
    </svg>`,
    iconSize: [size, Math.round(size * 1.2)],
    iconAnchor: [Math.round(size / 2), Math.round(size * 1.15)],
    popupAnchor: [0, -Math.round(size * 1.05)],
  });
}

export function PortalMapSection({
  destinations,
  businesses,
  onViewDestinationDetails,
  onViewBusinessDetails,
}: PortalMapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [layerFilter, setLayerFilter] = useState<'all' | 'destination' | 'business'>('all');
  const [panelTab, setPanelTab] = useState<'details' | 'nearby' | 'directions'>('details');
  const [selectedId, setSelectedId] = useState<string>('dest_001');

  // Geolocation & Explore Nearby state
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [nearbyAnchorId, setNearbyAnchorId] = useState<string>('dest_001');
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(150);

  // Directions state
  const [originSelection, setOriginSelection] = useState<string>('hub-bengaluru');
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeOriginLabel, setRouteOriginLabel] = useState<string>('');
  const [routeOriginCoords, setRouteOriginCoords] = useState<Coordinates | null>(null);

  const allItems: MapMarkerItem[] = useMemo(() => {
    const destItems: MapMarkerItem[] = destinations.map((d) => ({
      kind: 'destination',
      id: d._id,
      title: d.name,
      subtitle: `${d.location.district}, ${d.location.state}`,
      category: d.category,
      address: `${d.location.address}, ${d.location.district}, ${d.location.state}`,
      hours: d.openingHours,
      priceOrFee: d.entryFee.displayLabel,
      rating: d.rating,
      reviewCount: d.reviewCount,
      image: d.image,
      coordinates: getDestinationCoordinates(d),
      raw: d,
    }));

    const bizItems: MapMarkerItem[] = businesses.map((b) => ({
      kind: 'business',
      id: b._id,
      title: b.name,
      subtitle: `${b.location.city}, ${b.location.state}`,
      category: b.category,
      address: `${b.location.address}, ${b.location.city}, ${b.location.state}`,
      hours: b.operatingHours,
      priceOrFee: b.priceRange,
      rating: b.rating,
      reviewCount: b.reviewCount,
      image: b.image,
      coordinates: getBusinessCoordinates(b),
      raw: b,
    }));

    return [...destItems, ...bizItems];
  }, [destinations, businesses]);

  const visibleItems = useMemo(() => {
    if (layerFilter === 'all') return allItems;
    return allItems.filter((item) => item.kind === layerFilter);
  }, [allItems, layerFilter]);

  const selectedItem = useMemo(
    () => allItems.find((i) => i.id === selectedId) ?? allItems[0] ?? null,
    [allItems, selectedId],
  );

  const nearbyAnchor = useMemo(() => {
    if (nearbyAnchorId === 'user' && userCoords) {
      return {label: 'Your Current Location', coords: userCoords};
    }
    const foundItem = allItems.find((i) => i.id === nearbyAnchorId);
    if (foundItem) {
      return {label: foundItem.title, coords: foundItem.coordinates};
    }
    const hub = INDIA_TRAVEL_HUBS.find((h) => h.id === nearbyAnchorId);
    if (hub) {
      return {label: hub.label, coords: hub.coordinates};
    }
    return {
      label: allItems[0]?.title ?? 'Bengaluru',
      coords: allItems[0]?.coordinates ?? {lat: 12.9716, lng: 77.5946},
    };
  }, [nearbyAnchorId, userCoords, allItems]);

  const nearbyResults = useMemo(() => {
    return allItems
      .filter((item) => item.id !== nearbyAnchorId)
      .map((item) => ({
        item,
        distanceKm: calculateDistanceKm(nearbyAnchor.coords, item.coordinates),
      }))
      .filter((entry) => nearbyRadiusKm === 0 || entry.distanceKm <= nearbyRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [allItems, nearbyAnchor, nearbyAnchorId, nearbyRadiusKm]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.5, 77.5],
      zoom: 5,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  // Render Markers whenever visibleItems, selectedId, or userCoords change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    visibleItems.forEach((item) => {
      const isSelected = selectedItem?.id === item.id;
      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: createPinIcon(item.kind, isSelected),
        title: item.title,
      });

      const badgeLabel =
        item.kind === 'destination' ? 'Tourist Destination' : 'Local Business';
      const popupHtml = `
        <div style="min-width:190px;max-width:240px;font-family:inherit;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#997027;margin-bottom:2px;">
            ${escapeHtml(badgeLabel)} · ${escapeHtml(item.category)}
          </div>
          <div style="font-size:14px;font-weight:700;color:#133828;line-height:1.25;margin-bottom:4px;">
            ${escapeHtml(item.title)}
          </div>
          <div style="font-size:12px;color:#425349;margin-bottom:4px;">
            ${escapeHtml(item.subtitle)}
          </div>
          <div style="font-size:11px;color:#5A6C61;">
            ★ ${item.rating.toFixed(1)} (${item.reviewCount}) · ${escapeHtml(item.priceOrFee)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedId(item.id);
        setPanelTab('details');
        map.panTo([item.coordinates.lat, item.coordinates.lng], {animate: true});
      });

      marker.addTo(markersLayer);
    });

    if (userCoords) {
      L.marker([userCoords.lat, userCoords.lng], {
        icon: createPinIcon('user', false),
        title: 'Your Current Location',
      })
        .bindPopup('<div style="font-size:12px;font-weight:600;color:#133828;">Your Current Location</div>')
        .addTo(markersLayer);
    }
  }, [visibleItems, selectedItem, userCoords]);

  // Render Nearby Radius Ring OR Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (panelTab === 'nearby' && nearbyRadiusKm > 0) {
      L.circle([nearbyAnchor.coords.lat, nearbyAnchor.coords.lng], {
        radius: nearbyRadiusKm * 1000,
        color: '#133828',
        weight: 1.5,
        dashArray: '6 6',
        fillColor: '#256146',
        fillOpacity: 0.08,
      }).addTo(routeLayer);
    }

    if (activeRoute && activeRoute.points.length >= 2) {
      const polyline = L.polyline(activeRoute.points, {
        color: '#133828',
        weight: 4.5,
        opacity: 0.9,
        dashArray: activeRoute.isRoadRoute ? undefined : '8 6',
      }).addTo(routeLayer);

      if (routeOriginCoords) {
        L.circleMarker([routeOriginCoords.lat, routeOriginCoords.lng], {
          radius: 7,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#B88B3A',
          fillOpacity: 1,
        })
          .bindPopup(
            `<div style="font-size:12px;font-weight:600;color:#133828;">Start: ${escapeHtml(routeOriginLabel || 'Origin')}</div>`,
          )
          .addTo(routeLayer);
      }

      map.fitBounds(polyline.getBounds(), {padding: [40, 40]});
    }
  }, [panelTab, nearbyAnchor, nearbyRadiusKm, activeRoute, routeOriginCoords, routeOriginLabel]);

  const handleFitAllMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || visibleItems.length === 0) return;
    const bounds = L.latLngBounds(
      visibleItems.map((i) => [i.coordinates.lat, i.coordinates.lng] as [number, number]),
    );
    map.fitBounds(bounds, {padding: [36, 36], maxZoom: 12});
  }, [visibleItems]);

  const handleFocusItem = (item: MapMarkerItem) => {
    setSelectedId(item.id);
    if (mapRef.current) {
      mapRef.current.setView([item.coordinates.lat, item.coordinates.lng], 11, {
        animate: true,
      });
    }
  };

  const handleRequestGeolocation = (onLocated?: (coords: Coordinates) => void) => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser. Select an Indian city hub instead.');
      return;
    }
    setGeoLoading(true);
    setGeoMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setGeoLoading(false);
        setGeoMessage('GPS location detected.');
        if (onLocated) {
          onLocated(coords);
        } else if (mapRef.current) {
          mapRef.current.setView([coords.lat, coords.lng], 9, {animate: true});
        }
      },
      () => {
        setGeoLoading(false);
        setGeoMessage(
          'Location permission unavailable. Choose a city hub or destination below to explore nearby or calculate directions.',
        );
      },
      {enableHighAccuracy: true, timeout: 7000},
    );
  };

  const resolveOrigin = (): {label: string; coords: Coordinates} | null => {
    if (originSelection === 'user') {
      if (!userCoords) return null;
      return {label: 'Your GPS Location', coords: userCoords};
    }
    const hub = INDIA_TRAVEL_HUBS.find((h) => h.id === originSelection);
    if (hub) return {label: hub.label, coords: hub.coordinates};
    const item = allItems.find((i) => i.id === originSelection);
    if (item) return {label: item.title, coords: item.coordinates};
    return null;
  };

  const handleCalculateDirections = async (overrideOrigin?: {
    label: string;
    coords: Coordinates;
  }) => {
    if (!selectedItem) return;
    const origin = overrideOrigin ?? resolveOrigin();
    if (!origin) {
      handleRequestGeolocation((coords) => {
        setOriginSelection('user');
        void handleCalculateDirections({label: 'Your GPS Location', coords});
      });
      return;
    }

    setRouteLoading(true);
    setRouteOriginLabel(origin.label);
    setRouteOriginCoords(origin.coords);
    const result = await fetchOsrmDrivingRoute(origin.coords, selectedItem.coordinates);
    setActiveRoute(result);
    setRouteLoading(false);
  };

  const handleOpenDirectionsForSelected = () => {
    setPanelTab('directions');
    void handleCalculateDirections();
  };

  const handleExploreNearbyFromSelected = () => {
    if (!selectedItem) return;
    setNearbyAnchorId(selectedItem.id);
    setPanelTab('nearby');
    if (mapRef.current) {
      mapRef.current.setView(
        [selectedItem.coordinates.lat, selectedItem.coordinates.lng],
        8,
        {animate: true},
      );
    }
  };

  return (
    <section
      id="explore-map"
      aria-labelledby="map-section-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      {/* Header & Layer Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
            Interactive India Map · OpenStreetMap
          </p>
          <h2
            id="map-section-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[#133828] tracking-tight"
            style={{textWrap: 'balance'}}
          >
            Explore destinations, local businesses &amp; routes on the map.
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Filter map markers"
            className="flex flex-wrap items-center gap-1 bg-[#F3EDE2] p-1 rounded-lg border border-[#E7DEC9]"
          >
            {(
              [
                {key: 'all', label: `All (${allItems.length})`},
                {key: 'destination', label: `Destinations (${destinations.length})`},
                {key: 'business', label: `Businesses (${businesses.length})`},
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={layerFilter === opt.key}
                onClick={() => setLayerFilter(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer tabular-nums ${
                  layerFilter === opt.key
                    ? 'bg-[#133828] text-white'
                    : 'text-[#425349] hover:text-[#133828]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFitAllMarkers}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#133828] bg-white hover:bg-[#F3EDE2] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#997027]" />
            <span>Fit All Markers</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Map + Interactive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Leaflet OpenStreetMap Canvas */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-xl overflow-hidden border border-[#DFD5C3] bg-[#E7DEC9] shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)]">
            <div
              ref={mapContainerRef}
              className="w-full h-[380px] sm:h-[460px] lg:h-[560px]"
              aria-label="Interactive OpenStreetMap of Indian tourist destinations and local businesses"
            />
          </div>

          {/* Map Legend Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#495A50] px-1">
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-2 font-medium text-[#133828]">
                <span className="w-3 h-3 rounded-full bg-[#133828] border border-[#E2C583] inline-block" />
                Tourist Destinations
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-[#133828]">
                <span className="w-3 h-3 rounded-full bg-[#B88B3A] border border-white inline-block" />
                Local Businesses
              </span>
              {userCoords && (
                <span className="inline-flex items-center gap-2 font-medium text-[#1D4ED8]">
                  <span className="w-3 h-3 rounded-full bg-[#1D4ED8] border border-white inline-block" />
                  Your Location
                </span>
              )}
            </div>
            <span className="text-[#5A6C61]">Click any marker for details &amp; routes</span>
          </div>
        </div>

        {/* Right: Details / Nearby / Directions Panel */}
        <aside className="lg:col-span-5 bg-white border border-[#E7DEC9] rounded-xl flex flex-col overflow-hidden shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)]">
          {/* Panel Mode Tabs */}
          <div className="grid grid-cols-3 border-b border-[#E7DEC9] bg-[#F3EDE2]">
            {(
              [
                {key: 'details', label: 'Marker Details', icon: MapPin},
                {key: 'nearby', label: 'Explore Nearby', icon: Compass},
                {key: 'directions', label: 'Directions', icon: Navigation},
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = panelTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPanelTab(tab.key)}
                  className={`flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-[#133828] border-b-2 border-[#133828]'
                      : 'text-[#5A6C61] hover:text-[#133828]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6 flex-1 overflow-y-auto max-h-[540px]">
            {/* TAB 1: SELECTED MARKER DETAILS */}
            {panelTab === 'details' && selectedItem && (
              <div className="space-y-4">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#F3EDE2] border border-[#E7DEC9]">
                  <PortalImage
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    title={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[#997027]">
                      {selectedItem.kind === 'destination'
                        ? 'Tourist Destination'
                        : 'Local Business'}{' '}
                      · {selectedItem.category}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#133828] tabular-nums">
                      <Star className="w-3.5 h-3.5 text-[#B88B3A] fill-[#B88B3A]" />
                      {selectedItem.rating.toFixed(1)} ({selectedItem.reviewCount})
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-[#133828]">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-[#5A6C61] mt-1">{selectedItem.address}</p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[#F3EDE2]">
                  <div>
                    <dt className="text-[#5A6C61]">Hours</dt>
                    <dd className="font-medium text-[#133828] mt-0.5 tabular-nums">
                      {selectedItem.hours}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#5A6C61]">
                      {selectedItem.kind === 'destination' ? 'Entry Fee' : 'Typical Pricing'}
                    </dt>
                    <dd className="font-medium text-[#133828] mt-0.5 tabular-nums">
                      {selectedItem.priceOrFee}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs font-mono text-[#5A6C61] tabular-nums">
                  GPS: {selectedItem.coordinates.lat.toFixed(4)}° N,{' '}
                  {selectedItem.coordinates.lng.toFixed(4)}° E
                </p>

                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      selectedItem.kind === 'destination'
                        ? onViewDestinationDetails(selectedItem.raw)
                        : onViewBusinessDetails(selectedItem.raw)
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
                  >
                    <span>
                      View{' '}
                      {selectedItem.kind === 'destination' ? 'Destination' : 'Business'}{' '}
                      Details
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleOpenDirectionsForSelected}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#997027]" />
                      <span>Get Directions</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExploreNearbyFromSelected}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#133828] bg-[#FAF8F4] hover:bg-[#F3EDE2] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#997027]" />
                      <span>Explore Nearby</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXPLORE NEARBY DESTINATIONS & BUSINESSES */}
            {panelTab === 'nearby' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="nearby-anchor-select"
                      className="text-xs font-semibold text-[#133828]"
                    >
                      Explore Around
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleRequestGeolocation(() => setNearbyAnchorId('user'))
                      }
                      disabled={geoLoading}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#997027] hover:text-[#133828] cursor-pointer"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5" />
                      )}
                      <span>Use My GPS</span>
                    </button>
                  </div>

                  <select
                    id="nearby-anchor-select"
                    value={nearbyAnchorId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNearbyAnchorId(val);
                      const target = allItems.find((i) => i.id === val);
                      const hub = INDIA_TRAVEL_HUBS.find((h) => h.id === val);
                      const coords = target?.coordinates ?? hub?.coordinates;
                      if (coords && mapRef.current) {
                        mapRef.current.setView([coords.lat, coords.lng], 8, {
                          animate: true,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-xs text-[#17261E]"
                  >
                    {userCoords && (
                      <option value="user">My Current GPS Location</option>
                    )}
                    <optgroup label="Destinations & Businesses">
                      {allItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.title} ({i.subtitle})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Major Indian Travel Hubs">
                      {INDIA_TRAVEL_HUBS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <div>
                    <span className="block text-xs font-medium text-[#5A6C61] mb-1.5">
                      Search Radius
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[50, 150, 350, 0].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => setNearbyRadiusKm(rad)}
                          className={`py-1.5 text-xs font-medium rounded-md border cursor-pointer tabular-nums ${
                            nearbyRadiusKm === rad
                              ? 'bg-[#133828] text-white border-[#133828]'
                              : 'bg-[#FAF8F4] text-[#425349] border-[#D5C8AD]'
                          }`}
                        >
                          {rad === 0 ? 'All India' : `${rad} km`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {geoMessage && (
                  <p className="text-xs text-[#5A6C61] bg-[#F3EDE2] px-3 py-2 rounded-lg">
                    {geoMessage}
                  </p>
                )}

                <div className="pt-2 border-t border-[#E7DEC9] space-y-2.5">
                  <p className="text-xs font-semibold text-[#133828] tabular-nums">
                    {nearbyResults.length}{' '}
                    {nearbyResults.length === 1 ? 'location' : 'locations'} near{' '}
                    {nearbyAnchor.label}
                  </p>

                  {nearbyResults.length === 0 ? (
                    <p className="text-xs text-[#5A6C61] py-3">
                      No destinations or businesses within {nearbyRadiusKm} km. Try expanding
                      the radius to 350 km or All India.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {nearbyResults.map(({item, distanceKm}) => (
                        <div
                          key={item.id}
                          className="border border-[#E7DEC9] rounded-lg p-3 bg-[#FAF8F4] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#997027] truncate">
                              {item.kind === 'destination' ? 'Destination' : item.category}{' '}
                              · <span className="tabular-nums">{formatDistanceKm(distanceKm)} away</span>
                            </p>
                            <h4 className="text-sm font-semibold text-[#133828] truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-[#5A6C61] truncate">{item.subtitle}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleFocusItem(item);
                                setPanelTab('details');
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#133828] bg-white border border-[#D5C8AD] rounded-md cursor-pointer"
                            >
                              Focus
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                item.kind === 'destination'
                                  ? onViewDestinationDetails(item.raw)
                                  : onViewBusinessDetails(item.raw)
                              }
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#133828] rounded-md cursor-pointer"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DIRECTIONS & ROUTE PLANNER */}
            {panelTab === 'directions' && selectedItem && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#997027]">
                    Route To
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#133828] mt-0.5">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-[#5A6C61]">{selectedItem.address}</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="route-origin-select"
                      className="text-xs font-semibold text-[#133828]"
                    >
                      Starting Point
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleRequestGeolocation((coords) => {
                          setOriginSelection('user');
                          void handleCalculateDirections({
                            label: 'Your GPS Location',
                            coords,
                          });
                        })
                      }
                      disabled={geoLoading}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#997027] hover:text-[#133828] cursor-pointer"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5" />
                      )}
                      <span>Use My GPS</span>
                    </button>
                  </div>

                  <select
                    id="route-origin-select"
                    value={originSelection}
                    onChange={(e) => setOriginSelection(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-xs text-[#17261E]"
                  >
                    {userCoords && (
                      <option value="user">My Current GPS Location</option>
                    )}
                    <optgroup label="Indian Travel Hubs">
                      {INDIA_TRAVEL_HUBS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Portal Locations">
                      {allItems
                        .filter((i) => i.id !== selectedItem.id)
                        .map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.title} ({i.subtitle})
                          </option>
                        ))}
                    </optgroup>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={routeLoading}
                      onClick={() => void handleCalculateDirections()}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                    >
                      {routeLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 text-[#E2C583]" />
                      )}
                      <span>{routeLoading ? 'Calculating Route...' : 'Plot Route on Map'}</span>
                    </button>
                    {activeRoute && (
                      <button
                        type="button"
                        onClick={() => setActiveRoute(null)}
                        className="px-3 py-2.5 text-xs font-medium text-[#5A6C61] bg-[#F3EDE2] rounded-lg cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {geoMessage && (
                  <p className="text-xs text-[#5A6C61] bg-[#F3EDE2] px-3 py-2 rounded-lg">
                    {geoMessage}
                  </p>
                )}

                {activeRoute && (
                  <div className="bg-[#F3EDE2] border border-[#D5C8AD] rounded-xl p-4 space-y-2.5">
                    <p className="text-xs font-semibold text-[#997027]">
                      {activeRoute.isRoadRoute
                        ? 'OpenStreetMap Driving Route'
                        : 'Estimated Direct Route'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] text-[#5A6C61]">Distance</span>
                        <span className="font-display text-xl font-semibold text-[#133828] tabular-nums">
                          {formatDistanceKm(activeRoute.distanceKm)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-[#5A6C61]">Est. Drive Time</span>
                        <span className="font-display text-xl font-semibold text-[#133828] tabular-nums">
                          {formatDriveEstimate(activeRoute.durationMinutes)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#425349]">
                      From <strong>{routeOriginLabel}</strong> to{' '}
                      <strong>{selectedItem.title}</strong>
                    </p>
                  </div>
                )}

                <a
                  href={getOpenStreetMapDirectionsUrl(
                    routeOriginCoords ?? userCoords,
                    selectedItem.coordinates,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#133828] bg-white hover:bg-[#F3EDE2] border border-[#D5C8AD] rounded-lg transition-colors"
                >
                  <span>Open Turn-by-Turn in OpenStreetMap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
