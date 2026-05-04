"use client";

import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Do not display navbar on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/emergency': return 'Emergency Control';
      case '/contacts': return 'Emergency Contacts';
      case '/alerts': return 'Alert History';
      case '/map': return 'Map View';
      case '/profile': return 'User Profile';
      default: return 'SafeTrace';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-6 z-10 w-full relative border-b border-slate-200/50">
      <div className="flex-1 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">ST</div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{getPageTitle()}</h2>
          <p className="text-xs text-slate-500 font-medium">SafeTrace</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden md:block w-px h-6 bg-slate-200"></div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-lg hover:shadow-xl transition cursor-pointer">
          U
        </div>
      </div>
    </header>
  );
}
