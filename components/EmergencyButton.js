"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';
import { useRouter } from 'next/navigation';
import { TriangleAlert, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function EmergencyButton({ userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const router = useRouter();

  const getStatusStyles = (status) => {
    if (status === 'sent') {
      return {
        icon: CheckCircle2,
        className: 'bg-green-50 text-green-800 border-green-200',
        label: 'Sent',
      };
    }

    if (status === 'failed') {
      return {
        icon: XCircle,
        className: 'bg-red-50 text-red-800 border-red-200',
        label: 'Failed',
      };
    }

    return {
      icon: Info,
      className: 'bg-amber-50 text-amber-900 border-amber-200',
      label: 'Skipped',
    };
  };

  const handleEmergency = async () => {
    setLoading(true);
    setError(null);
    setDeliveryResult(null);

    // Fetch current user/session at start
    let { user, session } = await getUserOrSession();
    
    // Fallback: check localStorage for session if getUserOrSession failed
    if (!session && typeof window !== 'undefined') {
      try {
        const storedSession = localStorage.getItem('sb-rtpectlhwrdeyhglbadu-auth-token');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          session = parsed;
          user = parsed.user;
        }
      } catch (err) {
        console.warn('Failed to read session from localStorage:', err);
      }
    }

    const effectiveUser = user || session?.user;
    const accessToken = session?.access_token;

    if (!effectiveUser) {
      setError("You must be signed in to trigger an emergency alert.");
      setLoading(false);
      return;
    }

    if (!accessToken) {
      setError("Unable to obtain authorization token. Please sign in again.");
      setLoading(false);
      return;
    }

    // Request GPS Permission & Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          const capturedAt = new Date(position.timestamp || Date.now()).toISOString();

          try {
            const response = await fetch('/api/emergency', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                lat,
                lng,
                accuracy,
                capturedAt,
              })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(payload.error || 'Unable to dispatch emergency alert.');
            }

            setDeliveryResult(payload);
            router.refresh();
            
          } catch (err) {
            setError(err.message || "Failed to save alert.");
          } finally {
            setLoading(false);
          }
        },
        (geoError) => {
          const geoMessages = {
            1: 'Location access was denied. Enable permissions in your browser settings and try again.',
            2: 'Your device could not determine a location right now. Move to a clearer area and retry.',
            3: 'Location lookup timed out. Retry once the GPS signal is stable.',
          };

          setError(geoMessages[geoError?.code] || 'Failed to obtain location. Please enable GPS permissions and try again.');
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

      {deliveryResult && (
        <div className="mb-6 w-full max-w-2xl rounded-md border border-slate-200 bg-slate-50 p-4 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{deliveryResult.message}</p>
              <p className="mt-1 text-sm text-slate-700">
                Alert ID: {deliveryResult.alertId}
              </p>
            </div>
            {deliveryResult.summary && (
              <div className="shrink-0 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                {deliveryResult.summary.sent}/{deliveryResult.summary.total} sent
              </div>
            )}
          </div>

          {deliveryResult.contacts?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {deliveryResult.contacts.map((contact) => (
                <div key={contact.contactId} className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-900">{contact.contactName || 'Emergency contact'}</p>
                  <div className="mt-2 space-y-2">
                    {contact.statuses?.map((status, index) => {
                      const StatusIcon = getStatusStyles(status.status).icon;
                      const statusStyles = getStatusStyles(status.status);

                      return (
                        <div
                          key={`${status.channel}-${index}`}
                          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${statusStyles.className}`}
                        >
                          <StatusIcon size={16} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold capitalize">
                              {status.channel}: {statusStyles.label}
                            </p>
                            {status.destination && <p>{status.destination}</p>}
                            {status.message && <p className="mt-1">{status.message}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-700">
              No emergency contacts are saved yet. Add a contact to send SMS or email notifications.
            </p>
          )}
        </div>
      )}
      
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
