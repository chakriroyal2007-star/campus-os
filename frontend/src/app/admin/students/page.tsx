'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { Users, Plus, Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface StudentDetail {
  studentProfileId: string;
  userId: string;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  batchYear: number;
  currentSemester: number;
  section: string;
  enrollmentStatus: string;
  departmentName?: string;
  programName?: string;
  isActive: boolean;
  enrolledCourses: string[];
}

interface Department {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);

  // Filter
  const [filterSection, setFilterSection] = useState('');

  // Allocate Form
  const [allocSection, setAllocSection] = useState('A');
  const [allocSem, setAllocSem] = useState(1);

  // Manual Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('CampusStudent2026!');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [batchYear, setBatchYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProgId, setSelectedProgId] = useState('');

  // Bulk CSV Form
  const [csvContent, setCsvContent] = useState('');
  const [bulkResult, setBulkResult] = useState<any>(null);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [studentsRes, deptsRes, progsRes] = await Promise.all([
        apiFetch<StudentDetail[]>(`/admin/students${filterSection ? `?section=${filterSection}` : ''}`),
        apiFetch<Department[]>('/admin/departments'),
        apiFetch<Program[]>('/admin/programs'),
      ]);
      setStudents(studentsRes);
      setDepartments(deptsRes);
      setPrograms(progsRes);
      if (deptsRes.length > 0 && !selectedDeptId) setSelectedDeptId(deptsRes[0].id);
      if (progsRes.length > 0 && !selectedProgId) setSelectedProgId(progsRes[0].id);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load students directory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterSection]);

  const handleOpenAllocate = (student: StudentDetail) => {
    setSelectedStudent(student);
    setAllocSection(student.section || 'A');
    setAllocSem(student.currentSemester || 1);
    setShowAllocateModal(true);
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch(`/admin/students/${selectedStudent.studentProfileId}/allocate-section`, {
        method: 'POST',
        body: JSON.stringify({
          section: allocSection,
          currentSemester: allocSem,
        }),
      });
      setShowAllocateModal(false);
      setMessage({ type: 'success', text: `Allocated ${selectedStudent.fullName} to Section ${allocSection} and synced courses!` });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to allocate section' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncSection = async () => {
    const targetSection = filterSection || 'A';
    setSyncing(true);
    setMessage(null);
    try {
      const res: any = await apiFetch('/admin/sections/auto-enroll', {
        method: 'POST',
        body: JSON.stringify({ section: targetSection }),
      });
      setMessage({
        type: 'success',
        text: `Section ${targetSection} sync complete: ${res.studentsProcessed} students processed, ${res.enrollmentsCreated} new course enrollments registered.`,
      });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to sync section courses' });
    } finally {
      setSyncing(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          studentIdNumber: rollNumber,
          batchYear,
          currentSemester: semester,
          section,
          departmentId: selectedDeptId || null,
          programId: selectedProgId || null,
        }),
      });
      setShowManualModal(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      setRollNumber('');
      setMessage({ type: 'success', text: 'Student registered and enrolled successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create student' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setBulkResult(null);
    try {
      const res: any = await apiFetch('/admin/students/bulk-import', {
        method: 'POST',
        body: JSON.stringify({
          csvContent,
          departmentId: selectedDeptId || null,
          programId: selectedProgId || null,
          batchYear,
          currentSemester: semester,
          defaultSection: section,
        }),
      });
      setBulkResult(res);
      if (res.failureCount === 0) {
        setMessage({ type: 'success', text: `Successfully imported ${res.successCount} students!` });
        setShowBulkModal(false);
        setCsvContent('');
        loadData();
      } else {
        setMessage({ type: 'error', text: `Imported ${res.successCount} students with ${res.failureCount} errors.` });
        loadData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to bulk import students' });
    } finally {
      setSaving(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `studentIdNumber,firstName,lastName,email,password,section,batchYear,currentSemester\nSTU-2026-101,Rohan,Verma,rohan.verma@apex.edu,CampusPass123!,A,2026,3\nSTU-2026-102,Neha,Patel,neha.patel@apex.edu,CampusPass123!,A,2026,3\nSTU-2026-103,Aarav,Mehta,aarav.mehta@apex.edu,CampusPass123!,B,2026,3\n`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campusos_student_import_template.csv';
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Student Directory & Roster Management
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Onboard enrolled students manually or through validated batch CSV import.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk CSV Import</span>
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
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

        {/* Filter Bar */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Filter Section:</span>
            <button
              onClick={() => setFilterSection('')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                !filterSection ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Sections
            </button>
            {['A', 'B', 'C'].map((sec) => (
              <button
                key={sec}
                onClick={() => setFilterSection(sec)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterSection === sec ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Section {sec}
              </button>
            ))}
          </div>

          <button
            onClick={handleSyncSection}
            disabled={syncing}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{syncing ? 'Syncing...' : `⚡ Auto-Enroll Section ${filterSection || 'A'} Offerings`}</span>
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Enrolled Students ({students.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Student ID / Roll</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Campus Email</th>
                  <th className="py-3 px-4">Batch / Sem</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Enrolled Subjects</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No students enrolled yet. Register a student or import via CSV.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.studentProfileId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{s.studentIdNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{s.fullName}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{s.email}</td>
                      <td className="py-3 px-4 font-mono">{s.batchYear} (Sem {s.currentSemester})</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          Sec {s.section}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.enrolledCourses.length > 0 ? (
                            s.enrolledCourses.map((c, i) => (
                              <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                {c.split(' - ')[0]}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {s.enrollmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAllocate(s)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-700"
                        >
                          Allocate Section
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocate Section Modal */}
        {showAllocateModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Allocate Section & Sync Offerings</h3>
                <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <div>Student: <strong className="text-white">{selectedStudent.fullName}</strong></div>
                <div>Roll / ID: <strong className="font-mono text-indigo-400">{selectedStudent.studentIdNumber}</strong></div>
              </div>

              <form onSubmit={handleAllocateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Section</label>
                    <select
                      value={allocSection}
                      onChange={(e) => setAllocSection(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {['A', 'B', 'C', 'D'].map((sec) => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Semester</label>
                    <select
                      value={allocSem}
                      onChange={(e) => setAllocSem(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllocateModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Allocating...' : 'Confirm Allocation & Auto-Enroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manual Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Register Student Record</h3>
                <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleManualCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav"
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
                      placeholder="e.g. Mehta"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email</label>
                    <input
                      type="email"
                      required
                      placeholder="aarav@campus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll / ID Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-2026-001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A"
                      value={section}
                      onChange={(e) => setSection(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Year</label>
                    <input
                      type="number"
                      required
                      value={batchYear}
                      onChange={(e) => setBatchYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
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
                    onClick={() => setShowManualModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Registering...' : 'Register Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  Bulk Student CSV Importer
                </h3>
                <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-200">CSV Column Format:</div>
                <div className="font-mono text-[11px] text-purple-400">studentIdNumber, firstName, lastName, email, [password], [section], [batchYear], [semester]</div>
              </div>

              <form onSubmit={handleBulkImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paste CSV Data</label>
                  <textarea
                    rows={8}
                    required
                    placeholder={`STU-001,Aarav,Mehta,aarav@campus.edu,Pass123!,A,2026,3\nSTU-002,Rohan,Verma,rohan@campus.edu,Pass123!,A,2026,3`}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-purple-500"
                  />
                </div>

                {bulkResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-white">Import Summary:</div>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400">✓ Successful: {bulkResult.successCount}</span>
                      <span className="text-rose-400">✗ Failed: {bulkResult.failureCount}</span>
                    </div>
                    {bulkResult.errors.length > 0 && (
                      <div className="mt-2 space-y-1 text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                        {bulkResult.errors.map((err: any, i: number) => (
                          <div key={i}>Row {err.rowNumber} ({err.email}): {err.errorMessage}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {saving ? 'Processing CSV...' : 'Commit Batch Import'}
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
