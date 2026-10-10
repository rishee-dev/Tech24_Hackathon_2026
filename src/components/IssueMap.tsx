import { useEffect, useRef, useState } from 'react';
import { getRouteAPI } from '@/lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue, STATUS_LABELS } from '@/lib/types';
import decodeFlexiblePolyline from '@/lib/flexiblePolyline';
import { StatusBadge, CategoryBadge } from './StatusBadge';

// Fix default marker icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const statusIcons = {
  reported: createIcon('hsl(38 92% 50%)'),
  'in-progress': createIcon('hsl(199 89% 48%)'),
  resolved: createIcon('hsl(142 71% 45%)'),
};

interface IssueMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
  onIssueClick?: (issue: Issue) => void;
  selectedIssue?: Issue | null;
}

function MapController({ center, selectedIssue }: { center: [number, number]; selectedIssue?: Issue | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedIssue) {
      map.flyTo([selectedIssue.location.lat, selectedIssue.location.lng], 15, {
        duration: 0.5,
      });
    }
  }, [selectedIssue, map]);

  return null;
}

export function IssueMap({ 
  issues, 
  center = [40.7589, -73.9851], 
  zoom = 12,
  onIssueClick,
  selectedIssue 
}: IssueMapProps) {
  const [routeInfo, setRouteInfo] = useState<{ distance?: number; duration?: number; origin?: [number, number] } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [polylineCoords, setPolylineCoords] = useState<Array<[number, number]>>([]);
  
  // Fetch route summary when an issue is selected
  useEffect(() => {
    let cancelled = false;
    async function fetchRoute() {
      if (!selectedIssue) {
        setRouteInfo(null);
        return;
      }

      setLoadingRoute(true);
      // Try to get user location
      const getPosition = () => new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      });

      try {
        const pos = await getPosition();
        const origin = pos ? `${pos.coords.latitude},${pos.coords.longitude}` : `${center[0]},${center[1]}`;

        const res = await getRouteAPI({ origin, destination: `${selectedIssue.location.lat},${selectedIssue.location.lng}`, transportMode: 'car', return: 'polyline,summary' });

        // Try to extract distance/duration safely from HERE response
        const route = res?.routes?.[0];
        const section = route?.sections?.[0];
        const summary = section?.summary || route?.summary;
        const distance = summary?.length || summary?.distance || undefined;
        const duration = summary?.duration || undefined;

        // polyline may be in section.polyline or route.polyline (flexible polyline)
        const polyEnc = section?.polyline || route?.polyline || null;
        let decoded: Array<[number, number]> = [];
        if (polyEnc) {
          try {
            decoded = decodeFlexiblePolyline(polyEnc);
          } catch (e) {
            console.warn('polyline decode failed', e);
          }
        }

        if (!cancelled) {
          setRouteInfo({ distance, duration, origin: pos ? [pos.coords.latitude, pos.coords.longitude] : undefined });
          setPolylineCoords(decoded || []);
        }
      } catch (e) {
        console.error('getRouteAPI error', e);
        if (!cancelled) setRouteInfo(null);
      } finally {
        if (!cancelled) setLoadingRoute(false);
      }
    }

    fetchRoute();
    return () => { cancelled = true; };
  }, [selectedIssue, center]);
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} selectedIssue={selectedIssue} />
        
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
            icon={statusIcons[issue.status]}
            eventHandlers={{
              click: () => onIssueClick?.(issue),
            }}
          >
            <Popup className="issue-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-2">{issue.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <StatusBadge status={issue.status} />
                  <CategoryBadge category={issue.category} />
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                <p className="text-xs text-gray-500">{issue.location.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {/* Route info overlay (rendered inside map so it overlays correctly) */}
        {selectedIssue && (
          <div className="absolute top-4 right-4 z-[1100]">
            <div className="bg-card/95 backdrop-blur p-3 rounded-lg shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Route to selected issue</p>
                  {loadingRoute ? (
                    <p className="text-sm font-medium">Calculating route…</p>
                  ) : routeInfo ? (
                    <p className="text-sm font-medium">{routeInfo.distance ? `${(routeInfo.distance/1000).toFixed(1)} km · ` : ''}{routeInfo.duration ? `${Math.round(routeInfo.duration/60)} min` : ''}</p>
                  ) : (
                    <p className="text-sm font-medium">No route available</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={
                      routeInfo && routeInfo.origin
                        ? `https://wego.here.com/directions/car/${routeInfo.origin[0]},${routeInfo.origin[1]}/${selectedIssue.location.lat},${selectedIssue.location.lng}`
                        : `https://wego.here.com/directions/car/${selectedIssue.location.lat},${selectedIssue.location.lng}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        {polylineCoords?.length > 0 && (
          <Polyline
            positions={polylineCoords.map(([lat, lng]) => [lat, lng]) as any}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85 }}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-medium text-foreground mb-2">Status Legend</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: status === 'reported' 
                    ? 'hsl(38 92% 50%)' 
                    : status === 'in-progress' 
                    ? 'hsl(199 89% 48%)' 
                    : 'hsl(142 71% 45%)' 
                }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
