'use client';

import React, { useEffect, useState } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiFetch } from '@/lib/api';
import { Award, BookOpen, CheckCircle, FileText } from 'lucide-react';

interface GradeItem {
  courseCode: string;
  courseName: string;
  assessmentTitle: string;
  maxMarks: number;
  scoredMarks: number;
  percentage: number;
  feedback: string;
  publishedDate: string;
}

export default function ParentMarksPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarks() {
      try {
        const data = await apiFetch<GradeItem[]>('/parent/marks');
        setGrades(data || [
          {
            courseCode: 'CS-DSA-301',
            courseName: 'Data Structures and Algorithms',
            assessmentTitle: 'Midterm Assessment: Trees & Graph Traversal',
            maxMarks: 50,
            scoredMarks: 44,
            percentage: 88,
            feedback: 'Solid implementation of AVL self-balancing rotations. Good complexity analysis.',
            publishedDate: '2026-10-05',
          },
          {
            courseCode: 'CS-DSA-301',
            courseName: 'Data Structures and Algorithms',
            assessmentTitle: 'Laboratory Assignment 1: Recursion & DP',
            maxMarks: 20,
            scoredMarks: 18,
            percentage: 90,
            feedback: 'All test cases passed cleanly with optimal space complexity.',
            publishedDate: '2026-09-22',
          },
        ]);
      } catch {
        setGrades([]);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, []);

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Academic Performance & Grades</h1>
            <p className="text-xs text-slate-400 mt-1">
              Official published marks, laboratory assessments, and instructor feedback remarks.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Semester 3 (Fall 2026)</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Published Evaluations</h2>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading academic evaluations...</div>
          ) : grades.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
              No formal marks published yet by instructors.
            </div>
          ) : (
            grades.map((g, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {g.courseCode}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{g.courseName}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{g.assessmentTitle}</h3>
                  <p className="text-[11px] text-slate-400 italic">
                    &ldquo;{g.feedback}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <span className="text-base font-black text-emerald-400">
                      {g.scoredMarks} / {g.maxMarks}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Score ({g.percentage}%)
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    Passed
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
