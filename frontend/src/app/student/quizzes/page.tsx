'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { HelpCircle, Clock, CheckCircle2, XCircle, Play, Award } from 'lucide-react';

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<any>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/quizzes/student/my');
      setQuizzes(data);
    } catch {}
    setLoading(false);
  };

  const startQuiz = async (quiz: any) => {
    try {
      const details: any = await apiFetch(`/quizzes/student/${quiz.id}`);
      await apiFetch(`/quizzes/student/start/${quiz.id}`, { method: 'POST' });
      setActiveQuiz(details);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCompletedAttempt(details.myAttempt?.isCompleted ? details.myAttempt : null);
    } catch (err: any) {
      alert(err.message || 'Could not start quiz');
    }
  };

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans,
      }));

      const attemptResult: any = await apiFetch('/quizzes/student/submit', {
        method: 'POST',
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: answerList,
        }),
      });

      setCompletedAttempt(attemptResult);
      loadQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz attempt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quizzes & Self-Assessment</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Timed subject quizzes, server-authoritative scoring, and post-attempt explanations.
          </p>
        </div>

        {/* Active Quiz Player */}
        {activeQuiz ? (
          <div className="space-y-6">
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50/50">
                <div>
                  <Badge variant="primary">{activeQuiz.subjectName}</Badge>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeQuiz.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {activeQuiz.durationMinutes} Minutes
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setActiveQuiz(null)}>
                    Exit Player
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {completedAttempt ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Quiz Completed!</h4>
                      <p className="text-xs text-slate-500 mt-1">Your answers have been evaluated server-side.</p>
                    </div>
                    <div className="text-3xl font-extrabold text-blue-600">
                      Score: {completedAttempt.score} / {activeQuiz.totalMarks}
                    </div>
                    <Button onClick={() => setActiveQuiz(null)}>Back to Quizzes List</Button>
                  </div>
                ) : activeQuiz.questions && activeQuiz.questions.length > 0 ? (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Question Header & Navigation Stepper */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-3 border-b border-slate-100">
                      <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                      <span>Marks: {activeQuiz.questions[currentQuestionIndex].marks}</span>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-base font-semibold text-slate-900">
                      {activeQuiz.questions[currentQuestionIndex].questionText}
                    </h4>

                    {/* Options (Parsed or fallback choices) */}
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const currentQ = activeQuiz.questions[currentQuestionIndex];
                        const isSelected = answers[currentQ.id] === optKey;
                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => selectOption(currentQ.id, optKey)}
                            className={`w-full p-4 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>Option {optKey}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Stepper Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      >
                        Previous
                      </Button>

                      {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                        <Button
                          size="sm"
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        >
                          Next Question
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          isLoading={submitting}
                          onClick={submitQuiz}
                        >
                          Submit & Score Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<HelpCircle className="w-6 h-6" />}
                    title="No questions in this quiz"
                    description="Instructor is currently formulating the question bank."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Quizzes List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                  <CardHeader className="bg-slate-50/50">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                      {quiz.subjectName}
                    </span>
                    {quiz.myAttempt?.isCompleted ? (
                      <Badge variant="success">Score: {quiz.myAttempt.score} / {quiz.totalMarks}</Badge>
                    ) : (
                      <Badge variant="warning">Available</Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{quiz.title}</h4>
                      {quiz.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {quiz.durationMinutes} mins
                      </span>
                      <span>Total Marks: <strong>{quiz.totalMarks}</strong></span>
                    </div>
                  </CardContent>

                  <div className="px-5 pb-5">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => startQuiz(quiz)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {quiz.myAttempt?.isCompleted ? 'Review Attempt' : 'Start Quiz Attempt'}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<HelpCircle className="w-6 h-6" />}
                  title="No quizzes available"
                  description="When quizzes or practice tests are published for your registered subjects, they will appear here."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
