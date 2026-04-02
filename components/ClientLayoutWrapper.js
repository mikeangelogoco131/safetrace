"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 ${isAuthPage ? 'w-full h-full' : ''}`}>
        {!isAuthPage && <Navbar />}
        <main className={`flex-1 overflow-auto ${isAuthPage ? '' : 'p-4 md:p-6'}`}>
          {children}
        </main>
      </div>
    </>
  );
}
