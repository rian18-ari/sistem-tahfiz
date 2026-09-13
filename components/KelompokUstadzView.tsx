'use client';

import React, { useState } from 'react';
import { Teacher, TahfizGroup, Student } from '@/types/tahfiz';
import { StorageService } from '@/lib/storage';
import {
  Users2,
  GraduationCap,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  UserCheck,
  XCircle,
} from 'lucide-react';

interface KelompokUstadzViewProps {
  teachers: Teacher[];
  groups: TahfizGroup[];
  students: Student[];
  onRefresh: () => void;
  canManage?: boolean;
}

export default function KelompokUstadzView({
  teachers,
  groups,
  students,
  onRefresh,
  canManage = true,
}: KelompokUstadzViewProps) {
  const [activeTab, setActiveTab] = useState<'teachers' | 'groups'>('teachers');

  // Modal Add Teacher
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    nip: '',
    gender: 'L' as 'L' | 'P',
    phone: '',
    email: '',
    specialty: '',
  });

  // Modal Add Group
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    teacherId: teachers[0]?.id || '',
    room: '',
    schedule: '',
    description: '',
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim()) return;

    StorageService.addTeacher({
      name: teacherForm.name.trim(),
      nip: teacherForm.nip.trim() || `1990${Date.now().toString().slice(-10)}`,
      gender: teacherForm.gender,
      phone: teacherForm.phone.trim() || '0812-xxxx-xxxx',
      email: teacherForm.email.trim() || `${teacherForm.name.toLowerCase().replace(/\s+/g, '.')}@pesantren.id`,
      specialty: teacherForm.specialty.trim() || 'Tahfiz & Tahsin Al-Qur\'an',
    });

    setIsTeacherModalOpen(false);
    onRefresh();
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    StorageService.addGroup({
      name: groupForm.name.trim(),
      teacherId: groupForm.teacherId || teachers[0]?.id || '',
      room: groupForm.room.trim() || 'Ruang Halaqah Utama',
      schedule: groupForm.schedule.trim() || 'Ba\'da Shubuh & Ba\'da Ashar',
      description: groupForm.description.trim(),
    });

    setIsGroupModalOpen(false);
    onRefresh();
  };

  return (
    <div id="kelompok-ustadz-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-600" />
            Manajemen Ustadz &amp; Kelompok Tahfiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data dewan asatidz, halaqah bimbingan, jadwal, dan alokasi santri
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === 'teachers' ? (
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah Ustadz/Ustadzah
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah Halaqah Baru
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'teachers'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Dewan Asatidz / Penguji ({teachers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'groups'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Kelompok / Halaqah ({groups.length})
        </button>
      </div>

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teachers.map((teacher) => {
            const assignedStudents = students.filter((s) => s.teacherId === teacher.id);
            const teacherGroups = groups.filter((g) => g.teacherId === teacher.id);

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                      {teacher.gender === 'L' ? 'Ust' : 'Uzh'}
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      NIP: {teacher.nip.slice(0, 10)}...
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-3">{teacher.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">{teacher.specialty}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-600">Santri yang Dibimbing:</span>
                  <strong className="text-emerald-800 font-bold">{assignedStudents.length} Santri</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((group) => {
            const teacher = teachers.find((t) => t.id === group.teacherId);
            const groupStudents = students.filter((s) => s.groupId === group.id);

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Halaqah Tahfiz
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {groupStudents.length} Santri
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2">{group.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {group.description || 'Kelompok bimbingan hafalan Al-Qur\'an intensif.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pembimbing: <strong>{teacher?.name || '-'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.schedule}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                    Santri di halaqah ini:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {groupStudents.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {s.name.split(' ')[0]}
                      </span>
                    ))}
                    {groupStudents.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        +{groupStudents.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Form Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Ustadz / Ustadzah Baru</h3>
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Muhammad Irfan, Lc."
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    placeholder="19900101..."
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={teacherForm.gender}
                    onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="L">Laki-laki (Ustadz)</option>
                    <option value="P">Perempuan (Ustadzah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spesialisasi / Keahlian
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sanad Qira'at Asyrah, Matan Jazariyyah"
                  value={teacherForm.specialty}
                  onChange={(e) => setTeacherForm({ ...teacherForm, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ustadz@pesantren.id"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Ustadz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Form Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Halaqah Tahfiz Baru</h3>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelompok / Halaqah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Halaqah Utsman bin Affan"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ustadz Pembimbing
                </label>
                <select
                  value={groupForm.teacherId}
                  onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ruangan / Tempat</label>
                <input
                  type="text"
                  placeholder="Masjid Lt. 1 Sayap Barat"
                  value={groupForm.room}
                  onChange={(e) => setGroupForm({ ...groupForm, room: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jadwal Halaqah</label>
                <input
                  type="text"
                  placeholder="Ba'da Shubuh & Ba'da Ashar"
                  value={groupForm.schedule}
                  onChange={(e) => setGroupForm({ ...groupForm, schedule: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Halaqah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
