"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';
import { formatDate, formatTime } from '@/utils/formatDateTime';
import Link from 'next/link';
import { Map, MapPin } from 'lucide-react';

export default function AlertsHistory() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionAndAlerts();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alert History</h1>
          <p className="text-slate-500">Log of all previously dispatched emergency coordinate transmissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 min-h-[200px] flex items-center justify-center">Loading alert history...</div>
        ) : alerts.length > 0 ? (
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold">Date & Time</th>
                <th className="py-4 px-6 font-semibold">Latitude</th>
                <th className="py-4 px-6 font-semibold">Longitude</th>
                <th className="py-4 px-6 font-semibold text-right">View Map</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50 transition last:border-0">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">
                      {formatDate(alert.created_at)}
                    </div>
                    <div className="text-sm font-semibold text-slate-500">
                      {formatTime(alert.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-6">{alert.latitude.toFixed(6)}</td>
                  <td className="py-4 px-6">{alert.longitude.toFixed(6)}</td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/map`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition font-medium"
                    >
                      <MapPin size={16} />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Map size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No alerts dispatched</h3>
            <p className="text-slate-500 max-w-md mx-auto">Your alert history is empty. When you trigger the emergency button, the recorded GPS coordinates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
