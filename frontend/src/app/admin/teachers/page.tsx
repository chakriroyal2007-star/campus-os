'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { UserCheck, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface TeacherDetail {
  teacherProfileId: string;
  userId: string;
  facultyIdNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  designation: string;
  employmentStatus: string;
  departmentName?: string;
  isActive: boolean;
  assignedCourses: string[];
}

interface Department {
  id: string;
  code: string;
  name: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherDetail[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('FacultySecure2026!');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        apiFetch<TeacherDetail[]>('/admin/teachers'),
        apiFetch<Department[]>('/admin/departments'),
      ]);
      setTeachers(teachersRes);
      setDepartments(deptsRes);
      if (deptsRes.length > 0 && !selectedDeptId) setSelectedDeptId(deptsRes[0].id);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load faculty directory' });
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
      await apiFetch('/admin/teachers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          facultyIdNumber: facultyId,
          designation,
          departmentId: selectedDeptId || null,
        }),
      });
      setShowModal(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      setFacultyId('');
      setMessage({ type: 'success', text: 'Faculty member onboarded successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to onboard faculty' });
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
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Faculty Directory & Teaching Roles
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Onboard professors, associate instructors, and track course assignments.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Faculty</span>
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

        {/* Teachers Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Faculty Directory ({teachers.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Faculty ID</th>
                  <th className="py-3 px-4">Professor Name</th>
                  <th className="py-3 px-4">Campus Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No faculty members onboarded yet. Click &quot;Onboard Faculty&quot;.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.teacherProfileId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">{t.facultyIdNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{t.fullName}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{t.email}</td>
                      <td className="py-3 px-4 text-slate-300">{t.departmentName || 'General'}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-300">{t.designation}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.assignedCourses.length > 0 ? (
                            t.assignedCourses.map((c, i) => (
                              <span key={i} className="text-[10px] bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic">No assigned courses</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {t.employmentStatus}
                        </span>
                      </td>
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
                <h3 className="text-sm font-bold text-white">Onboard Faculty Member</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deshmukh"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAC-CS-001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
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
                    {saving ? 'Onboarding...' : 'Onboard Faculty'}
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
