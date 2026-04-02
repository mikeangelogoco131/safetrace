"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { TriangleAlert, Loader2 } from 'lucide-react';

export default function EmergencyButton({ userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleEmergency = async () => {
    if (!userId) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Request GPS Permission & Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // 2. Save location to Supabase alerts table
            const { error: dbError } = await supabase
              .from('alerts')
              .insert([
                { user_id: userId, latitude: lat, longitude: lng }
              ]);

            if (dbError) throw dbError;

            // 3. Fetch contacts and profile, then simulate sending messages
            const [{ data: contacts }, { data: profile }] = await Promise.all([
              supabase.from('emergency_contacts').select('*').eq('user_id', userId),
              supabase.from('profiles').select('name').eq('id', userId).single()
            ]);

            const userName = profile?.name || 'A SafeTrace user';
            const alertMessage = `EMERGENCY ALERT: ${userName} has activated an emergency. Live Location: https://maps.google.com/?q=${lat},${lng}`;

            if (contacts && contacts.length > 0) {
              console.log("============= EMERGENCY DISPATCH STARTED =============");
              
              // Call our custom /api/emergency endpoint for real SMS/Email dispatching
              try {
                const response = await fetch('/api/emergency', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contacts,
                    userName,
                    lat,
                    lng
                  })
                });

                if (response.ok) {
                  alert(`Emergency successful! Alert securely sent to ${contacts.length} contact(s) via Text/Email.`);
                } else {
                  console.error("API Fetch Error", await response.json());
                  alert("GPS saved! However, we couldn't reach Twilio/Resend. Check your API keys.");
                }
              } catch (dispatchError) {
                console.error("Network Error", dispatchError);
              }
              
              console.log("============= EMERGENCY DISPATCH COMPLETE =============");
            } else {
              alert("Emergency activated! But you have no contacts saved to notify.");
            }

            // 4. Redirect to Map page
            router.push('/map');
            
          } catch (err) {
            setError(err.message || "Failed to save alert.");
            setLoading(false);
          }
        },
        (geoError) => {
          setError("Failed to obtain location. Please enable GPS permissions.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-slate-200 mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Emergency Activation</h3>
      <p className="text-slate-500 text-center mb-8 max-w-md">
        Press the button below to instantly record your GPS location and dispatch an emergency alert to your contacts.
      </p>
      
      {error && <p className="mb-4 text-red-500 font-medium">{error}</p>}
      
      <button 
        onClick={handleEmergency}
        disabled={loading}
        className={`relative flex items-center justify-center w-48 h-48 rounded-full shadow-xl transition-transform active:scale-95
          ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 animate-[pulse_3s_infinite] hover:animate-none'}
        `}
      >
        <div className="absolute w-56 h-56 rounded-full bg-red-100 opacity-50 -z-10 animate-ping"></div>
        {loading ? (
          <Loader2 size={64} className="text-white animate-spin" />
        ) : (
          <TriangleAlert size={80} className="text-white" fill="white" />
        )}
      </button>
      <p className="mt-8 text-xl font-bold text-red-600 tracking-wider">TAP FOR EMERGENCY</p>
    </div>
  );
}
