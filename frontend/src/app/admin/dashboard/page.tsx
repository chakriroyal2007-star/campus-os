'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import {
  Users,
  UserCheck,
  Layers,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardSummary {
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalPrograms: number;
  totalSubjects: number;
  totalCourseOfferings: number;
  totalActiveTerms: number;
  totalClassSessions: number;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch<AdminDashboardSummary>('/admin/dashboard');
        setSummary(res);
      } catch {
        // Fallback default state
        setSummary({
          institutionId: '1',
          institutionName: 'Apex Institute of Technology',
          institutionCode: 'INST001',
          totalStudents: 0,
          totalTeachers: 0,
          totalDepartments: 0,
          totalPrograms: 0,
          totalSubjects: 0,
          totalCourseOfferings: 0,
          totalActiveTerms: 0,
          totalClassSessions: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Enrolled Students', value: summary?.totalStudents ?? 0, icon: Users, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    { label: 'Faculty Members', value: summary?.totalTeachers ?? 0, icon: UserCheck, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    { label: 'Departments', value: summary?.totalDepartments ?? 0, icon: Layers, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { label: 'Degree Programs', value: summary?.totalPrograms ?? 0, icon: GraduationCap, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    { label: 'Catalog Subjects', value: summary?.totalSubjects ?? 0, icon: BookOpen, color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    { label: 'Active Offerings', value: summary?.totalCourseOfferings ?? 0, icon: Calendar, color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  ];

  const onboardingSteps = [
    { title: 'Configure Academic Term', desc: 'Set up Fall/Spring terms and date ranges', href: '/admin/terms', done: (summary?.totalActiveTerms ?? 0) > 0 },
    { title: 'Create Departments & Branches', desc: 'Add CSE, ECE, Mechanical and degree programs', href: '/admin/departments', done: (summary?.totalDepartments ?? 0) > 0 },
    { title: 'Populate Subject Catalog', desc: 'Add credit-bearing courses and codes', href: '/admin/subjects', done: (summary?.totalSubjects ?? 0) > 0 },
    { title: 'Create Course Offerings', desc: 'Map subject + term + section and assign faculty', href: '/admin/courses', done: (summary?.totalCourseOfferings ?? 0) > 0 },
    { title: 'Onboard Students & Faculty', desc: 'Bulk import students via CSV and invite teachers', href: '/admin/students', done: (summary?.totalStudents ?? 0) > 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 border border-indigo-500/30 flex items-center justify-between shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">College Administration</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{summary?.institutionName}</h2>
            <p className="text-xs text-slate-400">
              Manage academic hierarchy, student enrollments, faculty teaching assignments, and campus operations.
            </p>
          </div>
          <Link
            href="/admin/institution"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>College Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl bg-gradient-to-b ${stat.color} border ${stat.border} backdrop-blur-sm flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.text}`} />
                </div>
                <div className="text-2xl font-black text-white">{loading ? '...' : stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Onboarding Wizard & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Onboarding Checklist */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">College Setup & Onboarding Progress</h3>
                <p className="text-xs text-slate-400">Step-by-step checklist to initialize your campus structure</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                {onboardingSteps.filter(s => s.done).length} / {onboardingSteps.length} Configured
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {onboardingSteps.map((step, idx) => (
                <Link
                  key={idx}
                  href={step.href}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{step.title}</h4>
                      <p className="text-[11px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Administrative Actions</h3>
              <p className="text-xs text-slate-400 mb-4">Direct shortcuts to critical workflows</p>
              
              <div className="space-y-2">
                <Link
                  href="/admin/students"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold transition-all"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Bulk Import Students (CSV)</span>
                </Link>
                <Link
                  href="/admin/teachers"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 text-purple-300 text-xs font-semibold transition-all"
                >
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Onboard & Assign Faculty</span>
                </Link>
                <Link
                  href="/admin/timetable"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-300 text-xs font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Schedule Lecture Timetables</span>
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Data Integrity Guard:</span> All changes propagate in real-time across both student and teacher portals with complete tenant isolation.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
