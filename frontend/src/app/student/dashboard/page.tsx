'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch, getStoredUser } from '@/lib/api';
import { formatTime, formatDuration, formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  UserCheck,
  FileCheck2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [timetable, setTimetable] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ttData, attData, assignData, quizData] = await Promise.allSettled([
        apiFetch('/timetable/student'),
        apiFetch('/attendance/student/overview'),
        apiFetch('/assignments/student/my'),
        apiFetch('/quizzes/student/my'),
      ]);

      if (ttData.status === 'fulfilled') setTimetable(ttData.value);
      if (attData.status === 'fulfilled') setAttendance(attData.value);
      if (assignData.status === 'fulfilled') setAssignments(assignData.value as any[]);
      if (quizData.status === 'fulfilled') setQuizzes(quizData.value as any[]);
    } catch {}
    setLoading(false);
  };

  const pendingAssignments = assignments.filter((a) => !a.mySubmission);

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-white/10 text-blue-100 border-white/20 mb-3">
              Semester {user?.currentSemester || 1} • Section {user?.section || 'A'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Stay ahead with your real-time campus schedule, official attendance metrics, and continuous AI learning assistance.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Join Classroom Banner */}
        <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Classrooms & Join Codes</h3>
              <p className="text-xs text-slate-500">Have a 6-character code from your professor? Join your academic classroom to view live announcements and materials.</p>
            </div>
          </div>
          <Link href="/student/classrooms">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shrink-0">
              Join Classroom
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall Attendance"
            value={attendance?.totalConductedAcrossAll ? `${attendance.overallPercentage}%` : 'N/A'}
            subtitle={
              attendance?.totalConductedAcrossAll
                ? `${attendance.totalAttendedAcrossAll}/${attendance.totalConductedAcrossAll} classes attended`
                : 'No attendance marked yet'
            }
            icon={<UserCheck className="w-5 h-5" />}
            trend={attendance?.overallPercentage >= 75 ? 'Eligible' : 'Shortage'}
            trendType={attendance?.overallPercentage >= 75 ? 'positive' : 'negative'}
          />

          <StatCard
            title="Pending Assignments"
            value={pendingAssignments.length}
            subtitle={pendingAssignments.length > 0 ? 'Upcoming due dates' : 'All caught up!'}
            icon={<FileCheck2 className="w-5 h-5" />}
            trendType="neutral"
          />

          <StatCard
            title="Available Quizzes"
            value={quizzes.filter((q) => !q.myAttempt?.isCompleted).length}
            subtitle="Subject assessments"
            icon={<HelpCircle className="w-5 h-5" />}
          />

          <StatCard
            title="Next Class"
            value={timetable?.nextSession?.subjectCode || (timetable?.currentSession ? 'In Progress' : 'None')}
            subtitle={
              timetable?.currentSession
                ? `${formatDuration(timetable.secondsRemainingInCurrentSession)} left`
                : timetable?.nextSession
                ? `Starts in ${formatDuration(timetable.secondsUntilNextSession)}`
                : 'No more classes today'
            }
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Live Class Focus Box */}
        {timetable?.currentSession && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Live Class In Session</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {timetable.currentSession.subjectCode}: {timetable.currentSession.subjectName}
                </h4>
                <p className="text-xs text-slate-600">
                  Room: {timetable.currentSession.roomNumber} ({timetable.currentSession.building}) • Instructor: {timetable.currentSession.teacherName}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-slate-500 block">Remaining Duration</span>
              <span className="text-lg font-bold text-slate-900">
                {formatDuration(timetable.secondsRemainingInCurrentSession)}
              </span>
            </div>
          </div>
        )}

        {/* Main Grid: Today's Timetable & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Today's Schedule */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Today&apos;s Class Schedule
                </CardTitle>
                <Link href="/student/timetable" className="text-xs font-semibold text-blue-600 hover:underline">
                  Full Week View &rarr;
                </Link>
              </CardHeader>
              <CardContent>
                {timetable?.sessions && timetable.sessions.filter((s: any) => s.dayOfWeek === new Date().getDay() || (new Date().getDay() === 0 && s.dayOfWeek === 7)).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {timetable.sessions
                      .filter((s: any) => s.dayOfWeek === new Date().getDay() || (new Date().getDay() === 0 && s.dayOfWeek === 7))
                      .map((session: any) => (
                        <div key={session.id} className="py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 text-center">
                              <span className="text-xs font-bold text-slate-900 block">{formatTime(session.startTime)}</span>
                              <span className="text-[10px] text-slate-400 block">{formatTime(session.endTime)}</span>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">{session.subjectName}</h5>
                              <p className="text-[11px] text-slate-500">
                                {session.subjectCode} • Room {session.roomNumber} • {session.teacherName}
                              </p>
                            </div>
                          </div>
                          <div>
                            {session.isCancelled ? (
                              <Badge variant="danger">Cancelled</Badge>
                            ) : (
                              <Badge variant="primary">Scheduled</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-6 h-6" />}
                    title="No classes scheduled for today"
                    description="Enjoy your free time, review course resources, or study with your AI tutor."
                  />
                )}
              </CardContent>
            </Card>

            {/* AI Assistant Callout */}
            <Card className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-blue-200/60">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">AI Concept Tutor</h4>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                      Get step-by-step explanations grounded in your registered syllabus and lecture materials.
                    </p>
                  </div>
                </div>
                <Link href="/student/ai-tutor">
                  <Button size="sm">Open AI Tutor</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Deadlines & Quick Attendance */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  Upcoming Assignments
                </CardTitle>
                <Link href="/student/assignments" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All &rarr;
                </Link>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.slice(0, 4).map((assign) => (
                      <div
                        key={assign.id}
                        className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{assign.title}</h5>
                          <p className="text-[11px] text-slate-500 truncate">{assign.subjectName}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">Due: {formatDate(assign.dueDate)}</span>
                        </div>
                        <div>
                          {assign.myGrade ? (
                            <Badge variant="success">{assign.myGrade.marksObtained} / {assign.maxMarks}</Badge>
                          ) : assign.mySubmission ? (
                            <Badge variant="primary">Submitted</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileCheck2 className="w-6 h-6" />}
                    title="No assignments posted yet"
                    description="When your professors publish assignments, they will appear here automatically."
                  />
                )}
              </CardContent>
            </Card>

            {/* Attendance Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Subject Attendance Summary
                </CardTitle>
                <Link href="/student/attendance" className="text-xs font-semibold text-blue-600 hover:underline">
                  Forecast Details &rarr;
                </Link>
              </CardHeader>
              <CardContent>
                {attendance?.subjects && attendance.subjects.length > 0 ? (
                  <div className="space-y-3">
                    {attendance.subjects.slice(0, 3).map((sub: any) => (
                      <div key={sub.courseOfferingId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                          <span className={sub.isEligible ? 'font-bold text-emerald-700' : 'font-bold text-rose-600'}>
                            {sub.currentPercentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              sub.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Number(sub.currentPercentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<UserCheck className="w-6 h-6" />}
                    title="No attendance records"
                    description="Attendance records will populate when recorded by faculty."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
