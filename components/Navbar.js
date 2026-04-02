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
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 w-full relative">
      <div className="flex-1 flex items-center">
        <h2 className="text-xl items-center font-semibold text-slate-800">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Placeholder for User Avatar/Profile Widget if desired */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          U
        </div>
      </div>
    </header>
  );
}
