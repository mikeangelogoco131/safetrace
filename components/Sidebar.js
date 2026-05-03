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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-full flex flex-col transition-[width] duration-200 ease-in-out`}>
      <div className={`${isCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'} h-20 border-b border-slate-800 flex items-center gap-3`}>
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-blue-500 whitespace-nowrap">SafeTrace</h1>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <ToggleIcon size={20} />
        </button>
      </div>
      <nav className={`${isCollapsed ? 'px-3' : 'px-4'} flex-1 py-4 space-y-2 overflow-y-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-md transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`${isCollapsed ? 'p-3' : 'p-4'} border-t border-slate-800`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 w-full text-left text-slate-300 hover:bg-red-500 hover:text-white rounded-md transition`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
