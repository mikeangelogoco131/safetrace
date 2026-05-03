"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-slate-100 rounded-lg animate-pulse text-slate-500 font-medium">Loading Interactive Map...</div>
});

export default function MapPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchSessionAndAlerts = async () => {
      const { user, session } = await getUserOrSession();
      const effectiveUser = user || session?.user;

      if (effectiveUser) {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setAlerts(data);
        }
      }
      setLoading(false);
    };

    fetchSessionAndAlerts();

    // Request GPS permission and fetch the user's current location when the map page mounts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        (error) => {
          console.warn("Could not obtain current location:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex justify-between flex-wrap gap-4 items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Map View</h1>
          <p className="text-slate-500">Live tracking and recent emergency alert locations displayed globally.</p>
        </div>
        <div className="bg-white rounded-md border border-slate-200 px-4 py-2 text-sm shadow-sm inline-flex items-center space-x-2">
          {!loading && (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-medium text-slate-700">{alerts.length} Marker(s) Loaded</span>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex-1 min-h-[500px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 bg-slate-50 rounded-md">
            Querying location coordinates...
          </div>
        ) : (
          <MapView alerts={alerts} currentLocation={currentLocation} />
        )}
      </div>
    </div>
  );
}
