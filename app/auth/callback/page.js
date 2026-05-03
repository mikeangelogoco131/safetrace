"use client";

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const [message, setMessage] = useState('Completing sign-in...');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finishAuth = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard';

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (userData?.user) {
          const { user } = userData;
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            email: user.email || '',
          });

          if (profileError) {
            console.error('Failed to sync profile during auth callback:', profileError.message);
          }
        }

        router.replace(next);
      } catch (err) {
        setError(err.message || 'Unable to finish authentication.');
        setMessage('');
      }
    };

    finishAuth();
  }, [router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="rounded-lg bg-white px-8 py-6 shadow-md text-center max-w-md">
        {message && <p className="text-slate-700">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={(
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="rounded-lg bg-white px-8 py-6 shadow-md text-center max-w-md text-slate-700">
            Completing sign-in...
          </div>
        </div>
      )}
    >
      <AuthCallbackContent />
    </Suspense>
  );
}