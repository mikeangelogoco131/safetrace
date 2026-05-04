"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Home, TriangleAlert, Users, Bell, Map, User, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Do not display sidebar on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Emergency', href: '/emergency', icon: TriangleAlert },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white h-full flex flex-col transition-[width] duration-300 ease-in-out shadow-xl`}>
      <div className={`${isCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'} h-20 border-b border-indigo-700/40 flex items-center gap-3 backdrop-blur-sm`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">ST</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">SafeTrace</h1>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition duration-200 hover:bg-indigo-700/50 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-indigo-900"
        >
          <ToggleIcon size={20} />
        </button>
      </div>
      <nav className={`${isCollapsed ? 'px-3' : 'px-4'} flex-1 py-6 space-y-2 overflow-y-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-lg transition duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-indigo-700/40 hover:text-cyan-300'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`${isCollapsed ? 'p-3' : 'p-4'} border-t border-indigo-700/40 bg-indigo-900/30 backdrop-blur-sm`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 w-full text-left text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
