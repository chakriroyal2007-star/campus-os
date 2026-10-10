'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, History, Info } from 'lucide-react';

export default function StudentAttendancePage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/attendance/student/overview');
      setOverview(data);
    } catch {}
    setLoading(false);
  };

  const viewHistory = async (sub: any) => {
    setSelectedSubject(sub);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const data: any = await apiFetch(`/attendance/student/history/${sub.courseOfferingId}`);
      setHistoryRecords(data);
    } catch {}
    setLoadingHistory(false);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance & Eligibility</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real persisted attendance records, official percentage calculations, and predictive recovery forecasts.
          </p>
        </div>

        {/* Overall Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Overall Attendance"
            value={overview?.totalConductedAcrossAll ? `${overview.overallPercentage}%` : 'N/A'}
            subtitle={
              overview?.totalConductedAcrossAll
                ? `${overview.totalAttendedAcrossAll} of ${overview.totalConductedAcrossAll} classes attended`
                : 'No classes recorded yet'
            }
            icon={<UserCheck className="w-5 h-5" />}
            trend={overview?.overallPercentage >= (overview?.minimumRequiredPercentage || 75) ? 'Eligible' : 'Shortage'}
            trendType={overview?.overallPercentage >= (overview?.minimumRequiredPercentage || 75) ? 'positive' : 'negative'}
          />

          <StatCard
            title="Institutional Requirement"
            value={`${overview?.minimumRequiredPercentage || 75}%`}
            subtitle="Minimum threshold for exam eligibility"
            icon={<Info className="w-5 h-5" />}
          />

          <StatCard
            title="Enrolled Subjects"
            value={overview?.subjects?.length || 0}
            subtitle="Active course offerings"
            icon={<UserCheck className="w-5 h-5" />}
          />
        </div>

        {/* Subject-wise Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Subject Breakdown & Eligibility Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview?.subjects && overview.subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.subjects.map((sub: any) => (
                  <div
                    key={sub.courseOfferingId}
                    className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {sub.subjectCode}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{sub.subjectName}</h4>
                      </div>
                      <Badge variant={sub.isEligible ? 'success' : 'danger'}>
                        {sub.isEligible ? 'Eligible' : 'Shortage'}
                      </Badge>
                    </div>

                    {/* Progress Bar & Number */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {sub.totalAttended} / {sub.totalConducted} classes attended
                        </span>
                        <span className={`text-base font-bold ${sub.isEligible ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {sub.currentPercentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sub.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Number(sub.currentPercentage))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Detailed Stats & Forecast */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-emerald-50/60">
                        <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Present</span>
                        <span className="font-bold text-emerald-900">{sub.totalAttended}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50/60">
                        <span className="text-[10px] text-rose-800 font-semibold uppercase block">Absent</span>
                        <span className="font-bold text-rose-900">{sub.totalAbsent}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50/60">
                        <span className="text-[10px] text-amber-800 font-semibold uppercase block">Late / Excused</span>
                        <span className="font-bold text-amber-900">{sub.totalLate + sub.totalExcused}</span>
                      </div>
                    </div>

                    {/* Predictive Recovery / Safety Margin Box */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                      {sub.isEligible ? (
                        <div className="flex items-center gap-2 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>
                            Safe margin: Can miss up to <strong>{sub.maxAbsencesAllowedBeforeShortage}</strong> classes.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>
                            Recovery: Attend next <strong>{sub.classesNeededForTarget}</strong> consecutive classes.
                          </span>
                        </div>
                      )}

                      <Button size="sm" variant="ghost" onClick={() => viewHistory(sub)}>
                        <History className="w-3.5 h-3.5 mr-1" />
                        History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<UserCheck className="w-6 h-6" />}
                title="No attendance records available"
                description="Your faculty has not logged any class sessions for your courses yet."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Session History: ${selectedSubject?.subjectName || ''}`}
        maxWidth="lg"
      >
        {loadingHistory ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading attendance history...</div>
        ) : historyRecords.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {historyRecords.map((rec) => (
              <div key={rec.recordId} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Recorded by Faculty
                  </span>
                  {rec.remarks && (
                    <span className="text-xs text-slate-500 block mt-0.5">Note: {rec.remarks}</span>
                  )}
                </div>
                <div>
                  {rec.status === 'PRESENT' && <Badge variant="success">Present</Badge>}
                  {rec.status === 'ABSENT' && <Badge variant="danger">Absent</Badge>}
                  {rec.status === 'LATE' && <Badge variant="warning">Late</Badge>}
                  {rec.status === 'EXCUSED' && <Badge variant="neutral">Excused</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<History className="w-6 h-6" />}
            title="No session history for this course"
            description="Detailed session records will appear here as they are taken."
          />
        )}
      </Modal>
    </StudentLayout>
  );
}
