'use client';

import React, { useEffect, useState } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiFetch } from '@/lib/api';
import { Clock, MapPin, UserCheck, Calendar } from 'lucide-react';

interface ClassSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  section: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomCode: string;
  roomName: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ParentTimetablePage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const data = await apiFetch<ClassSession[]>('/parent/timetable');
        setSessions(data || []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const daySessions = sessions.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Class Schedule & Timetable</h1>
            <p className="text-xs text-slate-400 mt-1">
              Live weekly lecture sessions, laboratory timings, and assigned room venues.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Section A Schedule</span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {DAYS.map((d, idx) => (
            <button
              key={d}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === idx + 1
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sessions for selected day */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading daily schedule...</div>
          ) : daySessions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
              No classes scheduled for {DAYS[selectedDay - 1]}.
            </div>
          ) : (
            daySessions.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex flex-col items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">{s.startTime.slice(0, 5)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                        {s.subjectCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Sec {s.section}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{s.subjectName}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.teacherName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 justify-end">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {s.roomCode}
                  </span>
                  <p className="text-[10px] text-slate-500">{s.roomName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
