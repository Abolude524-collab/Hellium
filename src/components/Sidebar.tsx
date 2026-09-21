'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Target,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowRightLeft,
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Prevent background body scroll when mobile menu drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMobileNav = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Sticky Top Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-space-900/90 backdrop-blur-md border-b border-space-800 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMobileNav}
            className="p-2 rounded-xl bg-space-950 border border-space-800 text-gray-200 hover:text-purple-400 focus:outline-none shadow-sm active:scale-95 transition-transform"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-purple-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-montserrat text-lg font-bold tracking-tight text-white">
              Hellium
            </span>
          </Link>
        </div>

        <Link
          href="/profile"
          className="flex items-center space-x-2 bg-space-950 border border-space-800 px-2.5 py-1.5 rounded-xl hover:border-purple-500/40 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-space-900 flex items-center justify-center text-[10px] font-bold text-purple-300">
              {userInitial}
            </div>
          </div>
          <span className="text-[11px] font-mono text-purple-400 font-semibold">
            {userProfile?.baseCurrency || 'USD'}
          </span>
        </Link>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-space-950/80 backdrop-blur-sm transition-opacity"
          onClick={toggleMobileNav}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 md:z-40 h-screen w-64 bg-space-900 border-r border-space-800 flex flex-col justify-between transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-6">
          {/* Brand Logo & Name */}
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-purple-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-montserrat text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                Hellium
              </h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={clsx('w-2 h-2 rounded-full', {
                    'bg-emerald-400 animate-pulse': isOnline,
                    'bg-amber-400': !isOnline,
                  })}
                />
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {isOnline ? 'Cloud Synced' : 'Offline / Local'}
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3.5 px-4 py-3 rounded-xl font-montserrat text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-space-800/60'
                  )}
                >
                  <Icon
                    className={clsx('w-5 h-5 transition-colors', {
                      'text-purple-400': isActive,
                      'text-gray-400': !isActive,
                    })}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logged-in User Profile Scope */}
        <div className="p-6 border-t border-space-800/80">
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="flex items-center space-x-3 min-w-0 flex-1 hover:opacity-80 transition-opacity group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-[1px] flex-shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-space-900 flex items-center justify-center text-xs font-bold text-purple-300">
                  {userInitial}
                </div>
              </div>
              <div className="text-xs min-w-0 flex-1">
                <p className="font-medium text-gray-200 truncate group-hover:text-purple-300 transition-colors">
                  {displayName}
                </p>
                <p className="text-purple-400 text-[10px] font-mono">
                  Base: {userProfile?.baseCurrency || 'USD'}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-xl hover:bg-space-800 flex-shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
