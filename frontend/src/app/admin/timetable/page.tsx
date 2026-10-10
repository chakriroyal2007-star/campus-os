'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiFetch } from '@/lib/api';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface ClassSession {
  id: string;
  courseOfferingId: string;
  subjectCode: string;
  subjectName: string;
  section: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomNumber: string;
  teacherName: string;
}

interface CourseOffering {
  id: string;
  subjectCode: string;
  subjectName: string;
  section: string;
}

export default function AdminTimetablePage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1); // 1 = Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [sessionTitle, setSessionTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadData = async () => {
    try {
      const [sessionsRes, offeringsRes] = await Promise.all([
        apiFetch<ClassSession[]>('/timetable/sessions'),
        apiFetch<CourseOffering[]>('/admin/courses'),
      ]);
      setSessions(sessionsRes);
      setOfferings(offeringsRes);
      if (offeringsRes.length > 0 && !selectedOfferingId) {
        setSelectedOfferingId(offeringsRes[0].id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load timetable sessions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/admin/timetable/schedule', {
        method: 'POST',
        body: JSON.stringify({
          courseOfferingId: selectedOfferingId,
          dayOfWeek,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          recurrenceType: 'WEEKLY',
          sessionTitle: sessionTitle || null,
        }),
      });
      setShowModal(false);
      setMessage({ type: 'success', text: 'Lecture session scheduled on timetable successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to schedule session' });
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
              <Clock className="w-5 h-5 text-indigo-400" />
              Master Timetable & Class Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Schedule weekly recurring lecture sessions across subjects, sections, and rooms.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
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

        {/* Timetable Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Scheduled Weekly Class Sessions ({sessions.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No class sessions scheduled yet. Click &quot;Schedule Session&quot;.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{days[s.dayOfWeek - 1] || `Day ${s.dayOfWeek}`}</td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{s.subjectCode} - {s.subjectName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          Sec {s.section}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{s.teacherName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.roomNumber || 'Main Hall'}</td>
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
                <h3 className="text-sm font-bold text-white">Schedule Class Lecture</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Course Offering & Section</label>
                  <select
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {offerings.map((co) => (
                      <option key={co.id} value={co.id}>{co.subjectCode} ({co.subjectName}) — Sec {co.section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {days.map((d, i) => (
                      <option key={i} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Regular Lecture / Lab Session"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
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
                    {saving ? 'Scheduling...' : 'Save Schedule'}
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
