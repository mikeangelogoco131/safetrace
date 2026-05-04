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
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">ST</div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">SafeTrace</h1>
            <p className="text-slate-500 text-sm mt-1">Create your account</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex gap-3">
            <span className="text-lg">⚠️</span>
            <div>{error}</div>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-500 transition duration-200" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+1 (555) 000-0000"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-500 transition duration-200" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-500 transition duration-200" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-500 transition duration-200" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition duration-200 disabled:opacity-50 font-semibold mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-center text-sm text-slate-600 mb-3">
            Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">Sign in</Link>
          </div>
          <div className="text-center text-xs text-slate-500">
            A verification link will be sent to your email after signup.
          </div>
        </div>
      </div>
    </div>
  );
}
