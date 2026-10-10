'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { GraduationCap, Plus, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface CourseOfferingDetail {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  academicTermId: string;
  academicTermName: string;
  section: string;
  assignedTeacherId?: string;
  assignedTeacherName: string;
  enrolledStudentCount: number;
  createdAt: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
}

interface AcademicTerm {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface TeacherDetail {
  teacherProfileId: string;
  fullName: string;
  facultyIdNumber: string;
}

export default function AdminCoursesPage() {
  const [offerings, setOfferings] = useState<CourseOfferingDetail[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [teachers, setTeachers] = useState<TeacherDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingDetail | null>(null);

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [section, setSection] = useState('A');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [offeringsRes, subjsRes, termsRes, teachersRes] = await Promise.all([
        apiFetch<CourseOfferingDetail[]>('/admin/courses'),
        apiFetch<Subject[]>('/admin/subjects'),
        apiFetch<AcademicTerm[]>('/admin/terms'),
        apiFetch<TeacherDetail[]>('/admin/teachers'),
      ]);
      setOfferings(offeringsRes);
      setSubjects(subjsRes);
      setTerms(termsRes);
      setTeachers(teachersRes);

      if (subjsRes.length > 0 && !selectedSubjectId) setSelectedSubjectId(subjsRes[0].id);
      if (termsRes.length > 0 && !selectedTermId) {
        const current = termsRes.find(t => t.isCurrent) || termsRes[0];
        setSelectedTermId(current.id);
      }
      if (teachersRes.length > 0 && !assignedTeacherId) setAssignedTeacherId(teachersRes[0].teacherProfileId);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load course offerings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          academicTermId: selectedTermId,
          section,
          assignedTeacherProfileId: assignedTeacherId ? assignedTeacherId : null,
        }),
      });
      setShowCreateModal(false);
      setMessage({ type: 'success', text: 'Course offering scheduled successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create course offering' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/courses/assign-teacher', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedOffering.id,
          teacherProfileId: assignedTeacherId,
        }),
      });
      setShowAssignModal(false);
      setMessage({ type: 'success', text: `Assigned faculty to ${selectedOffering.subjectCode} (Section ${selectedOffering.section}) successfully!` });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to assign teacher' });
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
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Course Offerings & Faculty Teaching Assignments
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Connect catalog subjects to terms, sections, and assigned teaching faculty.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course Offering</span>
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

        {/* Offerings Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Active Scheduled Course Offerings ({offerings.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Academic Term</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {offerings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No course offerings created yet. Click &quot;Create Course Offering&quot;.
                    </td>
                  </tr>
                ) : (
                  offerings.map((co) => (
                    <tr key={co.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{co.subjectCode} - {co.subjectName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{co.credits} Credits</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{co.academicTermName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          Sec {co.section}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={co.assignedTeacherId ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold italic'}>
                          {co.assignedTeacherName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-400 font-mono">{co.enrolledStudentCount} Students</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOffering(co);
                            setShowAssignModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Reassign Teacher</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Offering Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Create Course Offering</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateOffering} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catalog Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term</label>
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} {t.isCurrent ? '(Current)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, C"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-bold focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Faculty (Optional)</label>
                  <select
                    value={assignedTeacherId}
                    onChange={(e) => setAssignedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Unassigned (Assign later) --</option>
                    {teachers.map((t) => (
                      <option key={t.teacherProfileId} value={t.teacherProfileId}>{t.fullName} ({t.facultyIdNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Offering'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Teacher Modal */}
        {showAssignModal && selectedOffering && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Assign Faculty Member</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300">
                Course: <span className="font-bold text-white">{selectedOffering.subjectCode} ({selectedOffering.subjectName})</span> — Section {selectedOffering.section}
              </div>

              <form onSubmit={handleAssignTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Faculty Teacher</label>
                  <select
                    value={assignedTeacherId}
                    onChange={(e) => setAssignedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.teacherProfileId} value={t.teacherProfileId}>{t.fullName} ({t.facultyIdNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Assigning...' : 'Confirm Assignment'}
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
