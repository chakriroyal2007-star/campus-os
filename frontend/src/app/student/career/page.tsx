'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Briefcase, Bookmark, ExternalLink, Plus, Github, Globe, Sparkles, Layers } from 'lucide-react';

export default function StudentCareerPage() {
  const [tab, setTab] = useState<'OPPORTUNITIES' | 'PROJECTS'>('OPPORTUNITIES');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectSkills, setProjectSkills] = useState('');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  // New Opportunity Modal
  const [oppModalOpen, setOppModalOpen] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppOrganizer, setOppOrganizer] = useState('');
  const [oppType, setOppType] = useState('HACKATHON');
  const [oppLocation, setOppLocation] = useState('Online');
  const [oppDeadline, setOppDeadline] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppApplyUrl, setOppApplyUrl] = useState('');
  const [savingOpp, setSavingOpp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oppData, projData] = await Promise.allSettled([
        apiFetch('/career/opportunities'),
        apiFetch('/career/projects'),
      ]);

      if (oppData.status === 'fulfilled') setOpportunities(oppData.value as any[]);
      if (projData.status === 'fulfilled') setProjects(projData.value as any[]);
    } catch {}
    setLoading(false);
  };

  const toggleSaveOpportunity = async (id: string) => {
    try {
      await apiFetch(`/career/opportunities/${id}/save`, { method: 'POST' });
      loadData();
    } catch {}
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      await apiFetch('/career/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: projectTitle,
          description: projectDesc,
          skillsTags: projectSkills,
          githubUrl: projectGithub,
          demoUrl: projectDemo,
        }),
      });
      setProjectModalOpen(false);
      setProjectTitle('');
      setProjectDesc('');
      setProjectSkills('');
      setProjectGithub('');
      setProjectDemo('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Could not publish project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOpp(true);
    try {
      await apiFetch('/career/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: oppTitle,
          companyOrOrganizer: oppOrganizer,
          type: oppType,
          location: oppLocation,
          deadline: oppDeadline || null,
          description: oppDesc,
          applyUrl: oppApplyUrl,
        }),
      });
      setOppModalOpen(false);
      setOppTitle('');
      setOppOrganizer('');
      setOppDeadline('');
      setOppDesc('');
      setOppApplyUrl('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Could not publish opportunity');
    } finally {
      setSavingOpp(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Career Hub & Project Showcase</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified hackathons, internships, student project portfolios, and team recruitment.
            </p>
          </div>

          <div className="flex gap-2">
            {tab === 'OPPORTUNITIES' ? (
              <Button size="sm" onClick={() => setOppModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Post Opportunity
              </Button>
            ) : (
              <Button size="sm" onClick={() => setProjectModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Showcase Project
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setTab('OPPORTUNITIES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'OPPORTUNITIES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Verified Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setTab('PROJECTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'PROJECTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Student Project Portfolio ({projects.length})
          </button>
        </div>

        {/* Opportunities Tab Content */}
        {tab === 'OPPORTUNITIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <Card key={opp.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                  <CardHeader className="bg-slate-50/50">
                    <Badge variant="primary">{opp.type}</Badge>
                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        opp.isSaved
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {opp.companyOrOrganizer} &bull; {opp.location}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{opp.title}</h4>
                      {opp.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{opp.description}</p>
                      )}
                    </div>

                    {opp.deadline && (
                      <span className="text-xs text-slate-500 block pt-2 border-t border-slate-100">
                        Deadline: <strong>{formatDate(opp.deadline)}</strong>
                      </span>
                    )}
                  </CardContent>

                  <div className="px-5 pb-5">
                    <a href={opp.applyUrl} target="_blank" rel="noreferrer" className="block w-full">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Apply / Register
                      </Button>
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<Briefcase className="w-6 h-6" />}
                  title="No opportunities posted yet"
                  description="Authorized users and campus organizers can post verified hackathons and internships."
                  actionLabel="Post First Opportunity"
                  onAction={() => setOppModalOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Projects Tab Content */}
        {tab === 'PROJECTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <Card key={proj.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                  <CardHeader className="bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-500">By {proj.creatorName}</span>
                    <Badge variant="success">Open Portfolio</Badge>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1">
                    <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                    {proj.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{proj.description}</p>
                    )}

                    {proj.skillsTags && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.skillsTags.split(',').map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <div className="px-5 pb-5 flex gap-2">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Github className="w-3.5 h-3.5 mr-1" />
                          Code
                        </Button>
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button size="sm" className="w-full text-xs">
                          <Globe className="w-3.5 h-3.5 mr-1" />
                          Live Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<Layers className="w-6 h-6" />}
                  title="No showcase projects found"
                  description="Publish your open source repos, hackathon projects, or portfolio demo links."
                  actionLabel="Showcase Your Project"
                  onAction={() => setProjectModalOpen(true)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Creation Modal */}
      <Modal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} title="Showcase Student Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Autonomous Campus Navigation Drone"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Explain the problem solved, tech stack, and achievements..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Input
            label="Skills & Tech Stack (Comma separated)"
            placeholder="e.g. Next.js, Python, OpenCV, ROS"
            value={projectSkills}
            onChange={(e) => setProjectSkills(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/..."
              value={projectGithub}
              onChange={(e) => setProjectGithub(e.target.value)}
            />
            <Input
              label="Live Demo URL"
              placeholder="https://myproject.demo"
              value={projectDemo}
              onChange={(e) => setProjectDemo(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={savingProject}>
              Publish to Showcase
            </Button>
          </div>
        </form>
      </Modal>

      {/* Opportunity Creation Modal */}
      <Modal isOpen={oppModalOpen} onClose={() => setOppModalOpen(false)} title="Post Verified Opportunity">
        <form onSubmit={handleCreateOpportunity} className="space-y-4">
          <Input
            label="Opportunity Title"
            placeholder="e.g. Smart India Hackathon 2026"
            value={oppTitle}
            onChange={(e) => setOppTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Organizer / Company"
              placeholder="e.g. Ministry of Education / Google"
              value={oppOrganizer}
              onChange={(e) => setOppOrganizer(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={oppType}
                onChange={(e) => setOppType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="HACKATHON">Hackathon</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="COMPETITION">Competition</option>
                <option value="SCHOLARSHIP">Scholarship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location"
              placeholder="Online / City"
              value={oppLocation}
              onChange={(e) => setOppLocation(e.target.value)}
            />
            <Input
              label="Application Deadline"
              type="date"
              value={oppDeadline}
              onChange={(e) => setOppDeadline(e.target.value)}
            />
          </div>

          <Input
            label="Registration URL"
            placeholder="https://..."
            value={oppApplyUrl}
            onChange={(e) => setOppApplyUrl(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOppModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={savingOpp}>
              Publish Opportunity
            </Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
}
