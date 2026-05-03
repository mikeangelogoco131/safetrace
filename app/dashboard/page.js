"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';
import DashboardCards from '@/components/DashboardCards';
import EmergencyButton from '@/components/EmergencyButton';
import { formatDateTime } from '@/utils/formatDateTime';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({ contacts: 0, alerts: 0, lastAlert: null });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    setCurrentOrigin(window.location.origin);

    async function fetchData() {
      const { user, session } = await getUserOrSession();
      const effectiveUser = user || session?.user;

      setAuthChecked(true);

      if (effectiveUser) {
        setUserId(effectiveUser.id);
        
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', effectiveUser.id)
          .single();
          
        setProfile(profileData);
        
        // Fetch Contact Count
        const { count: contactsCount } = await supabase
          .from('emergency_contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', effectiveUser.id);
          
        // Fetch Alerts
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .order('created_at', { ascending: false });
          
        setStats({
          contacts: contactsCount || 0,
          alerts: alertsData?.length || 0,
          lastAlert: alertsData?.length > 0 ? formatDateTime(alertsData[0].created_at, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null
        });
        
        setRecentAlerts(alertsData?.slice(0, 5) || []);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {profile?.name || "User"}
        </h1>
        <p className="text-slate-500 mt-2">Manage your safety traces and emergency contacts seamlessly.</p>
      </div>

      {authChecked && !userId && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">No active sign-in was found on this browser tab.</p>
          <p className="mt-1 text-sm">
            If you signed in on a different port or tab, log in again here: {currentOrigin}/login.
            The emergency button will stay disabled until this tab has a Supabase session.
          </p>
        </div>
      )}
      
      <DashboardCards 
        contactsCount={stats.contacts} 
        alertsCount={stats.alerts} 
        lastAlert={stats.lastAlert} 
      />
      
      <EmergencyButton userId={userId} />
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Alerts</h3>
        {recentAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Latitude</th>
                  <th className="py-3 px-4 font-semibold">Longitude</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map(alert => (
                  <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      {formatDateTime(alert.created_at)}
                    </td>
                    <td className="py-3 px-4">{alert.latitude.toFixed(6)}</td>
                    <td className="py-3 px-4">{alert.longitude.toFixed(6)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Dispatched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">No emergency alerts recorded yet.</p>
        )}
      </div>
    </div>
  );
}
