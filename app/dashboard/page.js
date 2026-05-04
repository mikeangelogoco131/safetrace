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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Welcome, {profile?.name || "User"} 👋
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Stay safe and connected with your emergency contacts.</p>
      </div>

      {authChecked && !userId && (
        <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-amber-900 shadow-sm">
          <p className="font-bold flex items-center gap-2"><span>⚠️</span> Session Not Found</p>
          <p className="mt-2 text-sm">
            Your session wasn&apos;t found on this tab. Log in again at {currentOrigin}/login to activate the emergency button.
          </p>
        </div>
      )}
      
      <DashboardCards 
        contactsCount={stats.contacts} 
        alertsCount={stats.alerts} 
        lastAlert={stats.lastAlert} 
      />
      
      <EmergencyButton userId={userId} />
      
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/40 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Recent Alerts</h3>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">{recentAlerts.length}</span>
        </div>
        {recentAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 font-bold text-slate-800 text-sm">Date & Time</th>
                  <th className="py-4 px-6 font-bold text-slate-800 text-sm">Latitude</th>
                  <th className="py-4 px-6 font-bold text-slate-800 text-sm">Longitude</th>
                  <th className="py-4 px-6 font-bold text-slate-800 text-sm text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert, idx) => (
                  <tr key={alert.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition duration-150">
                    <td className="py-4 px-6 font-medium text-slate-900">{formatDateTime(alert.created_at)}</td>
                    <td className="py-4 px-6 font-mono text-sm text-slate-600">{alert.latitude.toFixed(6)}</td>
                    <td className="py-4 px-6 font-mono text-sm text-slate-600">{alert.longitude.toFixed(6)}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 shadow-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Dispatched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">📭 No emergency alerts yet</p>
            <p className="text-slate-400 text-sm mt-2">Your alert history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
