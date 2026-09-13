'use client';

import React, { useState, useMemo } from 'react';
import { MemorizationRecord, Student, Teacher } from '@/types/tahfiz';
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  ArrowUpDown,
  Download,
  Eye,
  X,
  Printer,
} from 'lucide-react';

interface RiwayatSetoranViewProps {
  records: MemorizationRecord[];
  students: Student[];
  teachers: Teacher[];
  currentStudentId?: string; // If student is viewing, pre-locked or filtered
  onOpenSetoranModal?: () => void;
  canAddRecord?: boolean;
}

export default function RiwayatSetoranView({
  records,
  students,
  teachers,
  currentStudentId,
  onOpenSetoranModal,
  canAddRecord = true,
}: RiwayatSetoranViewProps) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>(currentStudentId || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // all, today, week, month

  // Selected record for details modal
  const [inspectedRecord, setInspectedRecord] = useState<MemorizationRecord | null>(null);

  // Unique grades
  const grades = useMemo(() => {
    const gSet = new Set(students.map((s) => s.grade));
    return Array.from(gSet).sort();
  }, [students]);

  // Today string
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const student = students.find((s) => s.id === r.studentId);
      const studentName = student ? student.name.toLowerCase() : '';
      const surahMatch = r.surahName.toLowerCase().includes(search.toLowerCase());
      const studentMatch = studentName.includes(search.toLowerCase());

      // Student filter
      if (selectedStudent !== 'all' && r.studentId !== selectedStudent) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'all' && student?.grade !== selectedGrade) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && r.type !== selectedType) {
        return false;
      }

      // Date preset filter
      if (selectedDateFilter === 'today' && r.date !== todayStr) {
        return false;
      } else if (selectedDateFilter === 'week') {
        const diffDays =
          (new Date(todayStr).getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (selectedDateFilter === 'month') {
        const diffDays =
          (new Date(todayStr).getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      }

      return surahMatch || studentMatch;
    });
  }, [
    records,
    students,
    search,
    selectedStudent,
    selectedGrade,
    selectedStatus,
    selectedType,
    selectedDateFilter,
    todayStr,
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="riwayat-setoran-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Riwayat Setoran Hafalan Santri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log lengkap setoran hafalan baru, murojaah, skor penilaian, dan catatan pembimbing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
          {canAddRecord && onOpenSetoranModal && (
            <button
              type="button"
              onClick={onOpenSetoranModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Catat Setoran
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 no-print">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri atau surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Santri filter */}
        {!currentStudentId && (
          <div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Santri</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Kelas filter */}
        <div>
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

        {/* Jenis Setoran */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Jenis</option>
            <option value="Hafalan Baru">Hafalan Baru</option>
            <option value="Murojaah">Murojaah</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="Lulus">Lulus</option>
            <option value="Perlu Mengulang">Perlu Mengulang</option>
          </select>
        </div>

        {/* Date Presets */}
        <div>
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Tanggal</option>
            <option value="today">Setoran Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Daftar Catatan Setoran ({filteredRecords.length} Data)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Materi Surah &amp; Juz</th>
                <th className="px-4 py-3">Rentang Ayat</th>
                <th className="px-4 py-3">Nilai Akhir</th>
                <th className="px-4 py-3">Predikat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Catatan / Koreksi Ustadz</th>
                <th className="px-4 py-3 text-right no-print">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    Tidak ada riwayat setoran yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  const teacher = teachers.find((t) => t.id === record.teacherId);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setInspectedRecord(record)}
                    >
                      {/* Tanggal */}
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                        {record.date}
                      </td>

                      {/* Santri */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {student ? student.name : 'Santri'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Kelas {student?.grade || '-'} • Penguji: {teacher?.name?.split(',')[0] || '-'}
                        </div>
                      </td>

                      {/* Jenis */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            record.type === 'Hafalan Baru'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>

                      {/* Surah & Juz */}
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        {record.surahName}
                        <span className="text-slate-400 font-normal ml-1">(Juz {record.juz})</span>
                      </td>

                      {/* Ayat */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        Ayat {record.startAyat}–{record.endAyat} ({record.totalAyat} ayat)
                      </td>

                      {/* Nilai */}
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-sm text-slate-900">
                        {record.assessment.finalScore}
                      </td>

                      {/* Predikat */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            record.assessment.predicate === 'Sangat Baik'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.assessment.predicate === 'Baik'
                              ? 'bg-blue-100 text-blue-800'
                              : record.assessment.predicate === 'Cukup'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.assessment.predicate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            record.status === 'Lulus'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {/* Catatan */}
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={record.notes}>
                        {record.notes}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-right whitespace-nowrap no-print">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedRecord(record);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Assessment Inspection Detail Modal */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Detail Lembar Penilaian Setoran</h3>
                <p className="text-[11px] text-slate-400">{inspectedRecord.date} • {inspectedRecord.surahName}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRecord(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Nilai Akhir Rata-Rata</span>
                  <div className="text-3xl font-black text-slate-900">
                    {inspectedRecord.assessment.finalScore}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Predikat:</span>
                  <div className="text-sm font-bold text-emerald-700">
                    {inspectedRecord.assessment.predicate}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      inspectedRecord.status === 'Lulus'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {inspectedRecord.status}
                  </span>
                </div>
              </div>

              {/* 5 Aspects Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Rincian 5 Aspek Penilaian:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Kelancaran:</span>
                    <strong className="text-slate-900">{inspectedRecord.assessment.kelancaran}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Tajwid:</span>
                    <strong className="text-slate-900">{inspectedRecord.assessment.tajwid}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Makhraj:</span>
                    <strong className="text-slate-900">{inspectedRecord.assessment.makhraj}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Ketepatan:</span>
                    <strong className="text-slate-900">{inspectedRecord.assessment.ketepatanHafalan}</strong>
                  </div>
                  <div className="col-span-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Adab &amp; Sikap:</span>
                    <strong className="text-slate-900">{inspectedRecord.assessment.adab}</strong>
                  </div>
                </div>
              </div>

              {/* Catatan / Koreksi */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  Catatan &amp; Koreksi Penguji:
                </span>
                <p className="text-xs text-amber-950 leading-relaxed italic">
                  &ldquo;{inspectedRecord.notes}&rdquo;
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInspectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
