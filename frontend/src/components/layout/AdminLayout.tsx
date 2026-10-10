'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  GraduationCap,
  Users,
  UserCheck,
  Clock,
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { getStoredUser, setStoredUser, UserSession } from '@/lib/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    const isAdmin = u.roles.some((r) =>
      ['ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r)
    );
    if (!isAdmin) {
      if (u.roles.includes('ROLE_TEACHER')) {
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
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Institution Profile', href: '/admin/institution', icon: Building2 },
    { label: 'Academic Terms', href: '/admin/terms', icon: Calendar },
    { label: 'Departments & Programs', href: '/admin/departments', icon: Layers },
    { label: 'Subject Catalog', href: '/admin/subjects', icon: BookOpen },
    { label: 'Course Offerings', href: '/admin/courses', icon: GraduationCap },
    { label: 'Student Directory', href: '/admin/students', icon: Users },
    { label: 'Faculty Directory', href: '/admin/teachers', icon: UserCheck },
    { label: 'Timetable Scheduler', href: '/admin/timetable', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading College Admin Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  CampusOS <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">Admin</span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{user?.institutionName || 'College Management'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Operations</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/40 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Institution:</span>
            <span className="font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              {user?.institutionName || 'College Node'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Operational Node Active
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
