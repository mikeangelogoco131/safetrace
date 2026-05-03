"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            name,
            phone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.session && authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name,
              phone,
              email: authData.user.email
            },
          ]);
        
        if (profileError) throw profileError;

        router.push('/dashboard');
        return;
      }

      setError('Registration complete. Check your email to verify your account before signing in.');
    } catch (err) {
      setError(err.message.includes('Email not confirmed') ? 'Please verify your email before signing in.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">SafeTrace Register</h1>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input 
              type="tel" 
              placeholder="Enter your phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log In</Link>
        </div>
        <div className="mt-2 text-center text-sm text-slate-500">
          After signing up, use the verification link in your inbox before logging in.
        </div>
      </div>
    </div>
  );
}
