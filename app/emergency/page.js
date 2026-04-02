"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import EmergencyButton from '@/components/EmergencyButton';

export default function EmergencyPage() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    fetchSession();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-full flex flex-col justify-center pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Emergency Control</h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Use this page to immediately broadcast your GPS coordinates to the SafeTrace map.
        </p>
      </div>
      
      <EmergencyButton userId={userId} />
    </div>
  );
}