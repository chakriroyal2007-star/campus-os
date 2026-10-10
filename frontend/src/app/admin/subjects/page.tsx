'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { BookOpen, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface Subject {
  id: string;
  departmentId: string;
  departmentName: string;
  code: string;
  name: string;
  credits: number;
  description: string;
  createdAt: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deptId, setDeptId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [subjRes, deptsRes] = await Promise.all([
        apiFetch<Subject[]>('/admin/subjects'),
        apiFetch<Department[]>('/admin/departments'),
      ]);
      setSubjects(subjRes);
      setDepartments(deptsRes);
      if (deptsRes.length > 0 && !deptId) {
        setDeptId(deptsRes[0].id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load catalog subjects' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: deptId,
          code,
          name,
          credits,
          description,
        }),
      });
      setShowModal(false);
      setCode('');
      setName('');
      setDescription('');
      setCredits(3);
      setMessage({ type: 'success', text: 'Subject added to catalog successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create subject' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Master Subject Catalog
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Course syllabus inventory, unique course codes, and academic credit weightages.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course / Subject</span>
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Subjects Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Catalog Courses ({subjects.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No subjects in catalog yet. Click &quot;Add Course / Subject&quot;.
                    </td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{s.code}</td>
                      <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-3 px-4 text-slate-300">{s.departmentName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{s.credits} Credits</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{s.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Add Subject to Catalog</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures and Algorithms"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Description / Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Overview of syllabus and learning outcomes"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Add Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
