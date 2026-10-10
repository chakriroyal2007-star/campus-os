'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  X,
  Layers,
  ChevronRight,
  Database,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch, setStoredUser, UserSession } from '@/lib/api';
import GalaxyCanvas from '@/components/galaxy/GalaxyCanvas';

export default function WelcomeGalaxyPage() {
  const router = useRouter();

  // Cinematic sequence state
  const [sequenceStage, setSequenceStage] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [exploreModalOpen, setExploreModalOpen] = useState(false);

  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_COLLEGE_ADMIN'>('ROLE_STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [institutionCode, setInstitutionCode] = useState('INST001');
  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [facultyIdNumber, setFacultyIdNumber] = useState('');
  const [section, setSection] = useState('A');
  const [currentSemester, setCurrentSemester] = useState(1);

  // Cinematic Sequence Timings
  useEffect(() => {
    // Stage 1: Reveal Universe & Stars
    const timer1 = setTimeout(() => setSequenceStage(1), 100);
    // Stage 2: Illuminate Galaxy & Branding
    const timer2 = setTimeout(() => setSequenceStage(2), 600);
    // Stage 3: Reveal Headline & Action Buttons
    const timer3 = setTimeout(() => setSequenceStage(3), 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleOpenAuth = (defaultRole?: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_COLLEGE_ADMIN') => {
    if (defaultRole) setRole(defaultRole);
    setAuthModalOpen(true);
    setExploreModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (role === 'ROLE_COLLEGE_ADMIN') {
          const payload = {
            institutionCode: institutionCode.trim(),
            institutionName: institutionName.trim() || `${institutionCode.trim().toUpperCase()} College`,
            adminEmail: email.trim(),
            adminPassword: password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            timezone: 'Asia/Kolkata',
          };
          const data = await apiFetch<UserSession>('/admin/bootstrap', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          setStoredUser(data);
          router.push('/admin/dashboard');
          return;
        }

        const payload = {
          institutionCode: institutionCode.trim(),
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role,
          studentIdNumber: role === 'ROLE_STUDENT' ? studentIdNumber.trim() : undefined,
          facultyIdNumber: role === 'ROLE_TEACHER' ? facultyIdNumber.trim() : undefined,
          section: role === 'ROLE_STUDENT' ? section : undefined,
          currentSemester: role === 'ROLE_STUDENT' ? Number(currentSemester) : undefined,
        };
        const data = await apiFetch<UserSession>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setStoredUser(data);
        if (data.roles.includes('ROLE_TEACHER')) {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        const payload = {
          email: email.trim(),
          password,
          institutionCode: institutionCode.trim() || undefined,
        };
        const data = await apiFetch<UserSession>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setStoredUser(data);
        if (
          data.roles.includes('ROLE_COLLEGE_ADMIN') ||
          data.roles.includes('ROLE_ADMIN') ||
          data.roles.includes('ROLE_SUPER_ADMIN')
        ) {
          router.push('/admin/dashboard');
        } else if (data.roles.includes('ROLE_TEACHER')) {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 overflow-x-hidden select-none font-sans">
      {/* 1. REAL-TIME 3D GALAXY CANVAS BACKGROUND */}
      <GalaxyCanvas interactive={true} />

      {/* Subtle Vignette Overlay for Crisp Contrast */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030712]/40 to-[#030712]/90 pointer-events-none z-0" />

      {/* 2. TOP FLOATING NAVIGATION BAR */}
      <header
        className={`relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between transition-all duration-1000 ${
          sequenceStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-300 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#070d1e] rounded-[10px] flex items-center justify-center text-white font-extrabold text-lg tracking-wider">
              C
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-widest text-white uppercase bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              CAMPUSOS
            </span>
            <span className="text-[10px] tracking-wider text-blue-400 font-medium uppercase">
              Higher Education OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExploreModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 backdrop-blur-md transition-all duration-200"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => handleOpenAuth()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 border border-blue-400/30 transition-all duration-200 active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION OVERLAY */}
      <main className="relative z-10 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 sm:px-12 text-center max-w-5xl mx-auto pointer-events-none">
        {/* Luminous Brand Badge */}
        <div
          className={`pointer-events-auto inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-xl shadow-lg shadow-blue-500/10 mb-6 transition-all duration-1000 ${
            sequenceStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="tracking-wide">THE CONNECTED DIGITAL CAMPUS UNIVERSE</span>
        </div>

        {/* Main Headline */}
        <h1
          className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 transition-all duration-1000 ${
            sequenceStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
            Your Campus.{' '}
          </span>
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(112,214,255,0.4)]">
            Your World. Your Future.
          </span>
        </h1>

        {/* Supporting Text */}
        <p
          className={`text-slate-300 text-base sm:text-xl font-normal max-w-2xl leading-relaxed mb-10 text-slate-200/90 transition-all duration-1000 delay-150 ${
            sequenceStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          One connected space to learn, teach, collaborate, and grow.
        </p>

        {/* Action CTAs */}
        <div
          className={`pointer-events-auto flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-300 ${
            sequenceStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={() => handleOpenAuth()}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 border border-blue-300/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>Enter CampusOS</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          <button
            onClick={() => setExploreModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold text-slate-200 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl shadow-lg hover:border-slate-500 transition-all duration-200 active:scale-95"
          >
            <Compass className="w-5 h-5 text-amber-300" />
            <span>Explore the Platform</span>
          </button>
        </div>

        {/* Interactive Quick Portal Cards */}
        <div
          className={`pointer-events-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl mt-14 transition-all duration-1000 delay-500 ${
            sequenceStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={() => handleOpenAuth('ROLE_STUDENT')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 backdrop-blur-xl text-left transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              Student Workspace
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Roster subjects, timetable, attendance & AI tutor.
            </p>
          </button>

          <button
            onClick={() => handleOpenAuth('ROLE_TEACHER')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 backdrop-blur-xl text-left transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              Faculty Workspace
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Teaching classes, real rosters, assignments & marks.
            </p>
          </button>

          <button
            onClick={() => handleOpenAuth('ROLE_COLLEGE_ADMIN')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 backdrop-blur-xl text-left transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              College Admin
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Terms, branches, sections, offerings & allocation.
            </p>
          </button>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer
        className={`relative z-20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800/50 backdrop-blur-md transition-all duration-1000 ${
          sequenceStage >= 3 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span>CampusOS &copy; 2026. Connected Higher Education Operating System.</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px] text-slate-500">
          <span>Real-time 3D Particle Universe</span>
          <span>•</span>
          <span>PostgreSQL Persistence</span>
        </div>
      </footer>

      {/* 5. AUTHENTICATION & LOGIN MODAL OVERLAY */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0b132b]/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Role Switcher */}
            <div className="grid grid-cols-3 p-1 bg-slate-900/90 rounded-2xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => setRole('ROLE_STUDENT')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'ROLE_STUDENT'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ROLE_TEACHER')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'ROLE_TEACHER'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRole('ROLE_COLLEGE_ADMIN')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'ROLE_COLLEGE_ADMIN'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            <div className="mb-5">
              <h3 className="text-xl font-bold text-white">
                {isRegister
                  ? `Register ${
                      role === 'ROLE_STUDENT'
                        ? 'Student'
                        : role === 'ROLE_TEACHER'
                        ? 'Faculty'
                        : 'College Admin'
                    }`
                  : 'Sign in to CampusOS'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRegister
                  ? 'Create your institutional profile on CampusOS'
                  : 'Enter your credentials to enter your digital workspace'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-medium text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label={`Institution Code ${isRegister ? '' : '(Optional)'}`}
                placeholder="e.g. INST001"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
                required={isRegister}
              />

              {isRegister && role === 'ROLE_COLLEGE_ADMIN' && (
                <Input
                  label="College / Institution Name"
                  placeholder="e.g. Apex Institute of Technology"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              )}

              {isRegister && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="First Name"
                    placeholder="e.g. Arjun"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              )}

              <Input
                label="Campus Email"
                type="email"
                placeholder={
                  role === 'ROLE_STUDENT'
                    ? 'student@campus.edu'
                    : role === 'ROLE_TEACHER'
                    ? 'faculty@campus.edu'
                    : 'admin@campus.edu'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {isRegister && role === 'ROLE_STUDENT' && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Roll / Student ID"
                    placeholder="e.g. CS2026-001"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    required
                  />
                  <Input
                    label="Section"
                    placeholder="e.g. A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                  />
                </div>
              )}

              {isRegister && role === 'ROLE_TEACHER' && (
                <Input
                  label="Faculty ID"
                  placeholder="e.g. FAC-CS-101"
                  value={facultyIdNumber}
                  onChange={(e) => setFacultyIdNumber(e.target.value)}
                  required
                />
              )}

              <Button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold ${
                  role === 'ROLE_COLLEGE_ADMIN'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                    : role === 'ROLE_TEACHER'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                }`}
                isLoading={loading}
              >
                <span>{isRegister ? 'Complete Registration' : 'Enter Portal'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register here'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXPLORE THE PLATFORM SPOTLIGHT MODAL */}
      {exploreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#0b132b]/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setExploreModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>CampusOS Architecture & Modules</span>
            </div>
            <h3 className="text-2xl font-black text-white">One Connected Higher Education OS</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Every portal operates on one synchronized PostgreSQL source of truth across terms, sections, course offerings, and real rosters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Student Hub</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Auto-enrolled section subjects</li>
                    <li>• Real-time attendance % & forecasts</li>
                    <li>• Integrated AI Course Tutor</li>
                    <li>• Assessments & Grade results</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('ROLE_STUDENT')}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 transition-all"
                >
                  Launch Student
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Faculty Hub</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Assigned course offering classes</li>
                    <li>• Actual enrolled student rosters</li>
                    <li>• 1-Click Session attendance</li>
                    <li>• Assignment & Quiz management</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('ROLE_TEACHER')}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all"
                >
                  Launch Faculty
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Admin Command</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Terms, Branches & Section setup</li>
                    <li>• Dynamic Subject Catalog</li>
                    <li>• Faculty Teaching Assignments</li>
                    <li>• Bulk Section Auto-Enrollment</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('ROLE_COLLEGE_ADMIN')}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all"
                >
                  Launch Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
