'use client';

import React, { useState, useMemo } from 'react';
import { Student, MemorizationRecord, Teacher, TahfizGroup } from '@/types/tahfiz';
import {
  FileText,
  TrendingUp,
  Award,
  AlertTriangle,
  Printer,
  Download,
  CheckCircle2,
  BookOpen,
  Users,
  ChevronRight,
} from 'lucide-react';

interface LaporanViewProps {
  students: Student[];
  records: MemorizationRecord[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  onViewStudentDetail: (student: Student) => void;
}

export default function LaporanView({
  students,
  records,
  teachers,
  groups,
  onViewStudentDetail,
}: LaporanViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'achievers' | 'grades' | 'juz' | 'full'>(
    'achievers'
  );

  // Top Achievers (sorted by total Juz completed + averageScore)
  const topAchievers = useMemo(() => {
    return [...students]
      .filter((s) => s.status === 'aktif')
      .sort((a, b) => b.totalJuzCompleted - a.totalJuzCompleted || b.averageScore - a.averageScore)
      .slice(0, 5);
  }, [students]);

  // Students Needing Attention (monthly realization < 70% or average score < 75)
  const studentsNeedingAttention = useMemo(() => {
    return [...students]
      .filter((s) => s.status === 'aktif')
      .filter((s) => {
        const percent =
          (s.target.monthlyRealizationPages / Math.max(1, s.target.monthlyTargetPages)) * 100;
        return percent < 70 || s.averageScore < 75;
      });
  }, [students]);

  // Grade/Predicate distribution
  const predicateDistribution = useMemo(() => {
    const dist = {
      'Sangat Baik': 0,
      'Baik': 0,
      'Cukup': 0,
      'Perlu Bimbingan': 0,
    };
    records.forEach((r) => {
      dist[r.assessment.predicate] = (dist[r.assessment.predicate] || 0) + 1;
    });
    const total = Math.max(1, records.length);
    return {
      counts: dist,
      total,
      percentages: {
        'Sangat Baik': Math.round((dist['Sangat Baik'] / total) * 100),
        'Baik': Math.round((dist['Baik'] / total) * 100),
        'Cukup': Math.round((dist['Cukup'] / total) * 100),
        'Perlu Bimbingan': Math.round((dist['Perlu Bimbingan'] / total) * 100),
      },
    };
  }, [records]);

  // Rekap hafalan per Juz
  const juzRecap = useMemo(() => {
    const map = new Map<number, { setoranCount: number; passedCount: number; studentsSet: Set<string> }>();
    for (let j = 1; j <= 30; j++) {
      map.set(j, { setoranCount: 0, passedCount: 0, studentsSet: new Set() });
    }

    records.forEach((r) => {
      const entry = map.get(r.juz);
      if (entry) {
        entry.setoranCount += 1;
        if (r.status === 'Lulus') entry.passedCount += 1;
        entry.studentsSet.add(r.studentId);
      }
    });

    return Array.from(map.entries()).map(([juz, data]) => ({
      juz,
      setoranCount: data.setoranCount,
      passedCount: data.passedCount,
      studentCount: data.studentsSet.size,
    }));
  }, [records]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="laporan-tahfiz-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Laporan Perkembangan Tahfiz Al-Qur&apos;an
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekap komprehensif santri berprestasi, evaluasi capaian, dan analisis hafalan
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          Cetak Dokumen Laporan
        </button>
      </div>

      {/* Report Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
        <button
          type="button"
          onClick={() => setActiveReportTab('achievers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'achievers'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Santri Berprestasi &amp; Perlu Bimbingan
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('grades')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'grades'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Rekap Nilai &amp; Predikat
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('juz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'juz'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Rekap Hafalan per Juz
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'full'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Daftar Rekap Seluruh Santri
        </button>
      </div>

      {/* Tab 1: Achievers & Attention */}
      {activeReportTab === 'achievers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Achievers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Santri dengan Progres Tertinggi
                  </h3>
                  <p className="text-xs text-slate-500">Capaian juz terbanyak dan nilai mumtaz</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Top 5</span>
            </div>

            <div className="space-y-3">
              {topAchievers.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => onViewStudentDetail(s)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/70 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-600/30 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Kelas {s.grade} • {s.totalSurahCompleted} Surah Selesai
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-emerald-800 text-sm">
                      {s.totalJuzCompleted} Juz
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600">
                      Nilai: {s.averageScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Needing Attention */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Santri Belum Mencapai Target / Perlu Bimbingan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Realisasi &lt; 70% atau nilai setoran perlu penguatan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700">
                {studentsNeedingAttention.length} Santri
              </span>
            </div>

            {studentsNeedingAttention.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Alhamdulillah seluruh santri telah memenuhi target hafalan bulan ini!
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map((s) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      (s.target.monthlyRealizationPages / s.target.monthlyTargetPages) * 100
                    )
                  );

                  return (
                    <div
                      key={s.id}
                      onClick={() => onViewStudentDetail(s)}
                      className="p-3 bg-rose-50/40 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Kelas {s.grade} • Rata-rata Nilai: <strong>{s.averageScore}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-700">{percent}% Capaian</div>
                        <div className="text-[11px] text-slate-500">
                          {s.target.monthlyRealizationPages} / {s.target.monthlyTargetPages} Halaman
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Grades & Predicates */}
      {activeReportTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rekapitulasi Nilai &amp; Distribusi Predikat Setoran
            </h3>
            <p className="text-xs text-slate-500">
              Total {predicateDistribution.total} penilaian setoran tercatat di sistem
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">Sangat Baik (90–100)</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {predicateDistribution.counts['Sangat Baik']}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {predicateDistribution.percentages['Sangat Baik']}% dari total
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs font-bold text-blue-800">Baik (80–89)</span>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {predicateDistribution.counts['Baik']}
              </div>
              <div className="text-xs text-blue-700 mt-0.5">
                {predicateDistribution.percentages['Baik']}% dari total
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800">Cukup (70–79)</span>
              <div className="text-2xl font-black text-amber-900 mt-1">
                {predicateDistribution.counts['Cukup']}
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                {predicateDistribution.percentages['Cukup']}% dari total
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-xs font-bold text-rose-800">Perlu Bimbingan (&lt;70)</span>
              <div className="text-2xl font-black text-rose-900 mt-1">
                {predicateDistribution.counts['Perlu Bimbingan']}
              </div>
              <div className="text-xs text-rose-700 mt-0.5">
                {predicateDistribution.percentages['Perlu Bimbingan']}% dari total
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Juz Recap */}
      {activeReportTab === 'juz' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rekapitulasi Aktivitas Hafalan per Juz Al-Qur&apos;an
            </h3>
            <p className="text-xs text-slate-500">
              Distribusi jumlah setoran dan santri aktif di masing-masing Juz
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {juzRecap.map((item) => (
              <div
                key={item.juz}
                className={`p-3 rounded-xl border ${
                  item.setoranCount > 0
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Juz {item.juz}</span>
                  {item.setoranCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-slate-900 mt-1">
                  {item.setoranCount} <span className="text-[10px] text-slate-400 font-normal">Setoran</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.studentCount} Santri terlibat
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Full Students Progress Table (Print-friendly) */}
      {activeReportTab === 'full' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Laporan Komprehensif Progres Hafalan Santri
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Santri</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Total Juz</th>
                  <th className="px-4 py-3">Total Ayat</th>
                  <th className="px-4 py-3">Target Bulanan</th>
                  <th className="px-4 py-3">Realisasi</th>
                  <th className="px-4 py-3">Persentase</th>
                  <th className="px-4 py-3">Rata-Rata Nilai</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      (s.target.monthlyRealizationPages / s.target.monthlyTargetPages) * 100
                    )
                  );
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/70 cursor-pointer"
                      onClick={() => onViewStudentDetail(s)}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                      <td className="px-4 py-3 text-slate-700">{s.grade}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{s.totalJuzCompleted} Juz</td>
                      <td className="px-4 py-3 text-slate-600">{s.totalAyatMemorized} Ayat</td>
                      <td className="px-4 py-3 text-slate-600">{s.target.monthlyTargetPages} Hlm</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{s.target.monthlyRealizationPages} Hlm</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{percent}%</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">{s.averageScore}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            percent >= 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {percent >= 100 ? 'Tercapai' : 'Belum'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
