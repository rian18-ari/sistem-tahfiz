'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { StorageService } from '@/lib/storage';
import { Student, Teacher, TahfizGroup, MemorizationRecord, User } from '@/types/tahfiz';
import Navbar from '@/components/Navbar';
import DashboardAdmin from '@/components/DashboardAdmin';
import DashboardTeacher from '@/components/DashboardTeacher';
import DashboardStudent from '@/components/DashboardStudent';
import StudentsView from '@/components/StudentsView';
import TrackingHafalanView from '@/components/TrackingHafalanView';
import RiwayatSetoranView from '@/components/RiwayatSetoranView';
import TargetHafalanView from '@/components/TargetHafalanView';
import KelompokUstadzView from '@/components/KelompokUstadzView';
import LaporanView from '@/components/LaporanView';
import SetoranModal from '@/components/SetoranModal';
import StudentDetailModal from '@/components/StudentDetailModal';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function HomePage() {
  const isMounted = useIsMounted();
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => StorageService.getTeachers());
  const [groups, setGroups] = useState<TahfizGroup[]>(() => StorageService.getGroups());
  const [records, setRecords] = useState<MemorizationRecord[]>(() => StorageService.getRecords());
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());

  // Active view tab: dashboard | students | tracking | records | targets | groups | reports
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [selectedTrackingStudentId, setSelectedTrackingStudentId] = useState<string>('std-1');

  // Sync data from StorageService
  const loadData = useCallback(() => {
    setStudents(StorageService.getStudents());
    setTeachers(StorageService.getTeachers());
    setGroups(StorageService.getGroups());
    setRecords(StorageService.getRecords());
    setCurrentUser(StorageService.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('tahfiz_data_changed', handleStorageChange);
    return () => {
      window.removeEventListener('tahfiz_data_changed', handleStorageChange);
    };
  }, [loadData]);

  const handleSwitchUser = (newUser: User) => {
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    // If student switched, keep on dashboard or tracking
    if (newUser.role === 'student' && (activeTab === 'students' || activeTab === 'groups')) {
      setActiveTab('dashboard');
    }
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    loadData();
    setActiveTab('dashboard');
  };

  const handleOpenSetoran = (studentId?: string) => {
    setPreselectedStudentId(studentId);
    setIsSetoranModalOpen(true);
  };

  const handleCloseSetoran = () => {
    setIsSetoranModalOpen(false);
    setPreselectedStudentId(undefined);
  };

  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Memuat Sistem Tahfiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSetoranModal={() => handleOpenSetoran()}
        students={students}
        teachers={teachers}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {currentUser.role === 'admin' && (
              <DashboardAdmin
                students={students}
                teachers={teachers}
                groups={groups}
                records={records}
                onOpenSetoranModal={() => handleOpenSetoran()}
                onNavigateTab={setActiveTab}
                onViewStudentDetail={setDetailStudent}
              />
            )}

            {currentUser.role === 'teacher' && (
              <DashboardTeacher
                currentUser={currentUser}
                students={students}
                teachers={teachers}
                groups={groups}
                records={records}
                onOpenSetoranModal={handleOpenSetoran}
                onNavigateTab={setActiveTab}
                onViewStudentDetail={setDetailStudent}
              />
            )}

            {currentUser.role === 'student' && (
              <DashboardStudent
                currentUser={currentUser}
                students={students}
                teachers={teachers}
                groups={groups}
                records={records}
                onNavigateTab={setActiveTab}
              />
            )}
          </>
        )}

        {/* STUDENTS TAB (Admin & Teacher) */}
        {activeTab === 'students' && (
          <StudentsView
            students={
              currentUser.role === 'teacher'
                ? students.filter((s) => s.teacherId === currentUser.associatedId)
                : students
            }
            teachers={teachers}
            groups={groups}
            onViewStudentDetail={setDetailStudent}
            onOpenSetoranModal={handleOpenSetoran}
            onRefresh={loadData}
            canManageStudents={currentUser.role === 'admin'}
          />
        )}

        {/* TRACKING HAFALAN TAB (30 JUZ) */}
        {activeTab === 'tracking' && (
          <TrackingHafalanView
            students={students}
            records={records}
            selectedStudentId={
              currentUser.role === 'student' && currentUser.associatedId
                ? currentUser.associatedId
                : selectedTrackingStudentId || students[0]?.id || 'std-1'
            }
            onSelectStudent={setSelectedTrackingStudentId}
            onOpenSetoranModal={(studentId) => handleOpenSetoran(studentId)}
            isStudentView={currentUser.role === 'student'}
          />
        )}

        {/* RIWAYAT SETORAN TAB */}
        {activeTab === 'records' && (
          <RiwayatSetoranView
            records={
              currentUser.role === 'student'
                ? records.filter((r) => r.studentId === currentUser.associatedId)
                : currentUser.role === 'teacher'
                ? records.filter(
                    (r) =>
                      r.teacherId === currentUser.associatedId ||
                      students.find((s) => s.id === r.studentId)?.teacherId ===
                        currentUser.associatedId
                  )
                : records
            }
            students={students}
            teachers={teachers}
            currentStudentId={
              currentUser.role === 'student' ? currentUser.associatedId : undefined
            }
            onOpenSetoranModal={() => handleOpenSetoran()}
            canAddRecord={currentUser.role !== 'student'}
          />
        )}

        {/* TARGET HAFALAN TAB */}
        {activeTab === 'targets' && (
          <TargetHafalanView
            students={
              currentUser.role === 'student'
                ? students.filter((s) => s.id === currentUser.associatedId)
                : currentUser.role === 'teacher'
                ? students.filter((s) => s.teacherId === currentUser.associatedId)
                : students
            }
            teachers={teachers}
            groups={groups}
            onRefresh={loadData}
            canEditTarget={currentUser.role !== 'student'}
          />
        )}

        {/* KELOMPOK & USTADZ TAB (Admin only) */}
        {activeTab === 'groups' && (
          <KelompokUstadzView
            teachers={teachers}
            groups={groups}
            students={students}
            onRefresh={loadData}
            canManage={currentUser.role === 'admin'}
          />
        )}

        {/* LAPORAN TAB */}
        {activeTab === 'reports' && (
          <LaporanView
            students={
              currentUser.role === 'teacher'
                ? students.filter((s) => s.teacherId === currentUser.associatedId)
                : students
            }
            records={records}
            teachers={teachers}
            groups={groups}
            onViewStudentDetail={setDetailStudent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} <strong>Sistem Tahfiz</strong> — Aplikasi Manajemen &amp; Pemantauan Hafalan Al-Qur&apos;an Santri
          </span>
          <span className="text-slate-400">
            Membina Generasi Qur&apos;ani yang Berakhlak Mulia &amp; Mutqin 30 Juz
          </span>
        </div>
      </footer>

      {/* Setoran Recording Modal */}
      {isSetoranModalOpen && (
        <SetoranModal
          isOpen={isSetoranModalOpen}
          onClose={handleCloseSetoran}
          students={
            currentUser.role === 'teacher'
              ? students.filter((s) => s.teacherId === currentUser.associatedId)
              : students
          }
          teachers={teachers}
          preselectedStudentId={preselectedStudentId}
          currentTeacherId={currentUser.role === 'teacher' ? currentUser.associatedId : undefined}
          onRecordSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Student Detail Modal */}
      {detailStudent && (
        <StudentDetailModal
          isOpen={!!detailStudent}
          student={detailStudent}
          records={records.filter((r) => r.studentId === detailStudent.id)}
          teacher={teachers.find((t) => t.id === detailStudent.teacherId)}
          group={groups.find((g) => g.id === detailStudent.groupId)}
          onClose={() => setDetailStudent(null)}
          onOpenSetoranModal={(studentId) => {
            setDetailStudent(null);
            handleOpenSetoran(studentId);
          }}
          canAddSetoran={currentUser.role !== 'student'}
        />
      )}
    </div>
  );
}
