'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import { Sparkles, Send, BookOpen, Lightbulb, CheckSquare, Calendar, Bot } from 'lucide-react';

const TASK_MODES = [
  { id: 'EXPLAIN', label: 'Concept Breakdown', icon: Lightbulb },
  { id: 'PRACTICE_QUESTIONS', label: 'Practice Questions', icon: CheckSquare },
  { id: 'REVISION_PLAN', label: '5-Day Revision Plan', icon: Calendar },
];

export default function StudentAiTutorPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeTaskType, setActiveTaskType] = useState('EXPLAIN');
  const [messages, setMessages] = useState<any[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [convData, courseData] = await Promise.allSettled([
        apiFetch('/ai/conversations'),
        apiFetch('/academic/courses/my'),
      ]);

      if (convData.status === 'fulfilled') {
        const convs: any = convData.value;
        setConversations(convs);
        if (convs.length > 0) {
          setCurrentConvId(convs[0].id);
          setMessages(convs[0].messages || []);
        }
      }

      if (courseData.status === 'fulfilled') {
        const cList: any = courseData.value;
        setCourses(cList);
        if (cList.length > 0) setSelectedCourseId(cList[0].id);
      }
    } catch {}
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || loading) return;

    const userText = promptInput.trim();
    setPromptInput('');
    setLoading(true);

    const userMsgObj = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);

    try {
      const resp: any = await apiFetch('/ai/prompt', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: currentConvId,
          prompt: userText,
          courseOfferingId: selectedCourseId || null,
          taskType: activeTaskType,
        }),
      });

      setCurrentConvId(resp.conversationId);

      const aiMsgObj = {
        id: `ai-${Date.now()}`,
        role: 'ASSISTANT',
        content: resp.reply,
        sourcesJson: resp.sources?.join(', ') || null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err: any) {
      alert(err.message || 'AI generation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Academic Tutor</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connected learning assistant grounded in your registered subject syllabi, slides, and coursework.
          </p>
        </div>

        {/* Task Modes & Subject Context Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {TASK_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveTaskType(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTaskType === mode.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Subject Context:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">General University Context</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subjectCode} - {c.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Window */}
        <Card className="h-[550px] flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50/50 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm">CampusOS Pedagogical AI</CardTitle>
                <span className="text-[10px] text-slate-400">RAG Grounded &bull; Fallback Guaranteed</span>
              </div>
            </div>
          </CardHeader>

          {/* Messages Stream */}
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.length > 0 ? (
              messages.map((msg, i) => {
                const isMe = msg.role === 'USER';
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-2xl px-5 py-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs prose prose-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.sourcesJson && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          <span>Sources Referenced: <strong>{msg.sourcesJson}</strong></span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Ask your AI Academic Tutor</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Type any question, ask for step-by-step mathematical proofs, or request a 5-day exam revision plan.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                <span>Formulating pedagogical solution...</span>
              </div>
            )}
          </CardContent>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendPrompt} className="p-4 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              placeholder={`Ask a question in mode "${TASK_MODES.find((m) => m.id === activeTaskType)?.label}"...`}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" isLoading={loading}>
              <Send className="w-3.5 h-3.5 mr-1" />
              Ask Tutor
            </Button>
          </form>
        </Card>
      </div>
    </StudentLayout>
  );
}
