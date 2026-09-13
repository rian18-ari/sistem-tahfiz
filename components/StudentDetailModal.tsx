'use client';

import React, { useState, useMemo } from 'react';
import {
  Student,
  Teacher,
  TahfizGroup,
  MemorizationRecord,
} from '@/types/tahfiz';
import { ALL_SURAHS, getSurahsByJuz } from '@/lib/quran-data';
import {
  X,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  User,
  Star,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  teacher?: Teacher;
  group?: TahfizGroup;
  records: MemorizationRecord[];
  onOpenSetoranModal: (studentId: string) => void;
  canAddSetoran?: boolean;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  teacher,
  group,
  records,
  onOpenSetoranModal,
  canAddSetoran = true,
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'checklist'>('overview');

  const studentRecords = useMemo(() => {
    if (!student) return [];
    return records.filter((r) => r.studentId === student.id);
  }, [student, records]);

  // Scores progression (chronological for chart)
  const chartData = useMemo(() => {
    const sorted = [...studentRecords].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-8).map((r, i) => ({
      index: i + 1,
      date: r.date.split('-').slice(1).join('/'),
      score: r.assessment.finalScore,
      surah: r.surahName,
      type: r.type,
      predicate: r.assessment.predicate,
    }));
  }, [studentRecords]);

  // Aspect averages
  const aspectAverages = useMemo(() => {
    if (studentRecords.length === 0) {
      return {
        kelancaran: student ? student.averageScore : 85,
        tajwid: student ? student.averageScore : 85,
        makhraj: student ? student.averageScore : 85,
        ketepatan: student ? student.averageScore : 85,
        adab: 90,
      };
    }
    const sum = studentRecords.reduce(
      (acc, r) => ({
        kelancaran: acc.kelancaran + r.assessment.kelancaran,
        tajwid: acc.tajwid + r.assessment.tajwid,
        makhraj: acc.makhraj + r.assessment.makhraj,
        ketepatan: acc.ketepatan + r.assessment.ketepatanHafalan,
        adab: acc.adab + r.assessment.adab,
      }),
      { kelancaran: 0, tajwid: 0, makhraj: 0, ketepatan: 0, adab: 0 }
    );
    const count = studentRecords.length;
    return {
      kelancaran: Math.round(sum.kelancaran / count),
      tajwid: Math.round(sum.tajwid / count),
      makhraj: Math.round(sum.makhraj / count),
      ketepatan: Math.round(sum.ketepatan / count),
      adab: Math.round(sum.adab / count),
    };
  }, [studentRecords, student]);

  if (!isOpen || !student) return null;

  const targetProgressPercent = Math.min(
    100,
    Math.round((student.target.monthlyRealizationPages / student.target.monthlyTargetPages) * 100)
  );

  return (
    <div
      id="student-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="student-detail-modal-content"
        className="relative w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Banner */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 border-2 border-emerald-400 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-inner">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold">{student.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      student.status === 'aktif'
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    {student.status === 'aktif' ? 'Santri Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-emerald-200 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>NIS: {student.nis}</span>
                  <span>•</span>
                  <span>Kelas: {student.grade}</span>
                  <span>•</span>
                  <span>{group ? group.name : 'Kelompok Tahfiz'}</span>
                </div>
                <div className="text-xs text-emerald-100/70 mt-1">
                  Ustadz Pembimbing: <strong className="text-emerald-100">{teacher ? teacher.name : 'Belum Ditentukan'}</strong>
                </div>
              </div>
            </div>

            {canAddSetoran && (
              <button
                type="button"
                onClick={() => {
                  onOpenSetoranModal(student.id);
                }}
                className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Catat Setoran Baru
              </button>
            )}
          </div>

          {/* Navigation Tabs inside modal */}
          <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10'
              }`}
            >
              Ringkasan &amp; Nilai
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10'
              }`}
            >
              Riwayat Setoran ({studentRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10'
              }`}
            >
              Ceklis Hafalan Surah
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Total Hafalan Selesai</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {student.totalJuzCompleted} <span className="text-xs text-slate-500 font-normal">Juz</span>
                  </div>
                  <div className="text-xs text-emerald-600 mt-0.5 font-medium">
                    {student.totalAyatMemorized} Total Ayat
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Surah Diselesaikan</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {student.totalSurahCompleted} <span className="text-xs text-slate-500 font-normal">Surah</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Sedang di Juz {student.currentJuz}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Rata-Rata Nilai</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    {student.averageScore}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                    {student.averageScore >= 90
                      ? 'Sangat Baik'
                      : student.averageScore >= 80
                      ? 'Baik'
                      : student.averageScore >= 70
                      ? 'Cukup'
                      : 'Perlu Bimbingan'}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Target Capaian Bulan Ini</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {targetProgressPercent}%
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {student.target.monthlyRealizationPages} / {student.target.monthlyTargetPages} Halaman
                  </div>
                </div>
              </div>

              {/* Target vs Realisasi Detail */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Perbandingan Target vs Realisasi Hafalan
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Target Total: {student.target.targetJuzCount} Juz
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${targetProgressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-slate-600 text-center">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block">Target Harian</span>
                    <strong className="text-slate-800">{student.target.dailyTargetPages} Halaman</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block">Target Mingguan</span>
                    <strong className="text-slate-800">{student.target.weeklyTargetPages} Halaman</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block">Target Bulanan</span>
                    <strong className="text-slate-800">{student.target.monthlyTargetPages} Halaman</strong>
                  </div>
                </div>
              </div>

              {/* Graphic of Score Progression (SVG) */}
              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Grafik Perkembangan Nilai Setoran
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Tren evaluasi 8 setoran terakhir santri
                </p>

                {chartData.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                    Belum ada riwayat setoran untuk ditampilkan di grafik.
                  </div>
                ) : (
                  <div>
                    {/* SVG Chart */}
                    <div className="relative h-48 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                        {/* Guide labels */}
                        <text x="5" y="18" fill="#94a3b8" fontSize="10">100</text>
                        <text x="5" y="58" fill="#94a3b8" fontSize="10">85</text>
                        <text x="5" y="98" fill="#94a3b8" fontSize="10">70</text>

                        {/* Polyline */}
                        {chartData.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={chartData
                              .map((d, i) => {
                                const x = 40 + i * (440 / Math.max(1, chartData.length - 1));
                                // Scale score 50..100 to y 140..20
                                const y = 140 - ((d.score - 50) / 50) * 120;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        )}

                        {/* Points & Labels */}
                        {chartData.map((d, i) => {
                          const x = 40 + i * (440 / Math.max(1, chartData.length - 1));
                          const y = 140 - ((d.score - 50) / 50) * 120;
                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#059669"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                fill="#0f172a"
                                fontSize="11"
                                fontWeight="bold"
                              >
                                {d.score}
                              </text>
                              <text
                                x={x}
                                y="156"
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize="10"
                              >
                                {d.surah}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Aspect Radar/Bars */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Rata-rata Penilaian Berdasarkan 5 Aspek
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 block">Kelancaran</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {aspectAverages.kelancaran}
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 block">Tajwid</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {aspectAverages.tajwid}
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 block">Makhraj</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {aspectAverages.makhraj}
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 block">Ketepatan</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {aspectAverages.ketepatan}
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 block">Adab / Sikap</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {aspectAverages.adab}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Seluruh Riwayat Setoran ({studentRecords.length} kali)
                </h3>
              </div>

              {studentRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Belum ada catatan setoran untuk santri ini.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Jenis</th>
                        <th className="px-4 py-3">Materi Surah</th>
                        <th className="px-4 py-3">Ayat</th>
                        <th className="px-4 py-3">Nilai</th>
                        <th className="px-4 py-3">Predikat</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Catatan Ustadz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                            {r.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                r.type === 'Hafalan Baru'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {r.surahName} (Juz {r.juz})
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            Ayat {r.startAyat}–{r.endAyat} ({r.totalAyat} ayat)
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {r.assessment.finalScore}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                r.assessment.predicate === 'Sangat Baik'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.assessment.predicate === 'Baik'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.assessment.predicate === 'Cukup'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.assessment.predicate}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                r.status === 'Lulus'
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-rose-700 bg-rose-50'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={r.notes}>
                            {r.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Daftar Ceklis Hafalan Juz 30 (Juz &apos;Amma)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pelacakan hafalan per surah dari An-Naba&apos; sampai An-Nas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {getSurahsByJuz(30).map((surah) => {
                  const passed = studentRecords.filter(
                    (r) => r.surahNumber === surah.number && r.status === 'Lulus'
                  );
                  let maxAyatDone = 0;
                  passed.forEach((p) => {
                    if (p.endAyat > maxAyatDone) maxAyatDone = p.endAyat;
                  });

                  if (student.totalJuzCompleted >= 1) {
                    maxAyatDone = surah.totalAyah;
                  }

                  const isComplete = maxAyatDone >= surah.totalAyah;

                  return (
                    <div
                      key={surah.number}
                      className={`p-3 rounded-xl border transition-all ${
                        isComplete
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : maxAyatDone > 0
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {surah.name}
                        </span>
                        {isComplete ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ayat 1–{surah.totalAyah} ✓
                          </span>
                        ) : maxAyatDone > 0 ? (
                          <span className="text-[11px] font-semibold text-blue-700">
                            Ayat 1–{maxAyatDone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {surah.totalAyah} Ayat
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
