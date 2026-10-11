'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch, getStoredUser } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  GraduationCap,
  KeyRound,
  ArrowRight,
  BookOpen,
  User,
  Calendar,
  Layers,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ClassroomAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Classroom {
  id: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  academicYear: string;
  semester: string;
  section: string;
  description: string;
  enrollmentPolicy: 'OPEN' | 'APPROVAL_REQUIRED';
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  joinCode: string;
  enrolledStudents: any[];
  announcements: ClassroomAnnouncement[];
  createdAt: string;
}

export default function StudentClassroomsPage() {
  const [user, setUser] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  // Join Code Form
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Leave State
  const [leavingId, setLeavingId] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    loadStudentClassrooms();
  }, []);

  const loadStudentClassrooms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Classroom[]>('/classrooms/student');
      setClassrooms(Array.isArray(res) ? res : []);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a classroom join code.');
      return;
    }

    setJoining(true);
    try {
      const currentUser = user || getStoredUser();
      const res: any = await apiFetch('/classrooms/join', {
        method: 'POST',
        body: JSON.stringify({
          joinCode: cleanCode,
          userId: currentUser?.userId || currentUser?.id,
          email: currentUser?.email,
        }),
      });

      if (res.success || res.classroom) {
        setJoinSuccess(res.message || 'Successfully joined classroom!');
        setJoinCodeInput('');
        if (res.classroom) {
          setClassrooms((prev) => {
            const exists = prev.some((c) => c.id === res.classroom.id);
            return exists ? prev : [res.classroom, ...prev];
          });
        }
        await loadStudentClassrooms();
      } else {
        setJoinError(res.message || 'Unable to join classroom.');
      }
    } catch (e: any) {
      setJoinError(e.message || 'Invalid join code or enrollment error.');
    }
    setJoining(false);
  };

  const handleLeaveClassroom = async (classroomId: string, classroomName: string) => {
    if (!confirm(`Are you sure you want to leave ${classroomName}? You will lose access to its roster and updates.`)) {
      return;
    }

    setLeavingId(classroomId);
    try {
      await apiFetch('/classrooms/leave', {
        method: 'POST',
        body: JSON.stringify({ classroomId }),
      });
      setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
    } catch (e: any) {
      alert(e.message || 'Failed to leave classroom.');
    }
    setLeavingId(null);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  Student Portal
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  Verified Academic Roster
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                My Classrooms & Join Codes
              </h1>
              <p className="text-indigo-200/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Connect directly with your course faculty. Enter your instructor&apos;s unique 6-character code to enroll, access live announcements, and sync your academic coursework.
              </p>
            </div>
          </div>
        </div>

        {/* 1. JOIN CLASSROOM FORM CARD */}
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Enroll in a New Classroom
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Ask your faculty instructor for their unique 6-character joining code (e.g. <span className="font-mono font-bold text-indigo-600">DSA742</span>)
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {joinError && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{joinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Enter 6-character classroom code (e.g. DSA742)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-sm font-mono tracking-wider font-bold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                />
              </div>
              <Button
                type="submit"
                disabled={joining || !joinCodeInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-11 px-6 rounded-xl shadow-md shadow-indigo-600/20 shrink-0 gap-2"
              >
                {joining ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    Join Classroom
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2. ENROLLED CLASSROOMS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              My Enrolled Classrooms ({classrooms.length})
            </h2>
            <span className="text-xs text-slate-500">
              Synchronized from institutional database
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading enrolled classrooms...</p>
            </div>
          ) : classrooms.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="w-12 h-12 text-indigo-500" />}
              title="You haven't joined any classrooms yet"
              description="Get the 6-character join code from your subject teacher or laboratory instructor and paste it above to enroll."
              actionLabel="Need help? Ask Faculty"
              onAction={() => alert('Please contact your course professor to obtain your classroom join code.')}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {classrooms.map((cls) => {
                const currentStudentEntry = (cls.enrolledStudents || []).find(
                  (s: any) => s.studentId === user?.id || s.studentEmail?.toLowerCase() === user?.email?.toLowerCase()
                );
                const isPending = currentStudentEntry?.status === 'PENDING';

                return (
                  <Card
                    key={cls.id}
                    className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {cls.subjectCode}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              Sec {cls.section}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {cls.semester}
                            </span>
                          </div>
                          <CardTitle className="text-lg font-bold text-slate-900 leading-snug">
                            {cls.name}
                          </CardTitle>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cls.subjectName} • {cls.department}
                          </p>
                        </div>
                        {isPending ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                            Pending Approval
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                            Enrolled
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                      {/* Faculty Info */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {cls.facultyName ? cls.facultyName.charAt(0) : 'F'}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-semibold text-slate-800 block truncate">
                            {cls.facultyName || 'Course Faculty'}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate font-mono">
                            {cls.facultyEmail}
                          </span>
                        </div>
                      </div>

                      {/* Announcements */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            Classroom Announcements ({(cls.announcements || []).length})
                          </span>
                        </div>

                        {(cls.announcements || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50/50 p-2.5 rounded-lg border border-dashed border-slate-200">
                            No announcements posted yet by the instructor.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {cls.announcements.map((ann) => (
                              <div
                                key={ann.id}
                                className="p-2.5 bg-indigo-50/50 border border-indigo-100/70 rounded-lg text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800">
                                    {ann.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {formatDate(ann.createdAt)}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {ann.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          Enrolled: {formatDate(currentStudentEntry?.joinedAt || cls.createdAt)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={leavingId === cls.id}
                          onClick={() => handleLeaveClassroom(cls.id, cls.name)}
                          className="text-xs h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          Leave
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
