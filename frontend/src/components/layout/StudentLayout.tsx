'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FolderDown,
  FileCheck2,
  UserCheck,
  Award,
  HelpCircle,
  ListTodo,
  Users,
  MessageSquare,
  Sparkles,
  Briefcase,
  Layers,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { getStoredUser, setStoredUser, apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/student/classrooms', label: 'Classrooms & Join', icon: GraduationCap },
  { href: '/student/timetable', label: 'Timetable', icon: Calendar },
  { href: '/student/attendance', label: 'Attendance', icon: UserCheck },
  { href: '/student/courses', label: 'Subjects', icon: BookOpen },
  { href: '/student/resources', label: 'Resources', icon: FolderDown },
  { href: '/student/assignments', label: 'Assignments', icon: FileCheck2 },
  { href: '/student/marks', label: 'Marks', icon: Award },
  { href: '/student/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/student/planner', label: 'Planner', icon: ListTodo },
  { href: '/student/community', label: 'Community', icon: Users },
  { href: '/student/ai-tutor', label: 'AI Tutor', icon: Sparkles },
  { href: '/student/career', label: 'Career & Projects', icon: Briefcase },
  { href: '/student/profile', label: 'Profile', icon: User },
];

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.push('/');
      return;
    }
    if (!current.roles.includes('ROLE_STUDENT')) {
      if (
        current.roles.includes('ROLE_COLLEGE_ADMIN') ||
        current.roles.includes('ROLE_ADMIN') ||
        current.roles.includes('ROLE_SUPER_ADMIN')
      ) {
        router.push('/admin/dashboard');
      } else if (current.roles.includes('ROLE_TEACHER')) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/');
      }
      return;
    }
    setUser(current);
    fetchNotifications();
  }, [pathname, router]);

  const fetchNotifications = async () => {
    try {
      const data: any[] = await apiFetch('/notifications');
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {}
  };

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
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </div>
          <span className="font-bold text-slate-900 tracking-tight">CampusOS</span>
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
        {/* Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            C
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">CampusOS</h1>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {user.institutionName || 'Student Portal'}
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 m-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.studentIdNumber || 'Student'}</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
                {item.label === 'Community' && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Student Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-[11px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Term: Fall 2026
            </div>

            <Link
              href="/student/community"
              className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
              )}
            </Link>
          </div>
        </header>

        {/* Main View Port */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
