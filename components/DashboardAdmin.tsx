'use client';

import React, { useMemo } from 'react';
import {
  Student,
  Teacher,
  TahfizGroup,
  MemorizationRecord,
} from '@/types/tahfiz';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Target,
  Award,
  TrendingUp,
  Plus,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface DashboardAdminProps {
  students: Student[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  records: MemorizationRecord[];
  onOpenSetoranModal: () => void;
  onNavigateTab: (tab: string) => void;
  onViewStudentDetail: (student: Student) => void;
}

export default function DashboardAdmin({
  students,
  teachers,
  groups,
  records,
  onOpenSetoranModal,
  onNavigateTab,
  onViewStudentDetail,
}: DashboardAdminProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Setoran hari ini
  const todayRecords = useMemo(() => {
    return records.filter((r) => r.date === todayStr);
  }, [records, todayStr]);

  // Santri mencapai target bulan ini
  const activeStudents = useMemo(() => students.filter((s) => s.status === 'aktif'), [students]);
  const reachedTargetStudents = useMemo(() => {
    return activeStudents.filter(
      (s) => s.target.monthlyRealizationPages >= s.target.monthlyTargetPages
    );
  }, [activeStudents]);

  // Rata-rata nilai setoran global
  const averageGlobalScore = useMemo(() => {
    if (records.length === 0) return 85;
    const total = records.reduce((sum, r) => sum + r.assessment.finalScore, 0);
    return Math.round(total / records.length);
  }, [records]);

  // Predicate of average
  const averagePredicate = useMemo(() => {
    if (averageGlobalScore >= 90) return 'Sangat Baik';
    if (averageGlobalScore >= 80) return 'Baik';
    if (averageGlobalScore >= 70) return 'Cukup';
    return 'Perlu Bimbingan';
  }, [averageGlobalScore]);

  // Recent 6 records
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
  }, [records]);

  // Weekly trend for chart (last 7 days)
  const weeklyChartData = useMemo(() => {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = records.filter((r) => r.date === dateStr);
      const passedCount = dayRecords.filter((r) => r.status === 'Lulus').length;
      result.push({
        label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        date: dateStr,
        total: dayRecords.length,
        passed: passedCount,
      });
    }
    return result;
  }, [records]);

  const maxWeeklyCount = Math.max(...weeklyChartData.map((d) => d.total), 4);

  return (
    <div id="dashboard-admin" className="space-y-6">
      {/* Welcome Banner with Quick CTAs */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              Dashboard Eksekutif
            </span>
            <span className="text-xs text-slate-300">• Tahun Ajaran 2024/2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
            Sistem Pemantauan Hafalan Al-Qur&apos;an
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
            Pantau perkembangan hafalan santri, evaluasi setoran harian asatidz, dan pantau target kelulusan tahfiz secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSetoranModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Catat Setoran
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('tracking')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
          >
            Pelacak Hafalan
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Santri */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Santri</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {students.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {activeStudents.length} Santri Aktif
            </div>
          </div>
        </div>

        {/* 2. Total Ustadz */}
        <div
          onClick={() => onNavigateTab('groups')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Ustadz</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {teachers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {groups.length} Kelompok Halaqah
            </div>
          </div>
        </div>

        {/* 3. Setoran Hari Ini */}
        <div
          onClick={() => onNavigateTab('records')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Setoran Hari Ini</span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {todayRecords.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {todayRecords.filter((r) => r.status === 'Lulus').length} Lulus • {todayRecords.filter((r) => r.status === 'Perlu Mengulang').length} Ulang
            </div>
          </div>
        </div>

        {/* 4. Santri Capai Target */}
        <div
          onClick={() => onNavigateTab('targets')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Capai Target</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {reachedTargetStudents.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {Math.round((reachedTargetStudents.length / Math.max(1, activeStudents.length)) * 100)}% dari santri aktif
            </div>
          </div>
        </div>

        {/* 5. Rata-Rata Nilai */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rata-Rata Nilai</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {averageGlobalScore}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              Predikat: {averagePredicate}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Grafik Progres Hafalan & Ringkasan Halaqah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Grafik Aktivitas Setoran Hafalan (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-slate-500">Volume setoran hafalan baru dan murojaah per hari</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Lulus
              </span>
            </div>
          </div>

          <div className="mt-6 h-48 flex items-end justify-between gap-3 pt-4">
            {weeklyChartData.map((day, idx) => {
              const heightPercent = maxWeeklyCount > 0 ? (day.total / maxWeeklyCount) * 100 : 0;
              const isToday = day.date === todayStr;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-xs font-bold text-slate-800">
                    {day.total > 0 ? day.total : '-'}
                  </div>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg h-36 flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday ? 'bg-emerald-600' : 'bg-teal-700/80'
                      }`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isToday ? 'text-emerald-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Highlights / Halaqah Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Kelompok / Halaqah Tahfiz
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Status dan jadwal halaqah aktif</p>

            <div className="mt-4 space-y-3">
              {groups.map((grp) => {
                const grpStudents = students.filter((s) => s.groupId === grp.id);
                const teacher = teachers.find((t) => t.id === grp.teacherId);

                return (
                  <div key={grp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{grp.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {grpStudents.length} Santri
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Pembimbing: <strong>{teacher?.name?.split(',')[0] || '-'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('groups')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
          >
            Kelola Seluruh Halaqah &amp; Ustadz
          </button>
        </div>
      </div>

      {/* Recent Setoran List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Daftar Setoran Hafalan Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Aktivitas setoran hafalan baru dan murojaah santri terkini
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('records')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Surah &amp; Ayat</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Predikat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Catatan / Koreksi Ustadz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map((rec) => {
                const std = students.find((s) => s.id === rec.studentId);
                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => {
                      if (std) onViewStudentDetail(std);
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                      {rec.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{std?.name || 'Santri'}</span>
                      <span className="text-slate-400 text-[11px] block">Kelas {std?.grade}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.type === 'Hafalan Baru'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {rec.surahName}{' '}
                      <span className="text-slate-500 font-normal">
                        Ayat {rec.startAyat}–{rec.endAyat}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 text-sm">
                      {rec.assessment.finalScore}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.assessment.predicate === 'Sangat Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.assessment.predicate === 'Baik'
                            ? 'bg-blue-100 text-blue-800'
                            : rec.assessment.predicate === 'Cukup'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.assessment.predicate}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Lulus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={rec.notes}>
                      {rec.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
