"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserOrSession } from '@/lib/getCurrentUser';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { user, session } = await getUserOrSession();
      const effectiveUser = user || session?.user;
      if (effectiveUser) {
        setIsAuthenticated(true);
        router.push('/dashboard');
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-slate-800">Loading SafeTrace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">ST</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">SafeTrace</h1>
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-indigo-600 font-semibold transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition duration-200 font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <h2 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
            Emergency Help, <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Faster Than Ever</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-light">
            Share your precise location instantly with trusted emergency contacts. One tap, real-time dispatch, guaranteed delivery.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition duration-300 font-bold text-lg transform hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="border-2 border-indigo-600 text-indigo-600 px-10 py-4 rounded-xl hover:bg-indigo-50 transition duration-300 font-bold text-lg transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/40 hover:shadow-2xl hover:border-blue-300/60 transition duration-300 transform hover:-translate-y-2">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-Time Location</h3>
            <p className="text-slate-600 leading-relaxed">Share your precise GPS location instantly with trusted emergency contacts via SMS and email.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/40 hover:shadow-2xl hover:border-red-300/60 transition duration-300 transform hover:-translate-y-2">
            <div className="text-6xl mb-4">🚨</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">One-Tap Emergency</h3>
            <p className="text-slate-600 leading-relaxed">Trigger emergency alerts with a single button. Fast. Reliable. Always available, even offline mode support.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/40 hover:shadow-2xl hover:border-green-300/60 transition duration-300 transform hover:-translate-y-2">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Multi-Channel Alerts</h3>
            <p className="text-slate-600 leading-relaxed">Your contacts receive immediate notifications via SMS and email with your location, time, and emergency details.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-16 mb-20 text-white">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-lg text-blue-100">Always Available</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">⚡</div>
              <p className="text-lg text-blue-100">Instant Notifications</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">🔒</div>
              <p className="text-lg text-blue-100">End-to-End Secure</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up with your email and phone' },
              { num: '2', title: 'Add Contacts', desc: 'Add your trusted emergency contacts' },
              { num: '3', title: 'One Tap Alert', desc: 'Press the emergency button anytime' },
              { num: '4', title: 'Instant Dispatch', desc: 'Contacts notified with your location' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-slate-200/40 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 px-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-lg">
          <h3 className="text-4xl font-bold text-slate-900 mb-4">Ready to Stay Safe?</h3>
          <p className="text-xl text-slate-600 mb-10 font-light">Join thousands of users protecting themselves with SafeTrace</p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-12 py-5 rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition duration-300 font-bold text-lg transform hover:scale-105"
          >
            Sign Up Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-indigo-900 text-slate-300 py-12 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">SafeTrace</h4>
              <p className="text-sm">Keeping you safe, every moment.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SafeTrace. All rights reserved. Emergency location sharing made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
