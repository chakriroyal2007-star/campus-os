'use client';

import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { HelpCircle, Plus, Clock, CheckCircle2, Trash2 } from 'lucide-react';

export default function TeacherQuizzesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [totalMarks, setTotalMarks] = useState('20');
  const [questions, setQuestions] = useState<any[]>([
    { questionText: '', correctAnswer: 'A', marks: 5, explanation: '' },
  ]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadQuizzes(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const data: any = await apiFetch('/academic/courses/teaching');
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch {}
  };

  const loadQuizzes = async (courseId: string) => {
    setLoadingQuizzes(true);
    try {
      const data: any = await apiFetch(`/quizzes/teacher/course/${courseId}`);
      setQuizzes(data);
    } catch {
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const addQuestionField = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', correctAnswer: 'A', marks: 5, explanation: '' },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setSaving(true);

    try {
      await apiFetch('/quizzes/teacher/create', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedCourseId,
          title,
          description,
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          isPublished: true,
          questions: questions.map((q, idx) => ({
            questionText: q.questionText,
            questionType: 'MULTIPLE_CHOICE',
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: Number(q.marks),
            orderIndex: idx,
          })),
        }),
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      loadQuizzes(selectedCourseId);
      alert('Quiz and question bank successfully published!');
    } catch (err: any) {
      alert(err.message || 'Failed to publish quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quiz & Question Banks</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create timed assessments with automated server-side grading and explanation keys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {courses.length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white shadow-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subjectCode} - {c.subjectName} (Sec {c.section})
                  </option>
                ))}
              </select>
            )}

            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Quiz
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Published Assessments & Banks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {quiz.subjectName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{quiz.title}</h4>
                      </div>
                      <Badge variant="success">Published</Badge>
                    </div>
                    {quiz.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{quiz.durationMinutes} mins</span>
                      </div>
                      <span>Total Marks: <strong>{quiz.totalMarks}</strong></span>
                      <span>Questions: <strong>{quiz.questions?.length || 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<HelpCircle className="w-6 h-6" />}
                title="No quizzes published yet for this course"
                description="Click 'Create Quiz' to publish multiple choice questions and timing constraints."
                actionLabel="Create Quiz"
                onAction={() => setModalOpen(true)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Quiz Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Quiz & Question Bank" maxWidth="xl">
        <form onSubmit={handleCreateQuiz} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Course Offering
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subjectCode} - {c.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Quiz Title"
              placeholder="e.g. Mid-term Practice Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              required
            />
          </div>

          {/* Question List Builder */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Question Bank ({questions.length})
              </h4>
              <Button type="button" size="sm" variant="outline" onClick={addQuestionField}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Question
              </Button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Input
                  placeholder="Enter question statement..."
                  value={q.questionText}
                  onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Correct Choice
                    </label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Points / Marks
                    </label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => updateQuestion(idx, 'marks', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>

                <Input
                  placeholder="Explanation / Key rationale (revealed after submission)..."
                  value={q.explanation}
                  onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" isLoading={saving}>
              Publish Quiz to Course
            </Button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}
