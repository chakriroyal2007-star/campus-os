'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { Building2, Save, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface InstitutionDetail {
  id: string;
  code: string;
  name: string;
  domain: string;
  timezone: string;
  minimumAttendanceThreshold: number;
}

export default function AdminInstitutionPage() {
  const [inst, setInst] = useState<InstitutionDetail | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [threshold, setThreshold] = useState(75.0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<InstitutionDetail>('/admin/institution');
        setInst(res);
        setName(res.name);
        setDomain(res.domain || '');
        setTimezone(res.timezone || 'Asia/Kolkata');
        setThreshold(res.minimumAttendanceThreshold || 75.0);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load institution details' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiFetch<InstitutionDetail>('/admin/institution', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          domain,
          timezone,
          minimumAttendanceThreshold: threshold,
        }),
      });
      setInst(res);
      setMessage({ type: 'success', text: 'Institution profile and attendance policies updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update institution' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Institution Identity & Academic Policy
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure official college parameters, tenant code, and institutional minimum attendance requirements.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading profile...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">College Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution Code (Permanent Tenant ID)</label>
                  <input
                    type="text"
                    disabled
                    value={inst?.code || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Assigned during institution provisioning</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official College Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Apex Institute of Technology"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Email Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. apex.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Attendance Policy Configuration</h3>
              <p className="text-xs text-slate-400">
                Sets the baseline threshold used by the automated recovery math engine to alert students and calculate classes needed.
              </p>

              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Attendance Requirement (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.5"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Default standard requirement is 75.00%</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
