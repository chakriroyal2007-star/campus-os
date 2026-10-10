'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';

export default function StudentMarksPage() {
  const [gradebook, setGradebook] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarks();
  }, []);

  const loadMarks = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/assignments/student/gradebook');
      setGradebook(data);
    } catch {}
    setLoading(false);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Academic Gradebook</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official published assessment scores, maximum points, subject aggregates, and performance history.
          </p>
        </div>

        {gradebook.length > 0 ? (
          <div className="space-y-6">
            {gradebook.map((subject) => (
              <Card key={subject.courseOfferingId} className="overflow-hidden">
                <CardHeader className="bg-slate-50/70">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                      {subject.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{subject.subjectName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Score</span>
                    <span className="text-lg font-extrabold text-blue-600">{subject.percentage}%</span>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {subject.publishedGrades.map((grade: any) => (
                      <div key={grade.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">Assignment Assessment</h4>
                          {grade.feedback && (
                            <p className="text-xs text-slate-600 italic">&ldquo;{grade.feedback}&rdquo;</p>
                          )}
                          <span className="text-[10px] text-slate-400 block">
                            Graded on {formatDate(grade.gradedAt)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 block">
                            {grade.marksObtained} / {grade.maxMarks}
                          </span>
                          <Badge variant="success">Published</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Award className="w-6 h-6" />}
            title="No published marks yet"
            description="When professors grade and publish assignment or exam evaluations, they will appear here."
          />
        )}
      </div>
    </StudentLayout>
  );
}
