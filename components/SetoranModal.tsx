'use client';

import React, { useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  SetoranType,
  SetoranStatus,
} from '@/types/tahfiz';
import { ALL_SURAHS, getSurahsByJuz, getSurahByNumber } from '@/lib/quran-data';
import { StorageService } from '@/lib/storage';
import { calculateAssessment } from '@/lib/dummy-data';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface SetoranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onRecordSaved?: () => void;
  preselectedStudentId?: string;
  currentTeacherId?: string;
  students?: Student[];
  teachers?: Teacher[];
}

export default function SetoranModal({
  isOpen,
  onClose,
  onSuccess,
  onRecordSaved,
  preselectedStudentId,
  currentTeacherId,
  students: propsStudents,
  teachers: propsTeachers,
}: SetoranModalProps) {
  const [students] = useState<Student[]>(() =>
    propsStudents && propsStudents.length > 0
      ? propsStudents
      : StorageService.getStudents().filter((s) => s.status === 'aktif')
  );
  const [teachers] = useState<Teacher[]>(() =>
    propsTeachers && propsTeachers.length > 0
      ? propsTeachers
      : StorageService.getTeachers()
  );

  // Form states
  const [studentId, setStudentId] = useState<string>(
    preselectedStudentId || students[0]?.id || ''
  );
  const [teacherId, setTeacherId] = useState<string>(
    currentTeacherId || teachers[0]?.id || ''
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<SetoranType>('Hafalan Baru');
  const [juz, setJuz] = useState<number>(30);
  const [surahNumber, setSurahNumber] = useState<number>(78);
  const [startAyat, setStartAyat] = useState<number>(1);
  const [endAyat, setEndAyat] = useState<number>(20);

  // 5 Assessment aspects (1-100)
  const [kelancaran, setKelancaran] = useState<number>(85);
  const [tajwid, setTajwid] = useState<number>(85);
  const [makhraj, setMakhraj] = useState<number>(85);
  const [ketepatanHafalan, setKetepatanHafalan] = useState<number>(85);
  const [adab, setAdab] = useState<number>(90);

  const [customStatus, setCustomStatus] = useState<SetoranStatus | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState<boolean>(false);

  // Calculate live assessment
  const liveAssessment = calculateAssessment(
    kelancaran,
    tajwid,
    makhraj,
    ketepatanHafalan,
    adab
  );

  const status: SetoranStatus =
    customStatus ?? (liveAssessment.finalScore < 70 ? 'Perlu Mengulang' : 'Lulus');

  // Handle Surah change
  const currentSurah = getSurahByNumber(surahNumber);
  const maxAyat = currentSurah ? currentSurah.totalAyah : 40;

  const handleSurahSelect = (num: number) => {
    setSurahNumber(num);
    const surah = getSurahByNumber(num);
    if (surah) {
      setJuz(surah.juz);
      setStartAyat(1);
      setEndAyat(Math.min(20, surah.totalAyah));
    }
  };

  const handleJuzSelect = (selectedJuz: number) => {
    setJuz(selectedJuz);
    const surahsInJuz = getSurahsByJuz(selectedJuz);
    if (surahsInJuz.length > 0) {
      setSurahNumber(surahsInJuz[0].number);
      setStartAyat(1);
      setEndAyat(Math.min(20, surahsInJuz[0].totalAyah));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !teacherId) {
      alert('Mohon pilih santri dan ustadz pembimbing.');
      return;
    }

    if (startAyat > endAyat) {
      alert('Ayat mulai tidak boleh lebih besar dari ayat selesai.');
      return;
    }

    setSubmitting(true);

    const surah = getSurahByNumber(surahNumber);
    const surahName = surah ? surah.name : `Surah ke-${surahNumber}`;

    StorageService.addRecord({
      studentId,
      teacherId,
      date,
      type,
      juz,
      surahNumber,
      surahName,
      startAyat,
      endAyat,
      kelancaran,
      tajwid,
      makhraj,
      ketepatanHafalan,
      adab,
      status,
      notes: notes.trim() || 'Alhamdulillah setoran telah diperiksa.',
    });

    setSubmitting(false);
    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      if (onRecordSaved) {
        onRecordSaved();
      } else if (onSuccess) {
        onSuccess();
      }
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  const totalAyatCount = Math.max(1, endAyat - startAyat + 1);

  // Predicate style colors
  const predicateColors = {
    'Sangat Baik': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Baik': 'bg-blue-100 text-blue-800 border-blue-300',
    'Cukup': 'bg-amber-100 text-amber-800 border-amber-300',
    'Perlu Bimbingan': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div
      id="setoran-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="setoran-modal-content"
        className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-emerald-800 to-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Catat Setoran Hafalan</h2>
              <p className="text-xs text-emerald-100/90">
                Input penilaian multi-aspek & tracking hafalan santri
              </p>
            </div>
          </div>
          <button
            id="btn-close-setoran-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccessAnim ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Setoran Berhasil Dicatat!</h3>
            <p className="text-sm text-slate-600 max-w-md">
              Data setoran, nilai akhir, dan progres target santri otomatis diperbarui secara sistematis.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Section 1: Informasi Santri & Pelaksanaan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Santri <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-santri"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="" disabled>Pilih Santri...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Kelas {s.grade} - NIS {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ustadz / Ustadzah Penguji <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-teacher"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="" disabled>Pilih Penguji...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Setoran <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-setoran-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Setoran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Hafalan Baru')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      type === 'Hafalan Baru'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Hafalan Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Murojaah')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      type === 'Murojaah'
                        ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Murojaah
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Surah & Rentang Ayat */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Materi Al-Qur&apos;an yang Disetorkan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Juz</label>
                  <select
                    id="select-juz"
                    value={juz}
                    onChange={(e) => handleJuzSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                      <option key={j} value={j}>
                        Juz {j} {j === 30 ? "(Juz 'Amma)" : j === 29 ? '(Tabarak)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-600 mb-1">Surah</label>
                  <select
                    id="select-surah"
                    value={surahNumber}
                    onChange={(e) => handleSurahSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {ALL_SURAHS.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.name} ({s.arabicName}) - {s.totalAyah} Ayat [Juz {s.juz}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end pt-1">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Ayat Mulai</label>
                  <input
                    id="input-start-ayat"
                    type="number"
                    min="1"
                    max={maxAyat}
                    value={startAyat}
                    onChange={(e) => setStartAyat(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Ayat Selesai (Maks {maxAyat})
                  </label>
                  <input
                    id="input-end-ayat"
                    type="number"
                    min={startAyat}
                    max={maxAyat}
                    value={endAyat}
                    onChange={(e) => setEndAyat(Math.min(maxAyat, Math.max(startAyat, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-xs text-emerald-700">Total Disetor:</div>
                  <div className="text-base font-bold text-emerald-900">
                    {totalAyatCount} Ayat
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Penilaian Multi-Aspek (5 Aspek) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Aspek Penilaian (Skala 1–100)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nilai akhir dihitung otomatis dari rata-rata 5 aspek hafalan
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Nilai Akhir:</span>
                  <div className="text-2xl font-black text-slate-900">
                    {liveAssessment.finalScore}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* 1. Kelancaran */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>1. Kelancaran</span>
                    <span className="font-bold text-emerald-700">{kelancaran}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={kelancaran}
                    onChange={(e) => setKelancaran(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* 2. Tajwid */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>2. Tajwid (Mad, Ghunnah, dll)</span>
                    <span className="font-bold text-emerald-700">{tajwid}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={tajwid}
                    onChange={(e) => setTajwid(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* 3. Makhraj */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>3. Makhraj Huruf</span>
                    <span className="font-bold text-emerald-700">{makhraj}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={makhraj}
                    onChange={(e) => setMakhraj(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* 4. Ketepatan Hafalan */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>4. Ketepatan Hafalan</span>
                    <span className="font-bold text-emerald-700">{ketepatanHafalan}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={ketepatanHafalan}
                    onChange={(e) => setKetepatanHafalan(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* 5. Adab / Sikap */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>5. Adab &amp; Sikap Santri</span>
                    <span className="font-bold text-emerald-700">{adab}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={adab}
                    onChange={(e) => setAdab(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Predikat banner */}
              <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Hasil Predikat:</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
                      predicateColors[liveAssessment.predicate]
                    }`}
                  >
                    {liveAssessment.predicate} ({liveAssessment.finalScore})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-xs text-slate-600 font-medium">Status Kelulusan:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white text-xs">
                    <button
                      type="button"
                      onClick={() => setCustomStatus('Lulus')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        status === 'Lulus'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Lulus
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomStatus('Perlu Mengulang')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        status === 'Perlu Mengulang'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Perlu Mengulang
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Catatan / Koreksi Ustadz */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan &amp; Koreksi Ustadz / Evaluasi Khusus
              </label>
              <textarea
                id="textarea-catatan-setoran"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Makhraj huruf kaf dan qof dijaga, perhatikan dengung ikhfa 2 harakat..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                id="btn-cancel-setoran"
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-submit-setoran"
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
              >
                {submitting ? 'Menyimpan...' : 'Simpan & Perbarui Progres'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
