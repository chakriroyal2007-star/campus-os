'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FolderDown, FileText, Download, Search, Filter } from 'lucide-react';

const CATEGORIES = ['ALL', 'LECTURE_NOTE', 'SLIDE', 'LAB_MANUAL', 'SYLLABUS', 'REFERENCE'];

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/resources/student/my');
      setResources(data);
    } catch {}
    setLoading(false);
  };

  const filtered = resources.filter((r) => {
    const matchesCat = selectedCat === 'ALL' || r.category === selectedCat;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Subject lecture slides, lab manuals, syllabus documents, and verified faculty study materials.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((res) => (
              <Card key={res.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <Badge variant="primary">{res.category.replace('_', ' ')}</Badge>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {res.subjectName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{res.title}</h4>
                    {res.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{res.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>By {res.uploaderName}</span>
                    <span>{formatDate(res.createdAt)}</span>
                  </div>
                </CardContent>

                <div className="px-5 pb-4">
                  <a
                    href={`/api/v1/resources/download/${res.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full"
                  >
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download {res.fileName ? `(${res.fileName})` : 'File'}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderDown className="w-6 h-6" />}
            title="No study resources found"
            description="Faculty uploads and course documents will appear here when published."
          />
        )}
      </div>
    </StudentLayout>
  );
}
