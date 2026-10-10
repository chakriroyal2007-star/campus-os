'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { Layers, Plus, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';

interface Department {
  id: string;
  code: string;
  name: string;
  programCount: number;
  subjectCount: number;
  createdAt: string;
}

interface Program {
  id: string;
  departmentId: string;
  departmentName: string;
  code: string;
  name: string;
  degreeType: string;
  durationYears: number;
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');

  // Program Modal
  const [showProgModal, setShowProgModal] = useState(false);
  const [progDeptId, setProgDeptId] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [degreeType, setDegreeType] = useState('UNDERGRADUATE');
  const [durationYears, setDurationYears] = useState(4);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [deptsRes, progsRes] = await Promise.all([
        apiFetch<Department[]>('/admin/departments'),
        apiFetch<Program[]>('/admin/programs'),
      ]);
      setDepartments(deptsRes);
      setPrograms(progsRes);
      if (deptsRes.length > 0 && !progDeptId) {
        setProgDeptId(deptsRes[0].id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load departments and programs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ code: deptCode, name: deptName }),
      });
      setShowDeptModal(false);
      setDeptCode('');
      setDeptName('');
      setMessage({ type: 'success', text: 'Department created successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create department' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/programs', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: progDeptId,
          code: progCode,
          name: progName,
          degreeType,
          durationYears,
        }),
      });
      setShowProgModal(false);
      setProgCode('');
      setProgName('');
      setMessage({ type: 'success', text: 'Degree program created successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create program' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Departments & Degree Programs
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Structure engineering branches (CSE, ECE, Mechanical) and curriculum programs for your college.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeptModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
            <button
              onClick={() => setShowProgModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Degree Program</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Departments Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Departments ({departments.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No departments configured yet. Add your first department (e.g. CSE).
              </div>
            ) : (
              departments.map((d) => (
                <div key={d.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
                      {d.code}
                    </span>
                    <span className="text-[11px] text-slate-400">{d.programCount} Programs</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{d.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.subjectCount} Catalog Subjects</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Degree Programs & Curriculum ({programs.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Program Code</th>
                  <th className="py-3 px-4">Program Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Degree Type</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No degree programs added yet. Click &quot;Add Degree Program&quot;.
                    </td>
                  </tr>
                ) : (
                  programs.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{p.code}</td>
                      <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-4 text-slate-300">{p.departmentName}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                          {p.degreeType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{p.durationYears} Years</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Department Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Add Department</h3>
                <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Save Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Program Modal */}
        {showProgModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Add Degree Program</h3>
                <button onClick={() => setShowProgModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateProg} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Department</label>
                  <select
                    value={progDeptId}
                    onChange={(e) => setProgDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Program Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTECH_CSE"
                    value={progCode}
                    onChange={(e) => setProgCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Program Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Technology in Computer Science"
                    value={progName}
                    onChange={(e) => setProgName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Degree Type</label>
                    <select
                      value={degreeType}
                      onChange={(e) => setDegreeType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="UNDERGRADUATE">Undergraduate</option>
                      <option value="POSTGRADUATE">Postgraduate</option>
                      <option value="DOCTORATE">Doctorate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      value={durationYears}
                      onChange={(e) => setDurationYears(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProgModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Save Program'}
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
