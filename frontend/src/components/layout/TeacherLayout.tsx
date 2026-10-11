'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  FileCheck2,
  HelpCircle,
  FolderDown,
  Presentation,
  Award,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users
} from 'lucide-react';
import { getStoredUser, setStoredUser } from '@/lib/api';
import { cn } from '@/lib/utils';

const TEACHER_NAV = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/classrooms', label: 'My Classrooms & Codes', icon: Users },
  { href: '/teacher/attendance', label: 'Take Attendance', icon: UserCheck },
  { href: '/teacher/assignments', label: 'Assignments & Grading', icon: FileCheck2 },
  { href: '/teacher/quizzes', label: 'Quizzes & Banks', icon: HelpCircle },
  { href: '/teacher/resources', label: 'Resource Hub', icon: FolderDown },
  { href: '/teacher/slides', label: 'Slide Deck Studio', icon: Presentation },
  { href: '/teacher/gradebook', label: 'Gradebook', icon: Award },
  { href: '/teacher/ai-assistant', label: 'Teacher AI Co-pilot', icon: Sparkles },
];

export const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.push('/');
      return;
    }
    if (!current.roles.includes('ROLE_TEACHER')) {
      if (
        current.roles.includes('ROLE_COLLEGE_ADMIN') ||
        current.roles.includes('ROLE_ADMIN') ||
        current.roles.includes('ROLE_SUPER_ADMIN')
      ) {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      return;
    }
    setUser(current);
  }, [pathname, router]);

  const handleLogout = () => {
    setStoredUser(null);
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            T
          </div>
          <span className="font-bold text-slate-900 tracking-tight">CampusOS Faculty</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            T
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">CampusOS</h1>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              Faculty Workspace
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 m-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-indigo-700 truncate">{user.facultyIdNumber || 'Faculty'}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {TEACHER_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main View Port */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Teacher Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-[11px] font-semibold text-indigo-700">
              Instructor Mode
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
