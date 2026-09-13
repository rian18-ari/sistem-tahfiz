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
  BookOpen,
  Award,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DashboardStudentProps {
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  records: MemorizationRecord[];
  onNavigateTab: (tab: string) => void;
}

export default function DashboardStudent({
  currentUser,
  students,
  teachers,
  groups,
  records,
  onNavigateTab,
}: DashboardStudentProps) {
  // Current student
  const student = useMemo(() => {
    return (
      students.find((s) => s.id === currentUser.associatedId) ||
      students[0]
    );
  }, [students, currentUser]);

  const teacher = useMemo(() => {
    return teachers.find((t) => t.id === student.teacherId);
  }, [teachers, student]);

  const group = useMemo(() => {
    return groups.find((g) => g.id === student.groupId);
  }, [groups, student]);

  // Student's records
  const myRecords = useMemo(() => {
    return records
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, student]);

  const latestRecord = myRecords[0];

  // Target calculations
  const monthlyPercent = Math.min(
    100,
    Math.round(
      (student.target.monthlyRealizationPages / Math.max(1, student.target.monthlyTargetPages)) * 100
    )
  );

  const totalJuzPercent = Math.min(
    100,
    Math.round((student.totalJuzCompleted / Math.max(1, student.target.targetJuzCount)) * 100)
  );

  return (
    <div id="dashboard-student" className="space-y-6">
      {/* Student Welcome Hero */}
      <div className="bg-linear-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Portal Santri
            </span>
            <span className="text-xs text-emerald-200">
              • Kelas {student.grade} ({group?.name || 'Halaqah Tahfiz'})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Assalamu&apos;alaikum, {student.name}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Tetap istiqamah menjaga ayat-ayat suci Al-Qur&apos;an. Ustadz Pembimbing Anda adalah{' '}
            <strong>{teacher?.name || 'Ustadz Pembimbing'}</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('tracking')}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Buka Pelacak Hafalan
          </button>
        </div>
      </div>

      {/* Target & Realisasi Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Target Juz */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Jumlah Juz
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {student.totalJuzCompleted}{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {student.target.targetJuzCount} Juz
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${totalJuzPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex justify-between">
              <span>Progres Global</span>
              <span>{totalJuzPercent}%</span>
            </div>
          </div>
        </div>

        {/* Target Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Bulan Ini
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {student.target.monthlyRealizationPages}{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {student.target.monthlyTargetPages} Hlm
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${monthlyPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1.5 flex justify-between">
              <span>Capaian Bulan Ini</span>
              <span>{monthlyPercent}%</span>
            </div>
          </div>
        </div>

        {/* Target Harian & Mingguan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Berkala
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Target Harian:</span>
              <strong className="text-slate-900">{student.target.dailyTargetPages} Halaman / Hari</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Target Mingguan:</span>
              <strong className="text-slate-900">{student.target.weeklyTargetPages} Halaman / Pekan</strong>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Total Ayat Tersimpan: <strong>{student.totalAyatMemorized} Ayat</strong>
            </div>
          </div>
        </div>

        {/* Nilai Rata-rata & Predikat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-Rata Nilai
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {student.averageScore}
            </div>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {student.averageScore >= 90
                ? 'Mumtaz (Sangat Baik)'
                : student.averageScore >= 80
                ? 'Jayyid Jiddan (Baik)'
                : 'Jayyid (Cukup)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Dari {myRecords.length} kali setoran dinilai
            </div>
          </div>
        </div>
      </div>

      {/* Latest Evaluation & Teacher's Notes */}
      {latestRecord && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Hasil Penilaian Setoran Terakhir
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {latestRecord.surahName} (Ayat {latestRecord.startAyat}–{latestRecord.endAyat})
              </h3>
              <p className="text-xs text-slate-500">
                Disetor pada {latestRecord.date} • {latestRecord.type} • Status:{' '}
                <strong className={latestRecord.status === 'Lulus' ? 'text-emerald-700' : 'text-rose-700'}>
                  {latestRecord.status}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500">Nilai Setoran</span>
                <div className="text-2xl font-black text-slate-900">
                  {latestRecord.assessment.finalScore}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                {latestRecord.assessment.predicate}
              </div>
            </div>
          </div>

          {/* 5 Assessment Aspects */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Kelancaran</span>
              <span className="text-base font-bold text-slate-900">
                {latestRecord.assessment.kelancaran}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Tajwid</span>
              <span className="text-base font-bold text-slate-900">
                {latestRecord.assessment.tajwid}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Makhraj</span>
              <span className="text-base font-bold text-slate-900">
                {latestRecord.assessment.makhraj}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Ketepatan</span>
              <span className="text-base font-bold text-slate-900">
                {latestRecord.assessment.ketepatanHafalan}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Adab &amp; Sikap</span>
              <span className="text-base font-bold text-slate-900">
                {latestRecord.assessment.adab}
              </span>
            </div>
          </div>

          {/* Teacher's correction note */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Catatan &amp; Arahan dari Ustadz:
              </span>
              <p className="text-xs text-amber-950 mt-0.5 leading-relaxed italic">
                &ldquo;{latestRecord.notes}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Setoran Saya */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Riwayat Setoran Hafalan Saya
            </h3>
            <p className="text-xs text-slate-500">
              Catatan lengkap setoran yang telah dievaluasi oleh ustadz
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('records')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Buka Riwayat Lengkap
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Surah &amp; Ayat</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Predikat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Catatan Ustadz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Belum ada riwayat setoran hafalan. Silakan setor tilawah kepada Ustadz pembimbing.
                  </td>
                </tr>
              ) : (
                myRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {rec.date}
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
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {rec.surahName} (Ayat {rec.startAyat}–{rec.endAyat})
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                      {rec.assessment.finalScore}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.assessment.predicate === 'Sangat Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.assessment.predicate === 'Baik'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
