"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import DashboardCards from '@/components/DashboardCards';
import EmergencyButton from '@/components/EmergencyButton';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({ contacts: 0, alerts: 0, lastAlert: null });
  const [recentAlerts, setRecentAlerts] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserId(session.user.id);
        
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setProfile(profileData);
        
        // Fetch Contact Count
        const { count: contactsCount } = await supabase
          .from('emergency_contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
          
        // Fetch Alerts
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
          setStats({
          contacts: contactsCount || 0,
          alerts: alertsData?.length || 0,
          lastAlert: alertsData?.length > 0 ? new Date(alertsData[0].created_at).toLocaleString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
          }) : null
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
                      {new Date(alert.created_at).toLocaleString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric', 
                        hour: 'numeric', minute: '2-digit', second: '2-digit' 
                      })}
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
