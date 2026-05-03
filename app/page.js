"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { user, session } = await getUserOrSession();
      const effectiveUser = user || session?.user;
      if (effectiveUser) router.push('/dashboard');
      else router.push('/login');
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-xl text-slate-800">Loading SafeTrace...</div>
    </div>
  );
}
