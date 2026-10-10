'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { BookOpen, User, Award, FolderDown, FileCheck2 } from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/academic/courses/my');
      setCourses(data);
    } catch {}
    setLoading(false);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Enrolled Subjects</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your registered course curriculum, instructor allocations, and syllabus details.
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
                <CardHeader className="bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                      {course.subjectCode}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">Section {course.section}</span>
                  </div>
                  <Badge variant="neutral">{course.credits} Credits</Badge>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{course.subjectName}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                      {course.description || 'Comprehensive university curriculum covering theory, lab exercises, and assignments.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Faculty: <strong>{course.primaryTeacherName}</strong></span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href="/student/resources" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <FolderDown className="w-3.5 h-3.5 mr-1" />
                        Resources
                      </Button>
                    </Link>
                    <Link href="/student/assignments" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                        Tasks
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="No course enrollments found"
            description="When your institution registers your semester enrollments, they will appear here."
          />
        )}
      </div>
    </StudentLayout>
  );
}
