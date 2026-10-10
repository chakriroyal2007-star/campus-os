'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { UserCheck, CheckCircle2, XCircle, Clock, ShieldAlert, Save } from 'lucide-react';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auditable correction modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionStudent, setCorrectionStudent] = useState<any>(null);
  const [correctionStatus, setCorrectionStatus] = useState('PRESENT');
  const [correctionReason, setCorrectionReason] = useState('');
  const [savingCorrection, setSavingCorrection] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadRoster(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const data: any = await apiFetch('/academic/courses/teaching');
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch {}
    setLoading(false);
  };

  const loadRoster = async (courseId: string) => {
    setLoading(true);
    try {
      const data: any = await apiFetch(`/attendance/teacher/roster/${courseId}`);
      setRoster(data);

      // Default all rostered students to PRESENT
      const initialMap: Record<string, string> = {};
      data.forEach((s: any) => {
        initialMap[s.studentId] = 'PRESENT';
      });
      setStatusMap(initialMap);
    } catch {}
    setLoading(false);
  };

  const setStudentStatus = (studentId: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const updated: Record<string, string> = {};
    roster.forEach((s) => {
      updated[s.studentId] = status;
    });
    setStatusMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId || roster.length === 0) return;
    setSaving(true);
    setSuccessMsg(null);

    const recordInputs = roster.map((s) => ({
      studentId: s.studentId,
      status: statusMap[s.studentId] || 'PRESENT',
      remarks: '',
    }));

    try {
      await apiFetch('/attendance/teacher/record', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedCourseId,
          sessionDate: sessionDate,
          records: recordInputs,
        }),
      });
      setSuccessMsg(`Session attendance for ${sessionDate} successfully saved to database.`);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Session Attendance Roster</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Atomic session marking with duplicate protection and audit logging.
            </p>
          </div>

          {roster.length > 0 && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
              onClick={handleSaveAttendance}
              isLoading={saving}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Attendance Session
            </Button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Course Offering:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subjectCode} - {c.subjectName} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Date:</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          {roster.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick Set:</span>
              <Button size="sm" variant="outline" onClick={() => markAll('PRESENT')}>
                All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll('ABSENT')}>
                All Absent
              </Button>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Student Roster Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Roster: {roster.length} Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {roster.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Roll / Student ID</th>
                      <th className="px-6 py-3.5">Student Name</th>
                      <th className="px-6 py-3.5">Section</th>
                      <th className="px-6 py-3.5">Cumulative Attendance</th>
                      <th className="px-6 py-3.5 text-center">Session Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((student) => {
                      const currentStatus = statusMap[student.studentId] || 'PRESENT';
                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-900">{student.studentIdNumber}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{student.studentName}</td>
                          <td className="px-6 py-4 text-slate-500">Sec {student.section || 'A'}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{student.currentAttendancePercentage}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.studentId, 'PRESENT')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.studentId, 'ABSENT')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.studentId, 'LATE')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  currentStatus === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.studentId, 'EXCUSED')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  currentStatus === 'EXCUSED'
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Excused
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<UserCheck className="w-6 h-6" />}
                  title="No enrolled students in this course"
                  description="When students are enrolled in this course offering, the attendance roster will appear."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Attendance Portal...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
