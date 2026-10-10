'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiFetch, getStoredUser } from '@/lib/api';
import { User, Mail, Building2, ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data: any = await apiFetch('/auth/me');
      setProfile(data);
    } catch {
      setProfile(getStoredUser());
    }
    setLoading(false);
  };

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Profile & Credentials</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified academic identity, institutional registration, and program attributes.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{profile?.fullName || `${profile?.firstName} ${profile?.lastName}`}</h3>
                  <Badge variant="success">Verified Account</Badge>
                </div>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                <p className="text-xs font-semibold text-blue-600">
                  Roll ID: {profile?.studentProfile?.studentIdNumber || profile?.studentIdNumber || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                  Institution
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {profile?.institutionName || 'CampusOS Pilot University'}
                </span>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                  Academic Department
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {profile?.studentProfile?.departmentName || profile?.departmentName || 'Computer Science & Engineering'}
                </span>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                  Current Term & Semester
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  Semester {profile?.studentProfile?.currentSemester || profile?.currentSemester || 1} &bull; Section {profile?.studentProfile?.section || profile?.section || 'A'}
                </span>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                  Enrollment Status
                </span>
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {profile?.studentProfile?.enrollmentStatus || 'ACTIVE ENROLLED'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
