'use client';

import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { FolderDown, Plus, FileText, Upload, CheckCircle2 } from 'lucide-react';

export default function TeacherResourcesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('LECTURE_NOTE');
  const [fileKey, setFileKey] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data: any = await apiFetch('/academic/courses/teaching');
      setCourses(data);
      if (data.length > 0) setSelectedCourseId(data[0].id);
    } catch {}
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/resources/upload', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedCourseId || null,
          title,
          description,
          category,
          fileKey: fileKey || `res-${Date.now()}`,
          fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          mimeType: 'application/pdf',
          isPublished: true,
        }),
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setFileKey('');
      setFileName('');
      alert('Resource metadata published successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Hub Management</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Publish lecture slides, reference manuals, syllabus copies, and study notes.
            </p>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => setModalOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" />
            Upload Resource
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-indigo-600" />
              Published Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<FolderDown className="w-6 h-6" />}
              title="Upload your first course document"
              description="Click 'Upload Resource' to share lecture slides, lab manuals, and syllabus files with students."
              actionLabel="Upload Material"
              onAction={() => setModalOpen(true)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Course Resource">
        <form onSubmit={handleUploadResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Course Offering
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subjectCode} - {c.subjectName} (Sec {c.section})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Resource Title"
            placeholder="e.g. Chapter 3: Virtual Memory & Page Faults"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="LECTURE_NOTE">Lecture Note</option>
                <option value="SLIDE">Slide Deck</option>
                <option value="LAB_MANUAL">Lab Manual</option>
                <option value="SYLLABUS">Syllabus</option>
                <option value="REFERENCE">Reference Reading</option>
              </select>
            </div>
            <Input
              label="File Name"
              placeholder="e.g. lecture_03_slides.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Storage Key / URI"
            placeholder="e.g. s3://campusos/courses/cs301/lecture3.pdf"
            value={fileKey}
            onChange={(e) => setFileKey(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Optional summary for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" isLoading={saving}>
              Publish Document
            </Button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}
