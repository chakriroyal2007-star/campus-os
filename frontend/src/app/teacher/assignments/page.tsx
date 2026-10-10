'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileCheck2, Plus, Users, Award, ExternalLink, MessageSquare } from 'lucide-react';

function AssignmentsContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxMarks, setMaxMarks] = useState('100.00');
  const [weightage, setWeightage] = useState('10.00');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Submissions & Grading Modal
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [marksObtained, setMarksObtained] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const data: any = await apiFetch('/academic/courses/teaching');
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch {}
    setLoading(false);
  };

  const loadAssignments = async (courseId: string) => {
    setLoading(true);
    try {
      const data: any = await apiFetch(`/assignments/teacher/course/${courseId}`);
      setAssignments(data);
    } catch {}
    setLoading(false);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      await apiFetch('/assignments/teacher/create', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedCourseId,
          title,
          description,
          instructions,
          maxMarks: Number(maxMarks),
          weightagePercent: Number(weightage),
          dueDate: new Date(dueDate).toISOString(),
          allowLateSubmissions: true,
          isPublished: true,
        }),
      });
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setInstructions('');
      setDueDate('');
      loadAssignments(selectedCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  const openSubmissions = async (assign: any) => {
    setSelectedAssignment(assign);
    setViewSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const data: any = await apiFetch(`/assignments/teacher/submissions/${assign.id}`);
      setSubmissions(data);
    } catch {}
    setLoadingSubmissions(false);
  };

  const openGradeModal = (sub: any) => {
    setSelectedSub(sub);
    setMarksObtained('');
    setFeedback('');
    setGradeModalOpen(true);
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrading(true);
    try {
      await apiFetch('/assignments/teacher/grade', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          studentId: selectedSub.studentId,
          submissionId: selectedSub.id,
          marksObtained: Number(marksObtained),
          feedback,
          isPublished,
        }),
      });
      setGradeModalOpen(false);
      openSubmissions(selectedAssignment);
    } catch (err: any) {
      alert(err.message || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assignments & Evaluation</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create assignments with rubrics, inspect student submissions, and return publishable grades.
            </p>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Assignment
          </Button>
        </div>

        {/* Course Filter */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 max-w-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subjectCode} - {c.subjectName} (Section {c.section})
              </option>
            ))}
          </select>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assign) => (
              <Card key={assign.id} className="hover:border-slate-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{assign.subjectCode}</Badge>
                        <Badge variant="success">Max Marks: {assign.maxMarks}</Badge>
                        <span className="text-xs text-slate-400">Due: {formatDate(assign.dueDate)}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{assign.title}</h4>
                      {assign.description && (
                        <p className="text-xs text-slate-500 max-w-2xl">{assign.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openSubmissions(assign)}>
                        <Users className="w-3.5 h-3.5 mr-1" />
                        View Submissions ({assign.totalSubmissionsCount || 0})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={<FileCheck2 className="w-6 h-6" />}
              title="No assignments created for this course"
              description="Click 'Create Assignment' above to publish guidelines and rubrics."
            />
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Assignment" maxWidth="lg">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input
            label="Assignment Title"
            placeholder="e.g. Lab 2: Multi-threaded Server Implementation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Overview
            </label>
            <textarea
              rows={3}
              placeholder="Explain the background and problem statement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Instructions & Rubric
            </label>
            <textarea
              rows={3}
              placeholder="Specify formatting rules, zip attachments, grading weightage..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Max Marks"
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              required
            />
            <Input
              label="Weightage (%)"
              type="number"
              value={weightage}
              onChange={(e) => setWeightage(e.target.value)}
            />
            <Input
              label="Due Date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" isLoading={saving}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={viewSubmissionsModal}
        onClose={() => setViewSubmissionsModal(false)}
        title={`Submissions: ${selectedAssignment?.title || ''}`}
        maxWidth="xl"
      >
        {loadingSubmissions ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading submissions...</div>
        ) : submissions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div key={sub.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{sub.studentName}</span>
                    <span className="text-[10px] text-slate-400">({sub.studentIdNumber})</span>
                    {sub.isLate && <Badge variant="danger">Late</Badge>}
                  </div>
                  {sub.contentText && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg max-w-lg">
                      {sub.contentText}
                    </p>
                  )}
                  {sub.attachmentUrl && (
                    <a
                      href={sub.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Attachment: {sub.attachmentFilename || 'View File'}
                    </a>
                  )}
                </div>

                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => openGradeModal(sub)}>
                  <Award className="w-3.5 h-3.5 mr-1" />
                  Grade
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileCheck2 className="w-6 h-6" />}
            title="No student submissions yet"
            description="When enrolled students submit their work, it will appear here for grading."
          />
        )}
      </Modal>

      {/* Grade Modal */}
      <Modal isOpen={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Grade Student Submission">
        <form onSubmit={handleGradeSubmission} className="space-y-4">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
            <span className="font-bold text-indigo-900 block">{selectedSub?.studentName}</span>
            <span className="text-indigo-700">Max Marks Allowed: {selectedAssignment?.maxMarks}</span>
          </div>

          <Input
            label="Marks Obtained"
            type="number"
            step="0.1"
            placeholder="e.g. 95.5"
            value={marksObtained}
            onChange={(e) => setMarksObtained(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Instructor Feedback
            </label>
            <textarea
              rows={3}
              placeholder="Provide constructive comments on architecture, performance, or errors..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" isLoading={grading}>
              Publish Grade
            </Button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}

export default function TeacherAssignmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Assignments Portal...</div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
