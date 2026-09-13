'use client';

import React, { useState, useMemo } from 'react';
import { Student, Teacher, TahfizGroup } from '@/types/tahfiz';
import { StorageService } from '@/lib/storage';
import {
  Target,
  Search,
  Edit2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';

interface TargetHafalanViewProps {
  students: Student[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  onRefresh: () => void;
  canEditTarget?: boolean;
}

export default function TargetHafalanView({
  students,
  teachers,
  groups,
  onRefresh,
  canEditTarget = true,
}: TargetHafalanViewProps) {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [targetModalStudent, setTargetModalStudent] = useState<Student | null>(null);

  // Form states for modal
  const [dailyTarget, setDailyTarget] = useState<number>(1);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(5);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(20);
  const [targetJuz, setTargetJuz] = useState<number>(5);

  const grades = useMemo(() => {
    const s = new Set(students.map((st) => st.grade));
    return Array.from(s).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch = st.name.toLowerCase().includes(search.toLowerCase()) || st.nis.includes(search);
      const matchGrade = selectedGrade === 'all' || st.grade === selectedGrade;
      return matchSearch && matchGrade;
    });
  }, [students, search, selectedGrade]);

  // Overall statistics
  const targetStats = useMemo(() => {
    const active = students.filter((s) => s.status === 'aktif');
    const reached = active.filter(
      (s) => s.target.monthlyRealizationPages >= s.target.monthlyTargetPages
    );
    const totalTargetPages = active.reduce((sum, s) => sum + s.target.monthlyTargetPages, 0);
    const totalRealizedPages = active.reduce((sum, s) => sum + s.target.monthlyRealizationPages, 0);
    const overallPercent =
      totalTargetPages > 0 ? Math.round((totalRealizedPages / totalTargetPages) * 100) : 0;

    return {
      activeCount: active.length,
      reachedCount: reached.length,
      unreachedCount: active.length - reached.length,
      overallPercent: Math.min(100, overallPercent),
      totalRealizedPages,
      totalTargetPages,
    };
  }, [students]);

  const openEditModal = (student: Student) => {
    setTargetModalStudent(student);
    setDailyTarget(student.target.dailyTargetPages);
    setWeeklyTarget(student.target.weeklyTargetPages);
    setMonthlyTarget(student.target.monthlyTargetPages);
    setTargetJuz(student.target.targetJuzCount);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModalStudent) return;

    StorageService.updateStudent(targetModalStudent.id, {
      target: {
        ...targetModalStudent.target,
        dailyTargetPages: Number(dailyTarget),
        weeklyTargetPages: Number(weeklyTarget),
        monthlyTargetPages: Number(monthlyTarget),
        targetJuzCount: Number(targetJuz),
      },
    });

    setTargetModalStudent(null);
    onRefresh();
  };

  return (
    <div id="target-hafalan-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Target Hafalan &amp; Pemantauan Realisasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluasi pencapaian target harian, mingguan, bulanan, dan total juz santri
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Mencapai Target Bulan Ini</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {targetStats.reachedCount}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {targetStats.activeCount} Santri</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {Math.round((targetStats.reachedCount / Math.max(1, targetStats.activeCount)) * 100)}% santri tuntas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Perlu Penguatan / Belum Capai</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {targetStats.unreachedCount}{' '}
            <span className="text-xs text-slate-400 font-normal">Santri</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Perlu bimbingan murojaah ekstra</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Halaman Disetor</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {targetStats.totalRealizedPages}{' '}
            <span className="text-xs text-slate-500 font-normal">
              / {targetStats.totalTargetPages} Hlm
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Agregat seluruh santri aktif</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Persentase Capaian Global</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {targetStats.overallPercent}%
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${targetStats.overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Kelas {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards / Table of Students Target vs Realization */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Perbandingan Target vs Realisasi Santri
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student) => {
            const percent = Math.min(
              100,
              Math.round(
                (student.target.monthlyRealizationPages / student.target.monthlyTargetPages) * 100
              )
            );
            const isTargetReached = percent >= 100;
            const teacher = teachers.find((t) => t.id === student.teacherId);

            return (
              <div
                key={student.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        Kelas {student.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      NIS: {student.nis} • Pembimbing: {teacher?.name?.split(',')[0] || '-'} • Target:{' '}
                      <strong>{student.target.targetJuzCount} Juz</strong>
                    </div>
                  </div>
                </div>

                {/* Middle: Target vs Realisasi */}
                <div className="w-full md:w-80">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">
                      Bulan ini:{' '}
                      <strong className="text-slate-900">
                        {student.target.monthlyRealizationPages} Halaman
                      </strong>{' '}
                      dari {student.target.monthlyTargetPages} Hlm
                    </span>
                    <span
                      className={`font-bold ${
                        isTargetReached ? 'text-emerald-700' : percent >= 70 ? 'text-blue-700' : 'text-amber-600'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTargetReached
                          ? 'bg-emerald-600'
                          : percent >= 70
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>Target Harian: {student.target.dailyTargetPages} Hlm</span>
                    <span>Target Mingguan: {student.target.weeklyTargetPages} Hlm</span>
                  </div>
                </div>

                {/* Right: Status badge & Action */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {isTargetReached ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tercapai
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Sedang Berjalan
                    </span>
                  )}

                  {canEditTarget && (
                    <button
                      type="button"
                      onClick={() => openEditModal(student)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Ubah Target Hafalan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Atur Target</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Edit Target */}
      {targetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Atur Target Hafalan Santri</h3>
                <p className="text-xs text-emerald-100">{targetModalStudent.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveTarget} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Jumlah Total Juz
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={targetJuz}
                  onChange={(e) => setTargetJuz(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Bulanan (Halaman)
                </label>
                <input
                  type="number"
                  min="1"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Mingguan (Halaman)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Harian (Halaman)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTargetModalStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
