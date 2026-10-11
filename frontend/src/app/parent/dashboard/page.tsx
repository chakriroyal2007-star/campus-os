'use client';

import React, { useEffect, useState } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiFetch } from '@/lib/api';
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface LinkedChild {
  studentProfileId: string;
  studentIdNumber: string;
  fullName: string;
  email: string;
  enrollmentYear: number;
  currentSemester: number;
  section: string;
  departmentName: string;
  programName: string;
  overallAttendance: number;
  coursesCount: number;
  pendingAssignmentsCount: number;
}

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChildren() {
      try {
        const data = await apiFetch<LinkedChild[]>('/parent/children');
        setChildren(data || []);
      } catch {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    }
    loadChildren();
  }, []);

  const child = children[selectedChildIndex];
  const attendanceSafe = (child?.overallAttendance ?? 0) >= 75;

  return (
    <ParentLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Child Selector & Welcome Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-[#0c1a2e] border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Official Guardian Overview
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {child ? `Monitoring: ${child.fullName}` : 'Parent Digital Workspace'}
            </h1>
            <p className="text-xs text-slate-400">
              Real-time academic performance, live attendance tracking, and official university communications.
            </p>
          </div>

          {/* Child Dropdown Switcher if multiple children */}
          {children.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Student:</span>
              <select
                value={selectedChildIndex}
                onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {children.map((c, idx) => (
                  <option key={c.studentProfileId} value={idx} className="bg-slate-900 text-white">
                    {c.fullName} ({c.studentIdNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading linked student records...</div>
        ) : !child ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-sm font-bold text-white">No Linked Students Found</h3>
            <p className="text-xs max-w-md mx-auto">
              Your guardian account has not been linked to an active student yet. Contact the college administrator with your student&apos;s registration roll number.
            </p>
          </div>
        ) : (
          <>
            {/* Status Alert Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                attendanceSafe
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {attendanceSafe ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {attendanceSafe ? 'Attendance Status: Satisfactory' : 'Attendance Alert: Below 75% Threshold'}
                  </span>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {attendanceSafe
                      ? `Student has maintained ${child.overallAttendance}% overall attendance across all enrolled courses.`
                      : `Current attendance is ${child.overallAttendance}%. University minimum requirement is 75% for exam eligibility.`}
                  </p>
                </div>
              </div>
              <Link
                href="/parent/attendance"
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold transition-all shrink-0"
              >
                View Breakdown
              </Link>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Registration Roll
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">{child.studentIdNumber}</p>
                  <p className="text-[10px] text-slate-500">Sec {child.section} • Sem {child.currentSemester}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                  attendanceSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Overall Attendance
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">{child.overallAttendance}%</p>
                  <p className="text-[10px] text-slate-500">Min 75% required</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Enrolled Courses
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">{child.coursesCount || 1} Subjects</p>
                  <p className="text-[10px] text-slate-500">{child.departmentName}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Academic Year
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">{child.enrollmentYear} - 2027</p>
                  <p className="text-[10px] text-slate-500">{child.programName}</p>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/parent/attendance"
                className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Subject Attendance Records</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Inspect classes attended vs conducted for Data Structures & algorithms and all core subjects.
                </p>
              </Link>

              <Link
                href="/parent/marks"
                className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Examinations & Gradebook</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Review published assessment results, lab evaluations, and faculty feedback remarks.
                </p>
              </Link>

              <Link
                href="/parent/timetable"
                className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Class Timetable & Schedule</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  View daily lecture schedule, computing laboratory slots, and assigned lecture halls.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </ParentLayout>
  );
}
