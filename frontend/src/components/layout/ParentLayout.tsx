'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartHandshake,
  Calendar,
  Clock,
  Award,
  BookOpen,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Bell,
  Users
} from 'lucide-react';
import { getStoredUser, setStoredUser, UserSession } from '@/lib/api';

interface ParentLayoutProps {
  children: React.ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.push('/');
      return;
    }
    const isParent = u.roles.some((r) => ['ROLE_PARENT', 'PARENT'].includes(r));
    if (!isParent) {
      if (u.roles.includes('ROLE_COLLEGE_ADMIN')) {
        router.push('/admin/dashboard');
      } else if (u.roles.includes('ROLE_TEACHER')) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      return;
    }
    setUser(u);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    setStoredUser(null);
    router.push('/');
  };

  const navItems = [
    { label: 'Parent Dashboard', href: '/parent/dashboard', icon: HeartHandshake },
    { label: 'Attendance & Alerts', href: '/parent/attendance', icon: Calendar },
    { label: 'Marks & Academic Progress', href: '/parent/marks', icon: Award },
    { label: 'Class Timetable', href: '/parent/timetable', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying Parent Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f24]/90 backdrop-blur-xl flex flex-col fixed inset-y-0 z-30">
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-300 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#080d21] rounded-[9px] flex items-center justify-center text-white font-extrabold text-sm">
              P
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              CAMPUSOS
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Parent & Guardian Portal
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
            {user?.firstName?.[0] || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Guardian Link
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-slate-800/80 bg-[#070b19]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>CampusOS</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-medium capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-emerald-400" />
              <span>Official Academic Records</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
