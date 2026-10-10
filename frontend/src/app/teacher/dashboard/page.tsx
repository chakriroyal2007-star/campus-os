'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch, getStoredUser } from '@/lib/api';
import { formatTime, formatDuration } from '@/lib/utils';
import { BookOpen, UserCheck, FileCheck2, Presentation, Clock, Users, ArrowRight } from 'lucide-react';

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [cData, ttData] = await Promise.allSettled([
        apiFetch('/academic/courses/teaching'),
        apiFetch('/timetable/teacher'),
      ]);

      if (cData.status === 'fulfilled') setCourses(cData.value as any[]);
      if (ttData.status === 'fulfilled') setTimetable(ttData.value);
    } catch {}
    setLoading(false);
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
          <Badge className="bg-white/10 text-indigo-200 border-white/20 mb-3">Faculty Portal</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.firstName ? `Prof. ${user.firstName} ${user.lastName}` : 'Faculty Member'}! 🎓
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl">
            Manage your assigned courses, take session attendance directly against verified rosters, grade student submissions, and create slide decks.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Assigned Courses"
            value={courses.length}
            subtitle="Active sections"
            icon={<BookOpen className="w-5 h-5" />}
          />

          <StatCard
            title="Today's Teaching Load"
            value={
              timetable?.sessions?.filter(
                (s: any) => s.dayOfWeek === new Date().getDay() || (new Date().getDay() === 0 && s.dayOfWeek === 7)
              ).length || 0
            }
            subtitle="Scheduled class sessions"
            icon={<Clock className="w-5 h-5" />}
          />

          <StatCard
            title="Quick Attendance"
            value={courses.length > 0 ? courses[0].subjectCode : 'Ready'}
            subtitle="Click to take session attendance"
            icon={<UserCheck className="w-5 h-5" />}
          />
        </div>

        {/* Assigned Courses Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Assigned Course Offerings</h3>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Card key={c.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                  <CardHeader className="bg-slate-50/50">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {c.subjectCode}
                    </span>
                    <Badge variant="neutral">Section {c.section}</Badge>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1">
                    <h4 className="text-base font-bold text-slate-900">{c.subjectName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {c.description || 'Assigned semester course offering.'}
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>Term: <strong>{c.academicTermName}</strong></span> &bull; <span>Credits: <strong>{c.credits}</strong></span>
                    </div>
                  </CardContent>

                  <div className="px-5 pb-5 flex gap-2">
                    <Link href={`/teacher/attendance?courseId=${c.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-700">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Attendance
                      </Button>
                    </Link>
                    <Link href={`/teacher/assignments?courseId=${c.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                        Assignments
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No courses assigned yet"
              description="Department course offerings and section allocations will appear here when configured."
            />
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
