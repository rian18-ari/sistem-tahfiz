'use client';

import {
  Student,
  Teacher,
  TahfizGroup,
  MemorizationRecord,
  User,
  SetoranType,
  SetoranStatus,
} from '@/types/tahfiz';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_GROUPS,
  INITIAL_RECORDS,
  APP_USERS,
  calculateAssessment,
} from './dummy-data';

const STORAGE_KEYS = {
  STUDENTS: 'sistem_tahfiz_students_v1',
  TEACHERS: 'sistem_tahfiz_teachers_v1',
  GROUPS: 'sistem_tahfiz_groups_v1',
  RECORDS: 'sistem_tahfiz_records_v1',
  CURRENT_USER: 'sistem_tahfiz_current_user_v1',
};

// Safe JSON parse
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('tahfiz_data_changed'));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export const StorageService = {
  getStudents(): Student[] {
    return getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  setStudents(students: Student[]): void {
    setToStorage(STORAGE_KEYS.STUDENTS, students);
  },

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  },

  addStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`,
    };
    const updated = [newStudent, ...students];
    this.setStudents(updated);
    return newStudent;
  },

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return null;

    students[index] = { ...students[index], ...updates };
    this.setStudents([...students]);
    return students[index];
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length !== students.length) {
      this.setStudents(filtered);
      return true;
    }
    return false;
  },

  getTeachers(): Teacher[] {
    return getFromStorage<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  },

  setTeachers(teachers: Teacher[]): void {
    setToStorage(STORAGE_KEYS.TEACHERS, teachers);
  },

  addTeacher(teacher: Omit<Teacher, 'id' | 'totalStudents'>): Teacher {
    const teachers = this.getTeachers();
    const newTeacher: Teacher = {
      ...teacher,
      id: `tch-${Date.now()}`,
      totalStudents: 0,
    };
    this.setTeachers([newTeacher, ...teachers]);
    return newTeacher;
  },

  getGroups(): TahfizGroup[] {
    return getFromStorage<TahfizGroup[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
  },

  setGroups(groups: TahfizGroup[]): void {
    setToStorage(STORAGE_KEYS.GROUPS, groups);
  },

  addGroup(group: Omit<TahfizGroup, 'id'>): TahfizGroup {
    const groups = this.getGroups();
    const newGroup: TahfizGroup = {
      ...group,
      id: `grp-${Date.now()}`,
    };
    this.setGroups([...groups, newGroup]);
    return newGroup;
  },

  getRecords(): MemorizationRecord[] {
    return getFromStorage<MemorizationRecord[]>(STORAGE_KEYS.RECORDS, INITIAL_RECORDS);
  },

  setRecords(records: MemorizationRecord[]): void {
    setToStorage(STORAGE_KEYS.RECORDS, records);
  },

  addRecord(params: {
    studentId: string;
    teacherId: string;
    date: string;
    type: SetoranType;
    juz: number;
    surahNumber: number;
    surahName: string;
    startAyat: number;
    endAyat: number;
    kelancaran: number;
    tajwid: number;
    makhraj: number;
    ketepatanHafalan: number;
    adab: number;
    status: SetoranStatus;
    notes: string;
  }): MemorizationRecord {
    const totalAyat = Math.max(1, params.endAyat - params.startAyat + 1);
    const assessment = calculateAssessment(
      params.kelancaran,
      params.tajwid,
      params.makhraj,
      params.ketepatanHafalan,
      params.adab
    );

    const newRecord: MemorizationRecord = {
      id: `rec-${Date.now()}`,
      studentId: params.studentId,
      teacherId: params.teacherId,
      date: params.date,
      type: params.type,
      juz: params.juz,
      surahNumber: params.surahNumber,
      surahName: params.surahName,
      startAyat: params.startAyat,
      endAyat: params.endAyat,
      totalAyat,
      assessment,
      status: params.status,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    const currentRecords = this.getRecords();
    const updatedRecords = [newRecord, ...currentRecords];
    this.setRecords(updatedRecords);

    // Otomatis update statistik & progress hafalan santri
    const student = this.getStudentById(params.studentId);
    if (student) {
      // Calculate student's updated average score
      const studentRecords = updatedRecords.filter((r) => r.studentId === params.studentId);
      const totalScore = studentRecords.reduce((sum, r) => sum + r.assessment.finalScore, 0);
      const newAverage = Math.round(totalScore / studentRecords.length);

      let newTotalAyat = student.totalAyatMemorized;
      let newMonthlyRealization = student.target.monthlyRealizationPages;

      if (params.status === 'Lulus') {
        if (params.type === 'Hafalan Baru') {
          newTotalAyat += totalAyat;
          // Approximate pages: roughly 15-20 ayahs per page on average
          const pagesApprox = Math.max(1, Math.round(totalAyat / 15));
          newMonthlyRealization += pagesApprox;
        }
      }

      this.updateStudent(student.id, {
        averageScore: newAverage,
        totalAyatMemorized: newTotalAyat,
        target: {
          ...student.target,
          monthlyRealizationPages: newMonthlyRealization,
        },
      });
    }

    return newRecord;
  },

  getCurrentUser(): User {
    return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER, APP_USERS[0]);
  },

  setCurrentUser(user: User): void {
    setToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  resetToDefault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event('tahfiz_data_changed'));
  },
};
