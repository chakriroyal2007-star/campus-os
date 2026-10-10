'use client';

import React, { useState } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { Sparkles, Send, Lightbulb, BookOpen, CheckSquare, Layers } from 'lucide-react';

const TEACHER_TASK_TYPES = [
  { id: 'LESSON_OUTLINE', label: '50-Min Lesson Outline', icon: BookOpen },
  { id: 'PRACTICE_QUESTIONS', label: 'Draft Quiz Questions', icon: CheckSquare },
  { id: 'RUBRIC_GEN', label: 'Generate Assignment Rubric', icon: Layers },
];

export default function TeacherAiAssistantPage() {
  const [taskType, setTaskType] = useState('LESSON_OUTLINE');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicPrompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data: any = await apiFetch('/ai/prompt', {
        method: 'POST',
        body: JSON.stringify({
          prompt: topicPrompt.trim(),
          taskType,
        }),
      });
      setResult(data.reply);
    } catch (err: any) {
      alert(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Faculty AI Co-pilot</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Accelerate curriculum authoring with AI-generated lesson plans, quiz question banks, and assignment rubrics.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {TEACHER_TASK_TYPES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setTaskType(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  taskType === mode.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt Form */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Curriculum Topic & Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Lecture Topic / Assessment Scope
                    </label>
                    <textarea
                      rows={5}
                      placeholder="e.g. B-Trees and indexing in Relational Databases with rebalancing examples..."
                      value={topicPrompt}
                      onChange={(e) => setTopicPrompt(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" isLoading={loading}>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Generate Curriculum Assets
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Generated Result Output */}
          <div className="lg:col-span-7">
            <Card className="min-h-[400px] flex flex-col">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Generated Output
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-y-auto">
                {result ? (
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                    {result}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs">
                    <Sparkles className="w-8 h-8 mb-2 text-slate-300" />
                    Enter a curriculum topic on the left and click generate to produce lesson plans or questions.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
