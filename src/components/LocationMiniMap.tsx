import L from 'leaflet';
import {Crosshair, ExternalLink, Loader2, Navigation} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {
  escapeHtml,
  fetchOsrmDrivingRoute,
  formatDistanceKm,
  formatDriveEstimate,
  getOpenStreetMapDirectionsUrl,
  type Coordinates,
  type RouteResult,
} from '../utils/geo';

interface LocationMiniMapProps {
  title: string;
  subtitle: string;
  coordinates: Coordinates;
  pinColor?: 'green' | 'gold';
}

export function LocationMiniMap({
  title,
  subtitle,
  coordinates,
  pinColor = 'green',
}: LocationMiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const fill = pinColor === 'green' ? '#133828' : '#B88B3A';
    const icon = L.divIcon({
      className: 'swadesh-mini-pin',
      html: `<svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(12,36,25,0.35));">
        <path d="M14 1C7.37258 1 2 6.37258 2 13C2 21.25 14 33 14 33C14 33 26 21.25 26 13C26 6.37258 20.6274 1 14 1Z" fill="${fill}" stroke="#FFFFFF" stroke-width="2.2"/>
        <circle cx="14" cy="13" r="4.5" fill="#FAF8F4"/>
      </svg>`,
      iconSize: [28, 34],
      iconAnchor: [14, 32],
      popupAnchor: [0, -30],
    });

    L.marker([coordinates.lat, coordinates.lng], {icon, title})
      .bindPopup(
        `<div style="font-size:12px;"><strong style="color:#133828;">${escapeHtml(title)}</strong><div style="color:#5A6C61;">${escapeHtml(subtitle)}</div></div>`,
      )
      .addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, [title, subtitle, coordinates.lat, coordinates.lng, pinColor]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (route && route.points.length >= 2) {
      const line = L.polyline(route.points, {
        color: '#133828',
        weight: 4,
        dashArray: route.isRoadRoute ? undefined : '6 6',
      }).addTo(layer);
      map.fitBounds(line.getBounds(), {padding: [30, 30]});
    }
  }, [route]);

  const handlePlotRouteFromMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Browser geolocation unavailable. Use OpenStreetMap Directions below.');
      return;
    }
    setLoadingRoute(true);
    setGeoNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        setUserCoords(origin);
        void fetchOsrmDrivingRoute(origin, coordinates).then((res) => {
          setRoute(res);
          setLoadingRoute(false);
        });
      },
      () => {
        setLoadingRoute(false);
        setGeoNotice(
          'Location access denied. Open turn-by-turn directions directly on OpenStreetMap below.',
        );
      },
      {enableHighAccuracy: true, timeout: 7000},
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border border-[#D5C8AD] bg-[#E7DEC9]">
        <div
          ref={containerRef}
          className="w-full h-52 sm:h-60"
          aria-label={`OpenStreetMap location of ${title}`}
        />
      </div>

      {route && (
        <div className="flex items-center justify-between text-xs bg-[#F3EDE2] border border-[#E7DEC9] rounded-lg px-3 py-2 text-[#133828] tabular-nums">
          <span className="font-semibold">
            {formatDistanceKm(route.distanceKm)} from you
          </span>
          <span className="text-[#5A6C61]">
            Est. {formatDriveEstimate(route.durationMinutes)}
          </span>
        </div>
      )}

      {geoNotice && <p className="text-xs text-[#5A6C61]">{geoNotice}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handlePlotRouteFromMyLocation}
          disabled={loadingRoute}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
        >
          {loadingRoute ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-[#997027]" />
          )}
          <span>{loadingRoute ? 'Routing...' : 'Route From My GPS'}</span>
        </button>

        <a
          href={getOpenStreetMapDirectionsUrl(userCoords, coordinates)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#133828] bg-white hover:bg-[#F3EDE2] border border-[#D5C8AD] rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-[#997027]" />
          <span>OSM Directions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
