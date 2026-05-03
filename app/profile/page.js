"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserOrSession } from '@/lib/getCurrentUser';
import { User, Phone, Mail, KeyRound, Save } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [password, setPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { user, session } = await getUserOrSession();
    const effectiveUser = user || session?.user;
    if (effectiveUser) {
      setUserId(effectiveUser.id);
      const email = effectiveUser.email;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveUser.id)
        .single();

      if (data) {
        setProfile({ name: data.name || '', phone: data.phone || '', email: email });
      } else {
        setProfile(prev => ({ ...prev, email: email }));
      }
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!userId) return;
    
    setUpdatingProfile(true);
    setMessage({ type: '', text: '' });
    
    // Upsert will automatically insert if missing, or update if existing
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        name: profile.name, 
        phone: profile.phone, 
        email: profile.email 
      });
      
    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setUpdatingProfile(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setUpdatingPassword(true);
    setMessage({ type: '', text: '' });
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
    }
    setUpdatingPassword(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
        <p className="text-slate-500">Manage your personal information and account security.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <User size={20} className="mr-2 text-blue-600" />
            Personal Details
          </h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Read Only)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="pl-10 w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md cursor-not-allowed" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900" 
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={updatingProfile}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save size={18} />
                <span>{updatingProfile ? 'Saving...' : 'Update Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-max">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <KeyRound size={20} className="mr-2 text-slate-600" />
            Security Settings
          </h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-slate-900" 
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={updatingPassword || !password}
                className="w-full py-2.5 px-4 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
