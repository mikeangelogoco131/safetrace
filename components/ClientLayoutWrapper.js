"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isPublicPage && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 ${isPublicPage ? 'w-full h-full' : ''}`}>
        {!isPublicPage && <Navbar />}
        <main className={`flex-1 overflow-auto ${isPublicPage ? '' : 'p-4 md:p-6'}`}>
          {children}
        </main>
      </div>
    </>
  );
}
