'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileCheck2, Clock, Upload, CheckCircle2, MessageSquare } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [contentText, setContentText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentFilename, setAttachmentFilename] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/assignments/student/my');
      setAssignments(data);
    } catch {}
    setLoading(false);
  };

  const openSubmitModal = (assign: any) => {
    setSelectedAssignment(assign);
    setContentText(assign.mySubmission?.contentText || '');
    setAttachmentUrl(assign.mySubmission?.attachmentUrl || '');
    setAttachmentFilename(assign.mySubmission?.attachmentFilename || '');
    setError(null);
    setSubmitModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch('/assignments/student/submit', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          contentText,
          attachmentUrl,
          attachmentFilename,
          idempotencyKey: `sub-${selectedAssignment.id}-${Date.now()}`,
        }),
      });
      setSubmitModalOpen(false);
      loadAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assignments & Submissions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Published course assignments, rubrics, deadlines, server-side submission timestamps, and feedback.
          </p>
        </div>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assign) => (
              <Card key={assign.id} className="hover:border-slate-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                          {assign.subjectCode}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{assign.subjectName}</span>
                        {assign.myGrade ? (
                          <Badge variant="success">Graded: {assign.myGrade.marksObtained} / {assign.maxMarks}</Badge>
                        ) : assign.mySubmission ? (
                          <Badge variant="primary">Submitted (v{assign.mySubmission.versionNumber})</Badge>
                        ) : (
                          <Badge variant="warning">Action Required</Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{assign.title}</h3>
                      {assign.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">{assign.description}</p>
                      )}

                      {assign.instructions && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60">
                          <strong>Instructions:</strong> {assign.instructions}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Due: {formatDate(assign.dueDate)}
                        </span>
                        <span>Max Marks: <strong>{assign.maxMarks}</strong></span>
                        {assign.weightagePercent > 0 && (
                          <span>Weightage: <strong>{assign.weightagePercent}%</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Action & Feedback Box */}
                    <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
                      {assign.myGrade?.feedback && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 max-w-sm">
                          <div className="flex items-center gap-1 font-bold mb-1 text-emerald-900">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Instructor Feedback
                          </div>
                          <p>{assign.myGrade.feedback}</p>
                        </div>
                      )}

                      <Button size="sm" onClick={() => openSubmitModal(assign)}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {assign.mySubmission ? 'Resubmit / Edit' : 'Submit Assignment'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileCheck2 className="w-6 h-6" />}
            title="No assignments posted"
            description="When professors publish tasks, you will be able to review rubrics and submit files here."
          />
        )}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit: ${selectedAssignment?.title || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Response / Written Solution
            </label>
            <textarea
              rows={5}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Type your explanation, report summary, or code solution here..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Attachment URL"
              placeholder="e.g. https://storage.campusos.internal/submission.zip"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
            <Input
              label="File Name"
              placeholder="e.g. lab1_solution.zip"
              value={attachmentFilename}
              onChange={(e) => setAttachmentFilename(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Confirm Submission
            </Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
}
