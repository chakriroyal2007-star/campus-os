'use client';

import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch, getStoredUser } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Key,
  Copy,
  Check,
  RotateCw,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Share2,
  X
} from 'lucide-react';

interface EnrolledStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentIdNumber: string;
  department?: string;
  section?: string;
  joinedAt: string;
  status: 'ENROLLED' | 'PENDING' | 'REJECTED';
}

interface ClassroomAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Classroom {
  id: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  academicYear: string;
  semester: string;
  section: string;
  description: string;
  enrollmentPolicy: 'OPEN' | 'APPROVAL_REQUIRED';
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  joinCode: string;
  enrolledStudents: EnrolledStudent[];
  announcements: ClassroomAnnouncement[];
  createdAt: string;
  updatedAt: string;
}

export default function TeacherClassroomsPage() {
  const [user, setUser] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRosterClassroom, setSelectedRosterClassroom] = useState<Classroom | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [selectedAnnounceClassroom, setSelectedAnnounceClassroom] = useState<Classroom | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: '',
    subjectName: '',
    department: 'Computer Science and Engineering',
    academicYear: '2026-2027',
    semester: 'Semester 3',
    section: 'A',
    description: '',
    enrollmentPolicy: 'OPEN' as 'OPEN' | 'APPROVAL_REQUIRED',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSubmitting, setAnnSubmitting] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Classroom[]>('/classrooms/faculty');
      setClassrooms(Array.isArray(res) ? res : []);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRotateCode = async (classroomId: string) => {
    if (!confirm('Are you sure you want to rotate this join code? The previous code will become invalid immediately.')) return;
    try {
      const res: any = await apiFetch('/classrooms/rotate-code', {
        method: 'POST',
        body: JSON.stringify({ classroomId }),
      });
      if (res.newJoinCode) {
        setClassrooms((prev) =>
          prev.map((c) => (c.id === classroomId ? { ...c, joinCode: res.newJoinCode } : c))
        );
        alert(`Join code regenerated: ${res.newJoinCode}`);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to rotate join code.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim() || !formData.subjectCode.trim() || !formData.subjectName.trim()) {
      setFormError('Classroom Name, Subject Code, and Subject Name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await apiFetch('/classrooms/create', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.classroom) {
        setClassrooms((prev) => [res.classroom, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          name: '',
          subjectCode: '',
          subjectName: '',
          department: 'Computer Science and Engineering',
          academicYear: '2026-2027',
          semester: 'Semester 3',
          section: 'A',
          description: '',
          enrollmentPolicy: 'OPEN',
        });
      }
    } catch (e: any) {
      setFormError(e.message || 'Failed to create classroom.');
    }
    setSubmitting(false);
  };

  const handleApproveRejectStudent = async (classroomId: string, studentId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await apiFetch('/classrooms/approve-student', {
        method: 'POST',
        body: JSON.stringify({ classroomId, studentId, action }),
      });
      await loadClassrooms();
      if (selectedRosterClassroom && selectedRosterClassroom.id === classroomId) {
        const updated = classrooms.find((c) => c.id === classroomId);
        if (updated) setSelectedRosterClassroom(updated);
      }
    } catch (e: any) {
      alert(e.message || 'Operation failed.');
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnounceClassroom || !annTitle.trim() || !annContent.trim()) return;
    setAnnSubmitting(true);
    try {
      await apiFetch('/classrooms/announcements', {
        method: 'POST',
        body: JSON.stringify({
          classroomId: selectedAnnounceClassroom.id,
          title: annTitle,
          content: annContent,
        }),
      });
      setIsAnnouncementOpen(false);
      setAnnTitle('');
      setAnnContent('');
      await loadClassrooms();
    } catch (e: any) {
      alert(e.message || 'Failed to post announcement.');
    }
    setAnnSubmitting(false);
  };

  const filteredRosterStudents = (selectedRosterClassroom?.enrolledStudents || []).filter((s) => {
    const q = rosterSearch.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      s.studentEmail.toLowerCase().includes(q) ||
      s.studentIdNumber.toLowerCase().includes(q)
    );
  });

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Faculty Classroom Studio
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  Zero Hardcoded Data
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Classroom Join Codes & Student Rosters
              </h1>
              <p className="text-indigo-200/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Create persistent academic classrooms, generate collision-resistant join codes, share them securely with your batch, and inspect verified student enrollments in real time.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 px-5 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Create Classroom
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading verified classrooms from database...</p>
          </div>
        ) : classrooms.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-12 h-12 text-indigo-500" />}
            title="No Classrooms Created Yet"
            description="You haven't created any course classrooms yet. Create a classroom to generate a unique 6-character joining code and invite students to enroll."
            actionLabel="Create Your First Classroom"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classrooms.map((cls) => {
              const enrolledCount = (cls.enrolledStudents || []).filter((s) => s.status === 'ENROLLED').length;
              const pendingCount = (cls.enrolledStudents || []).filter((s) => s.status === 'PENDING').length;

              return (
                <Card
                  key={cls.id}
                  className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {cls.subjectCode}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            Sec {cls.section}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {cls.semester}
                          </span>
                          {cls.enrollmentPolicy === 'APPROVAL_REQUIRED' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                              Approval Required
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 leading-snug">
                          {cls.name}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {cls.subjectName} • {cls.department}
                        </p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Join Code Box */}
                    <div className="bg-gradient-to-r from-indigo-50/80 via-slate-50 to-indigo-50/80 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block mb-0.5">
                          Student Join Code
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-black text-indigo-700 tracking-widest selection:bg-indigo-200">
                            {cls.joinCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(cls.joinCode)}
                          className="text-xs h-8 px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-100/60 gap-1.5 font-medium"
                        >
                          {copiedCode === cls.joinCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Code
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotateCode(cls.id)}
                          className="text-xs h-8 px-2.5 text-slate-600 hover:bg-slate-100"
                          title="Rotate code if compromised"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats & Description */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block">Enrolled Students</span>
                        <span className="text-base font-bold text-slate-800">
                          {enrolledCount} Verified
                        </span>
                        {pendingCount > 0 && (
                          <span className="text-amber-600 font-medium block text-[11px] mt-0.5">
                            ({pendingCount} pending approval)
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block">Announcements</span>
                        <span className="text-base font-bold text-slate-800">
                          {(cls.announcements || []).length} Published
                        </span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          Direct updates
                        </span>
                      </div>
                    </div>

                    {cls.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic">
                        &quot;{cls.description}&quot;
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRosterClassroom(cls)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 h-8 font-medium"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Student Roster ({enrolledCount + pendingCount})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnounceClassroom(cls);
                          setIsAnnouncementOpen(true);
                        }}
                        className="text-xs text-slate-700 hover:bg-slate-50 gap-1.5 h-8 font-medium"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Post Announcement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 1. CREATE CLASSROOM MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create Academic Classroom</h3>
                    <p className="text-xs text-slate-500">Generates unique join code upon creation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms - Sec A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Data Structures and Algorithms"
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-DSA-301"
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                      className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department / Branch
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                      className="w-full text-xs uppercase px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enrollment Policy
                  </label>
                  <select
                    value={formData.enrollmentPolicy}
                    onChange={(e: any) => setFormData({ ...formData, enrollmentPolicy: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="OPEN">Instant Enrollment (Students join immediately upon valid code)</option>
                    <option value="APPROVAL_REQUIRED">Faculty Approval Required (Requests queue for review)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classroom Description / Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description, syllabus outline, or weekly lab meeting guidelines..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="text-xs h-9 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-5 gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    {submitting ? 'Generating...' : 'Create Classroom'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. STUDENT ROSTER MODAL */}
        {selectedRosterClassroom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedRosterClassroom.subjectCode}
                    </span>
                    <Badge className="bg-slate-100 text-slate-700">
                      Join Code: {selectedRosterClassroom.joinCode}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Enrolled Roster — {selectedRosterClassroom.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total {selectedRosterClassroom.enrolledStudents?.length || 0} enrolled students in database
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRosterClassroom(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Roster Search */}
              <div className="mt-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter roster by student name, ID, or email..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Roster Table */}
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                {filteredRosterStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No students found</p>
                    <p className="text-slate-400">
                      {selectedRosterClassroom.enrolledStudents?.length === 0
                        ? `Share join code ${selectedRosterClassroom.joinCode} with students to register enrollments.`
                        : 'No students matched your search query.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3.5">Student</th>
                          <th className="py-2.5 px-3.5">Registration ID</th>
                          <th className="py-2.5 px-3.5">Section</th>
                          <th className="py-2.5 px-3.5">Enrolled Date</th>
                          <th className="py-2.5 px-3.5">Status</th>
                          <th className="py-2.5 px-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRosterStudents.map((s) => (
                          <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3.5">
                              <span className="font-semibold text-slate-900 block">
                                {s.studentName}
                              </span>
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {s.studentEmail}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-slate-700">
                              {s.studentIdNumber}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600">
                              {s.section || 'A'}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-500">
                              {formatDate(s.joinedAt)}
                            </td>
                            <td className="py-2.5 px-3.5">
                              {s.status === 'ENROLLED' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Enrolled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              {s.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproveRejectStudent(
                                        selectedRosterClassroom.id,
                                        s.studentId,
                                        'APPROVE'
                                      )
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2.5"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleApproveRejectStudent(
                                        selectedRosterClassroom.id,
                                        s.studentId,
                                        'REJECT'
                                      )
                                    }
                                    className="text-red-600 hover:bg-red-50 text-[11px] h-7 px-2.5"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">Verified</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRosterClassroom(null)}
                  className="text-xs h-8 px-4"
                >
                  Close Roster
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. POST ANNOUNCEMENT MODAL */}
        {isAnnouncementOpen && selectedAnnounceClassroom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Post Announcement</h3>
                    <p className="text-xs text-slate-500">{selectedAnnounceClassroom.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAnnouncementOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next Week's Lab Schedule & Submission Guidelines"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message Content *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your announcement message for enrolled students..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnnouncementOpen(false)}
                    className="text-xs h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={annSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 font-semibold"
                  >
                    {annSubmitting ? 'Posting...' : 'Post to Classroom'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
