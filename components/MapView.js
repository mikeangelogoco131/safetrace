"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapView({ alerts, currentLocation }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Fix Leaflet's default icon path issues when used with Next.js/Webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-full w-full items-center justify-center bg-slate-100 rounded-lg">Initializing Map...</div>;

  // Use the most recent alert for map centering, default to roughly US center
  const recentAlert = alerts?.length > 0 ? alerts[0] : null;
  const centerPosition = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : recentAlert 
      ? [recentAlert.latitude, recentAlert.longitude] 
      : [39.8283, -98.5795];
  const defaultZoom = (currentLocation || recentAlert) ? 14 : 4;

  return (
    <div className="h-full w-full relative z-0 rounded-lg overflow-hidden">
      <MapContainer 
        center={centerPosition} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentLocation && (
          <CircleMarker 
            center={[currentLocation.lat, currentLocation.lng]} 
            radius={10} 
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-blue-600 mb-1">Your Current Location</p>
                <p className="text-slate-600">
                  <strong>Lat:</strong> {currentLocation.lat.toFixed(6)}<br />
                  <strong>Lng:</strong> {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {alerts?.map((alert) => (
          <Marker key={alert.id} position={[alert.latitude, alert.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-slate-800 mb-1">Emergency Alert</p>
                <p className="text-slate-600 mb-1">
                  <strong>Date:</strong> {new Date(alert.created_at).toLocaleDateString()}
                </p>
                <p className="text-slate-600 mb-1">
                  <strong>Time:</strong> {new Date(alert.created_at).toLocaleTimeString()}
                </p>
                <p className="text-slate-600">
                  <strong>Lat:</strong> {alert.latitude.toFixed(6)}<br />
                  <strong>Lng:</strong> {alert.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
