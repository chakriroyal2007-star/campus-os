'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ListTodo, Plus, CheckCircle2, Circle, Clock, Trash2, Tag } from 'lucide-react';

export default function StudentPlannerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/planner/tasks');
      setTasks(data);
    } catch {}
    setLoading(false);
  };

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiFetch(`/planner/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadTasks();
    } catch {}
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/planner/tasks/${taskId}`, { method: 'DELETE' });
      loadTasks();
    } catch {}
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/planner/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          priority,
        }),
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      loadTasks();
    } catch {}
    setSaving(false);
  };

  const pending = tasks.filter((t) => t.status !== 'COMPLETED');
  const completed = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Personal Planner</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage study tasks, track academic due dates, and organize your revision schedule.
            </p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-blue-600" />
                  Active Tasks ({pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pending.length > 0 ? (
                  <div className="space-y-3">
                    {pending.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 flex items-start justify-between gap-3 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(task)}
                            className="mt-0.5 text-slate-400 hover:text-blue-600"
                          >
                            <Circle className="w-5 h-5" />
                          </button>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              )}
                              <Badge
                                variant={
                                  task.priority === 'HIGH' || task.priority === 'URGENT'
                                    ? 'danger'
                                    : 'neutral'
                                }
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-300 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<ListTodo className="w-6 h-6" />}
                    title="No pending tasks"
                    description="You are all caught up! Click 'Add Task' above to schedule new study targets."
                  />
                )}
              </CardContent>
            </Card>

            {completed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed ({completed.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {completed.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-slate-50 flex items-center justify-between text-xs text-slate-400"
                      >
                        <div className="flex items-center gap-2 line-through">
                          <button onClick={() => toggleTask(task)} className="text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span>{task.title}</span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-slate-900 text-white">
              <CardContent className="p-6 space-y-4">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Campus Productivity</span>
                <h4 className="text-base font-bold">Plan with Academic Deep-Links</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect tasks directly to assignments, quizzes, and live courses for organized semester pacing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Task">
        <form onSubmit={createTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Read Operating Systems Chapter 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add extra notes or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
}
