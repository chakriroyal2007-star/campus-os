'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatTime, formatDuration } from '@/lib/utils';
import { Calendar, Clock, MapPin, User, AlertTriangle } from 'lucide-react';

const DAYS = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
];

export default function StudentTimetablePage() {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1);
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/timetable/student');
      setTimetable(data);
    } catch {}
    setLoading(false);
  };

  const daySessions = timetable?.sessions?.filter((s: any) => s.dayOfWeek === selectedDay) || [];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Academic Timetable</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Server-authoritative schedule with live countdowns, room allocations, and schedule change updates.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {DAYS.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Classes for {DAYS.find((d) => d.id === selectedDay)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {daySessions.length > 0 ? (
              <div className="space-y-4">
                {daySessions.map((session: any) => (
                  <div
                    key={session.id}
                    className={`p-5 rounded-xl border transition-all ${
                      session.isCancelled
                        ? 'bg-rose-50/50 border-rose-200/80'
                        : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                            {session.subjectCode}
                          </span>
                          <span className="text-xs font-medium text-slate-500">Section {session.section}</span>
                          {session.isCancelled ? (
                            <Badge variant="danger">Cancelled</Badge>
                          ) : (
                            <Badge variant="success">Confirmed</Badge>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{session.subjectName}</h4>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            Room {session.roomNumber} ({session.building})
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {session.teacherName}
                          </span>
                        </div>
                      </div>

                      {session.isCancelled && (
                        <div className="p-3 bg-rose-100/70 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 max-w-sm">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                          <div>
                            <span className="font-semibold block">Class Cancelled</span>
                            <span>{session.cancellationReason || 'Notice posted by instructor'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-6 h-6" />}
                title={`No classes on ${DAYS.find((d) => d.id === selectedDay)?.label}`}
                description="Use this free period for self-directed study, assignments, or project collaboration."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
