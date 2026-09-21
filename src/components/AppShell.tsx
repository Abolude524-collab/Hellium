'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen max-w-full overflow-x-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content View Container */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 max-w-full">
          <main className="flex-1 px-3.5 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto w-full mt-16 md:mt-0 min-w-0">{children}</main>

          {/* Footer */}
          <footer className="p-6 text-center text-xs text-gray-500 border-t border-space-900">
            <p>Hellium Finance &copy; {new Date().getFullYear()} &bull; Built with Next.js & Firebase</p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AppShell;
