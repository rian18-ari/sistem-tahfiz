'use client';

import React, { useState, useMemo } from 'react';
import { Student, MemorizationRecord } from '@/types/tahfiz';
import { ALL_SURAHS, getSurahsByJuz } from '@/lib/quran-data';
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  BookOpen,
  Filter,
  Sparkles,
  TrendingUp,
  Plus,
} from 'lucide-react';

interface TrackingHafalanViewProps {
  students: Student[];
  records: MemorizationRecord[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onOpenSetoranModal: (studentId: string, surahNum?: number) => void;
  isStudentView?: boolean;
}

export default function TrackingHafalanView({
  students,
  records,
  selectedStudentId,
  onSelectStudent,
  onOpenSetoranModal,
  isStudentView = false,
}: TrackingHafalanViewProps) {
  const [activeJuz, setActiveJuz] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Find student records
  const studentRecords = useMemo(() => {
    if (!currentStudent) return [];
    return records.filter((r) => r.studentId === currentStudent.id && r.status === 'Lulus');
  }, [records, currentStudent]);

  // Surahs in currently selected Juz
  const surahsInJuz = useMemo(() => {
    const list = getSurahsByJuz(activeJuz);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        s.number.toString().includes(q)
    );
  }, [activeJuz, searchQuery]);

  // Compute status for each surah for this student
  const surahProgressMap = useMemo(() => {
    const map = new Map<number, {
      completedAyat: number;
      isFull: boolean;
      status: 'Selesai' | 'Sedang Dihafal' | 'Belum';
      lastDate?: string;
      maxEndAyat: number;
    }>();

    if (!currentStudent) return map;

    surahsInJuz.forEach((surah) => {
      // Find all passed records for this surah
      const passedSurahRecords = studentRecords.filter((r) => r.surahNumber === surah.number);
      let maxEnd = 0;
      let totalPassedAyat = 0;
      let lastRecDate: string | undefined;

      passedSurahRecords.forEach((r) => {
        if (r.endAyat > maxEnd) maxEnd = r.endAyat;
        totalPassedAyat += r.totalAyat;
        if (!lastRecDate || r.date > lastRecDate) lastRecDate = r.date;
      });

      // Also adjust for high-level student stats if it's Juz 30 and student completed it
      if (surah.juz === 30 && currentStudent.totalJuzCompleted >= 1) {
        maxEnd = surah.totalAyah;
        totalPassedAyat = surah.totalAyah;
      }

      const isFull = maxEnd >= surah.totalAyah;
      let status: 'Selesai' | 'Sedang Dihafal' | 'Belum' = 'Belum';
      if (isFull) {
        status = 'Selesai';
      } else if (maxEnd > 0) {
        status = 'Sedang Dihafal';
      }

      map.set(surah.number, {
        completedAyat: Math.min(surah.totalAyah, maxEnd),
        isFull,
        status,
        lastDate: lastRecDate,
        maxEndAyat: maxEnd,
      });
    });

    return map;
  }, [currentStudent, studentRecords, surahsInJuz]);

  // Juz-level summary statistics
  const juzStats = useMemo(() => {
    const fullJuzSurahs = getSurahsByJuz(activeJuz);
    const totalAyahInJuz = fullJuzSurahs.reduce((sum, s) => sum + s.totalAyah, 0);
    let memorizedAyah = 0;
    let completedSurahs = 0;

    fullJuzSurahs.forEach((surah) => {
      const progress = surahProgressMap.get(surah.number);
      if (progress) {
        memorizedAyah += progress.completedAyat;
        if (progress.isFull) completedSurahs++;
      } else if (activeJuz === 30 && currentStudent && currentStudent.totalJuzCompleted >= 1) {
        memorizedAyah += surah.totalAyah;
        completedSurahs++;
      }
    });

    const percent = totalAyahInJuz > 0 ? Math.round((memorizedAyah / totalAyahInJuz) * 100) : 0;
    return {
      totalAyahInJuz,
      memorizedAyah,
      completedSurahs,
      totalSurahs: fullJuzSurahs.length,
      percent: Math.min(100, percent),
    };
  }, [activeJuz, surahProgressMap, currentStudent]);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Belum ada data santri untuk pelacak hafalan.
      </div>
    );
  }

  return (
    <div id="tracking-hafalan-view" className="space-y-6">
      {/* Top Header & Student Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Pelacak Hafalan Al-Qur&apos;an
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor progres hafalan santri secara presisi per Juz, Surah, dan ayat
          </p>
        </div>

        {!isStudentView && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Pilih Santri:
            </span>
            <select
              id="tracking-select-student"
              value={selectedStudentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} (Kelas {std.grade} - NIS {std.nis})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Student Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Santri yang Dipantau</div>
          <div className="text-lg font-bold text-slate-900 mt-1">{currentStudent.name}</div>
          <div className="text-xs text-slate-600 mt-0.5">
            Kelas {currentStudent.grade} • NIS {currentStudent.nis}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Hafalan:</span>
            <span className="font-bold text-emerald-700">
              {currentStudent.totalJuzCompleted} Juz ({currentStudent.totalAyatMemorized} Ayat)
            </span>
          </div>
        </div>

        <div className="md:col-span-3 bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Progress Juz {activeJuz}
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                {activeJuz === 30 ? "Juz 30 (Juz 'Amma)" : activeJuz === 29 ? 'Juz 29 (Tabarak)' : `Juz ${activeJuz}`}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-3xl font-black text-emerald-300">{juzStats.percent}%</span>
              <div className="text-xs text-emerald-100/80">
                {juzStats.memorizedAyah} dari {juzStats.totalAyahInJuz} total ayat
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${juzStats.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-emerald-200 mt-2">
              <span>{juzStats.completedSurahs} dari {juzStats.totalSurahs} Surah tuntas</span>
              <span>Sisa {Math.max(0, juzStats.totalAyahInJuz - juzStats.memorizedAyah)} Ayat lagi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Juz Quick Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            Pilih Juz Al-Qur&apos;an:
          </span>
          <div className="text-xs text-slate-500">
            Juz 30, 29, 28, dan 1 adalah halaqah prioritas
          </div>
        </div>

        {/* Horizontal scrollable pills for all 30 Juz */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {[30, 29, 28, 27, 26, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => setActiveJuz(j)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeJuz === j
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Juz {j} {j === 30 ? "('Amma)" : j === 29 ? '(Tabarak)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Surah List in Current Juz with Checklist & Range */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Surah — Juz {activeJuz}
            </h3>
            <p className="text-xs text-slate-500">
              Pelacakan status ayat mulai hingga selesai untuk setiap surah
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari surah di Juz ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {surahsInJuz.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Tidak ada surah yang cocok dengan pencarian di Juz {activeJuz}.
            </div>
          ) : (
            surahsInJuz.map((surah) => {
              const progress = surahProgressMap.get(surah.number) || {
                completedAyat: 0,
                isFull: false,
                status: 'Belum',
                maxEndAyat: 0,
              };

              const percent = Math.round((progress.completedAyat / surah.totalAyah) * 100);

              return (
                <div
                  key={surah.number}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Left Column: Surah Number, Name, Arabic */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        progress.isFull
                          ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400'
                          : progress.status === 'Sedang Dihafal'
                          ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {surah.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {surah.name}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({surah.englishTranslation})
                        </span>
                        <span className="font-serif text-slate-700 text-sm sm:text-base ml-1">
                          {surah.arabicName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Total {surah.totalAyah} Ayat</span>
                        <span>•</span>
                        {progress.isFull ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ayat 1–{surah.totalAyah} (Tuntas ✓)
                          </span>
                        ) : progress.status === 'Sedang Dihafal' ? (
                          <span className="text-blue-700 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Ayat 1–{progress.completedAyat} dari {surah.totalAyah}
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <CircleDashed className="w-3.5 h-3.5 text-slate-400" />
                            Belum disetorkan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Progress bar & Quick CTA */}
                  <div className="flex items-center gap-4 w-full md:w-80 shrink-0">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">
                          {progress.completedAyat} / {surah.totalAyah} Ayat
                        </span>
                        <span
                          className={`font-bold ${
                            progress.isFull
                              ? 'text-emerald-700'
                              : progress.status === 'Sedang Dihafal'
                              ? 'text-blue-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress.isFull
                              ? 'bg-emerald-600'
                              : progress.status === 'Sedang Dihafal'
                              ? 'bg-blue-600'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {!isStudentView && (
                      <button
                        type="button"
                        onClick={() => onOpenSetoranModal(currentStudent.id, surah.number)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors text-xs font-semibold shrink-0 flex items-center gap-1"
                        title="Catat Setoran Surah Ini"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Setor</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
