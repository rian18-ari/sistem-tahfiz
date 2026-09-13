'use client';

import React, { useMemo } from 'react';
import {
  Student,
  Teacher,
  TahfizGroup,
  MemorizationRecord,
  User,
} from '@/types/tahfiz';
import {
  Users,
  Award,
  BookOpen,
  Plus,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardTeacherProps {
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  records: MemorizationRecord[];
  onOpenSetoranModal: (preselectedStudentId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onViewStudentDetail: (student: Student) => void;
}

export default function DashboardTeacher({
  currentUser,
  students,
  teachers,
  groups,
  records,
  onOpenSetoranModal,
  onNavigateTab,
  onViewStudentDetail,
}: DashboardTeacherProps) {
  // Current teacher info
  const teacher = useMemo(() => {
    return (
      teachers.find((t) => t.id === currentUser.associatedId) ||
      teachers[0]
    );
  }, [teachers, currentUser]);

  // Halaqah groups for this teacher
  const teacherGroups = useMemo(() => {
    return groups.filter((g) => g.teacherId === teacher.id);
  }, [groups, teacher]);

  // Students mentored by this teacher
  const myStudents = useMemo(() => {
    return students.filter((s) => s.teacherId === teacher.id);
  }, [students, teacher]);

  // Today string
  const todayStr = new Date().toISOString().split('T')[0];

  // Records for this teacher's students
  const myRecords = useMemo(() => {
    const studentIds = new Set(myStudents.map((s) => s.id));
    return records.filter((r) => studentIds.has(r.studentId) || r.teacherId === teacher.id);
  }, [records, myStudents, teacher]);

  const todayRecords = useMemo(() => {
    return myRecords.filter((r) => r.date === todayStr);
  }, [myRecords, todayStr]);

  // Target achievement
  const reachedCount = useMemo(() => {
    return myStudents.filter(
      (s) => s.target.monthlyRealizationPages >= s.target.monthlyTargetPages
    ).length;
  }, [myStudents]);

  // Halaqah average score
  const halaqahAverage = useMemo(() => {
    if (myRecords.length === 0) return 85;
    const total = myRecords.reduce((sum, r) => sum + r.assessment.finalScore, 0);
    return Math.round(total / myRecords.length);
  }, [myRecords]);

  return (
    <div id="dashboard-teacher" className="space-y-6">
      {/* Teacher Header Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              Dashboard Asatidz
            </span>
            <span className="text-xs text-emerald-200">
              • {teacherGroups.map((g) => g.name).join(', ') || 'Halaqah Tahfiz'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
            Ahlan wa Sahlan, {teacher.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Membimbing {myStudents.length} santri aktif. Catat setoran hafalan baru, berikan evaluasi multi-aspek, dan pantau kelancaran tilawah santri.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenSetoranModal()}
            className="px-5 py-3 bg-white text-emerald-900 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            Catat Setoran Hafalan
          </button>
        </div>
      </div>

      {/* 4 KPI Cards for Teacher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Santri Bimbingan</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {myStudents.length} <span className="text-xs text-slate-400 font-normal">Santri</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {teacherGroups.length} Kelompok halaqah binaan
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Setoran Hari Ini</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {todayRecords.length} <span className="text-xs text-slate-400 font-normal">Setoran</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {todayRecords.filter((r) => r.status === 'Lulus').length} Lulus dievaluasi
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Target Bulan Ini</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {reachedCount} <span className="text-xs text-slate-400 font-normal">/ {myStudents.length} Santri</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {Math.round((reachedCount / Math.max(1, myStudents.length)) * 100)}% santri tuntas
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rata-rata Nilai Halaqah</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {halaqahAverage}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              Predikat: {halaqahAverage >= 90 ? 'Sangat Baik' : halaqahAverage >= 80 ? 'Baik' : 'Cukup'}
            </div>
          </div>
        </div>
      </div>

      {/* Santri Bimbingan List with Quick Action to Record Setoran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Daftar Santri Bimbingan Anda
            </h3>
            <p className="text-xs text-slate-500">
              Klik &quot;Catat Setoran&quot; untuk input langsung hasil setoran hafalan
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {myStudents.map((student) => {
            const percent = Math.min(
              100,
              Math.round(
                (student.target.monthlyRealizationPages / student.target.monthlyTargetPages) * 100
              )
            );

            return (
              <div
                key={student.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onViewStudentDetail(student)}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 hover:text-emerald-700">
                        {student.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        Kelas {student.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      NIS: {student.nis} • Hafalan: <strong>{student.totalJuzCompleted} Juz</strong> ({student.totalAyatMemorized} Ayat)
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full md:w-64">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">
                      Target Bulan ini: {student.target.monthlyRealizationPages} / {student.target.monthlyTargetPages} Hlm
                    </span>
                    <span className="font-bold text-slate-800">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Quick Action */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewStudentDetail(student)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Profil
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenSetoranModal(student.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Catat Setoran
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
