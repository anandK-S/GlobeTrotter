import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TripStop } from '../types';
import { MapPin, Navigation, Plane, Train, Bus, Car } from 'lucide-react';

// Custom Map Marker Icon Generator
function createCustomPin(index: number, isSelected: boolean = false) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${isSelected ? '#e11d48' : '#0ea5e9'};
        color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2.5px solid #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Helper to auto-fit map view bounds
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [positions, map]);

  return null;
}

interface MapViewProps {
  stops: TripStop[];
  selectedStopId?: string | null;
  onSelectStop?: (stop: TripStop) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  className = 'h-96 w-full rounded-2xl overflow-hidden'
}) => {
  // Filter valid coordinates
  const validStops = stops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number' && s.lat !== 0 && s.lng !== 0);
  const positions: [number, number][] = validStops.map(s => [s.lat, s.lng]);

  const defaultCenter: [number, number] = validStops.length > 0 ? [validStops[0].lat, validStops[0].lng] : [48.8566, 2.3522]; // Paris default

  return (
    <div className={`relative ${className} shadow-md border border-slate-200 dark:border-slate-800`}>
      <MapContainer
        center={defaultCenter}
        zoom={validStops.length > 1 ? 4 : 6}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validStops.length > 0 && <FitBounds positions={positions} />}

        {/* Connecting route polyline */}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#0ea5e9',
              weight: 3.5,
              dashArray: '8, 8',
              opacity: 0.85
            }}
          />
        )}

        {/* Stop Markers */}
        {validStops.map((stop, idx) => (
          <Marker
            key={stop.id || idx}
            position={[stop.lat, stop.lng]}
            icon={createCustomPin(idx, stop.id === selectedStopId)}
            eventHandlers={{
              click: () => onSelectStop && onSelectStop(stop)
            }}
          >
            <Popup>
              <div className="p-3 min-w-[200px] text-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                    Stop #{idx + 1}
                  </span>
                  <span className="text-xs text-slate-500 capitalize font-medium">
                    {stop.transport_mode}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 leading-snug">
                  {stop.city_name}, {stop.country}
                </h4>
                {stop.arrival_date && (
                  <p className="text-xs text-slate-500 mt-1">
                    📅 {stop.arrival_date} {stop.departure_date ? `— ${stop.departure_date}` : ''}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Activities:</span>
                  <span className="text-sky-600">{stop.activities?.length || 0} planned</span>
                </div>
                {(stop.stay_cost > 0 || stop.transport_cost > 0) && (
                  <div className="flex items-center justify-between text-xs font-semibold mt-1">
                    <span className="text-slate-500">Stop Est:</span>
                    <span className="text-emerald-600">${(stop.stay_cost || 0) + (stop.transport_cost || 0)}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating map legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 shadow-md text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
        <span>{validStops.length} Destinations Connected</span>
      </div>
    </div>
  );
};
