"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const session = data?.session || (await supabase.auth.getSession())?.data?.session;
      if (!session) {
        throw new Error('Login succeeded but the session was not established. Please try again.');
      }

      window.location.assign('/dashboard');
    } catch (err) {
      const message = err.message || 'Unable to sign in.';
      if (message.toLowerCase().includes('email not confirmed') || message.toLowerCase().includes('email not verified')) {
        setError('Please verify your email address before logging in. Check your inbox for the confirmation link.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">SafeTrace Login</h1>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-600" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot your password?</Link>
        </div>
      </div>
    </div>
  );
}