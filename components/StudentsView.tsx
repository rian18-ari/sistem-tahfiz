'use client';

import React, { useState, useMemo } from 'react';
import { Student, Teacher, TahfizGroup } from '@/types/tahfiz';
import { StorageService } from '@/lib/storage';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  BookMarked,
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  teachers: Teacher[];
  groups: TahfizGroup[];
  onRefresh: () => void;
  onViewStudentDetail: (student: Student) => void;
  onOpenSetoranModal: (studentId: string) => void;
  canManageStudents?: boolean;
}

export default function StudentsView({
  students,
  teachers,
  groups,
  onRefresh,
  onViewStudentDetail,
  onOpenSetoranModal,
  canManageStudents = true,
}: StudentsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Add/Edit Student Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    gender: 'L' as 'L' | 'P',
    grade: '7A',
    groupId: '',
    teacherId: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
    targetJuzCount: 5,
    monthlyTargetPages: 20,
    dailyTargetPages: 1,
    weeklyTargetPages: 5,
  });

  // Unique grades for filter
  const grades = useMemo(() => {
    const set = new Set(students.map((s) => s.grade));
    return Array.from(set).sort();
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.includes(search);
      const matchGrade = selectedGrade === 'all' || s.grade === selectedGrade;
      const matchGroup = selectedGroup === 'all' || s.groupId === selectedGroup;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
      return matchSearch && matchGrade && matchGroup && matchStatus;
    });
  }, [students, search, selectedGrade, selectedGroup, selectedStatus]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nis: `2024070${String(students.length + 1).padStart(2, '0')}`,
      gender: 'L',
      grade: '7A',
      groupId: groups[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      status: 'aktif',
      targetJuzCount: 5,
      monthlyTargetPages: 20,
      dailyTargetPages: 1,
      weeklyTargetPages: 5,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nis: student.nis,
      gender: student.gender,
      grade: student.grade,
      groupId: student.groupId,
      teacherId: student.teacherId,
      status: student.status,
      targetJuzCount: student.target.targetJuzCount,
      monthlyTargetPages: student.target.monthlyTargetPages,
      dailyTargetPages: student.target.dailyTargetPages,
      weeklyTargetPages: student.target.weeklyTargetPages,
    });
    setIsFormOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      StorageService.updateStudent(editingStudent.id, {
        name: formData.name.trim(),
        nis: formData.nis.trim(),
        gender: formData.gender,
        grade: formData.grade,
        groupId: formData.groupId,
        teacherId: formData.teacherId,
        status: formData.status,
        target: {
          ...editingStudent.target,
          targetJuzCount: Number(formData.targetJuzCount),
          monthlyTargetPages: Number(formData.monthlyTargetPages),
          dailyTargetPages: Number(formData.dailyTargetPages),
          weeklyTargetPages: Number(formData.weeklyTargetPages),
        },
      });
    } else {
      StorageService.addStudent({
        name: formData.name.trim(),
        nis: formData.nis.trim(),
        gender: formData.gender,
        grade: formData.grade,
        groupId: formData.groupId || groups[0]?.id || 'grp-1',
        teacherId: formData.teacherId || teachers[0]?.id || 'tch-1',
        status: formData.status,
        target: {
          dailyTargetPages: Number(formData.dailyTargetPages),
          weeklyTargetPages: Number(formData.weeklyTargetPages),
          monthlyTargetPages: Number(formData.monthlyTargetPages),
          targetJuzCount: Number(formData.targetJuzCount),
          monthlyRealizationPages: 0,
        },
        totalJuzCompleted: 0,
        totalSurahCompleted: 0,
        totalAyatMemorized: 0,
        currentJuz: 30,
        averageScore: 85,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    setIsFormOpen(false);
    onRefresh();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data santri "${name}"?`)) {
      StorageService.deleteStudent(id);
      onRefresh();
    }
  };

  return (
    <div id="students-view-container" className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Data Santri Tahfiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola profil, pembimbing halaqah, target juz, dan status keaktifan santri
          </p>
        </div>

        {canManageStudents && (
          <button
            id="btn-add-santri"
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Tambah Santri Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-santri"
            type="text"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            id="filter-kelas-santri"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Kelas {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="filter-kelompok-santri"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Halaqah</option>
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="filter-status-santri"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Santri Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Menampilkan {filteredStudents.length} dari {students.length} Santri
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Santri &amp; NIS</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Kelompok &amp; Pembimbing</th>
                <th className="px-4 py-3">Capaian Hafalan</th>
                <th className="px-4 py-3">Target Bulanan</th>
                <th className="px-4 py-3">Rata-Rata Nilai</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada santri yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const teacher = teachers.find((t) => t.id === student.teacherId);
                  const group = groups.find((g) => g.id === student.groupId);
                  const monthlyPercent = Math.min(
                    100,
                    Math.round(
                      (student.target.monthlyRealizationPages / student.target.monthlyTargetPages) * 100
                    )
                  );

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onViewStudentDetail(student)}
                    >
                      {/* Name & NIS */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              NIS: {student.nis} • {student.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {student.grade}
                      </td>

                      {/* Group & Teacher */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {group ? group.name : '-'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {teacher ? teacher.name : '-'}
                        </div>
                      </td>

                      {/* Hafalan Progress */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-emerald-800">
                          {student.totalJuzCompleted} Juz ({student.totalAyatMemorized} Ayat)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Sedang di Juz {student.currentJuz}
                        </div>
                      </td>

                      {/* Target Bulanan vs Realisasi */}
                      <td className="px-4 py-3 whitespace-nowrap min-w-[140px]">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">
                            {student.target.monthlyRealizationPages} / {student.target.monthlyTargetPages} Hlm
                          </span>
                          <span className="font-bold text-slate-800">{monthlyPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              monthlyPercent >= 100
                                ? 'bg-emerald-600'
                                : monthlyPercent >= 75
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${monthlyPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Rata-Rata Nilai */}
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            student.averageScore >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.averageScore >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : student.averageScore >= 70
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {student.averageScore}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            student.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {student.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenSetoranModal(student.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Catat Setoran Hafalan"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewStudentDetail(student)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManageStudents && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(student)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                title="Edit Santri"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                title="Hapus Santri"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded text-emerald-200 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Santri
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Raihan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIS / NISN
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas / Jenjang
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="Contoh: 7A, 8B, 10 IPA 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Santri
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelompok Tahfiz
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ustadz Pembimbing
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Settings */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Pengaturan Target Hafalan
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Target Total Juz</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.targetJuzCount}
                      onChange={(e) => setFormData({ ...formData, targetJuzCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Target Bulanan (Halaman)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.monthlyTargetPages}
                      onChange={(e) => setFormData({ ...formData, monthlyTargetPages: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
