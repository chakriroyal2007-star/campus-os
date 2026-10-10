'use client';

import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { Award, BookOpen, UserCheck, Download } from 'lucide-react';

export default function TeacherGradebookPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (data.length > 0) setSelectedCourseId(data[0].id);
    } catch {}
    setLoading(false);
  };

  const loadRoster = async (courseId: string) => {
    setLoading(true);
    try {
      const data: any = await apiFetch(`/attendance/teacher/roster/${courseId}`);
      setRoster(data);
    } catch {}
    setLoading(false);
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Course Gradebook</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cumulative student grading summaries, weighted evaluations, and publication tracking.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Course Offering:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 max-w-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subjectCode} - {c.subjectName} (Sec {c.section})
              </option>
            ))}
          </select>
        </div>

        {/* Gradebook Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Roster Grade Records ({roster.length} Students)
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
                      <th className="px-6 py-3.5">Attendance Pct</th>
                      <th className="px-6 py-3.5">Evaluation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((s) => (
                      <tr key={s.studentId} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">{s.studentIdNumber}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{s.studentName}</td>
                        <td className="px-6 py-4 text-slate-500">Sec {s.section || 'A'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{s.currentAttendancePercentage}%</td>
                        <td className="px-6 py-4">
                          <Badge variant="success">Enrolled Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<Award className="w-6 h-6" />}
                  title="No grade records for this course"
                  description="When assignments and assessments are evaluated, grade records will appear here."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
