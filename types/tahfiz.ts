export type UserRole = 'admin' | 'teacher' | 'student';

export type PredicateType = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';

export type SetoranStatus = 'Lulus' | 'Perlu Mengulang';

export type SetoranType = 'Hafalan Baru' | 'Murojaah';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  associatedId?: string; // studentId or teacherId
  phone?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  gender: 'L' | 'P';
  phone: string;
  email: string;
  specialty: string;
  totalStudents: number;
}

export interface TahfizGroup {
  id: string;
  name: string;
  teacherId: string;
  room: string;
  schedule: string;
  description?: string;
}

export interface StudentTarget {
  dailyTargetPages: number; // e.g. 1 halaman
  weeklyTargetPages: number; // e.g. 5 halaman
  monthlyTargetPages: number; // e.g. 20 halaman
  targetJuzCount: number; // e.g. 5 Juz
  monthlyRealizationPages: number; // e.g. 16 halaman
}

export interface StudentSurahProgress {
  surahNumber: number;
  surahName: string;
  juz: number;
  startAyat: number;
  endAyat: number;
  totalAyat: number;
  completedAyat: number;
  isComplete: boolean;
  lastUpdated: string;
  status: 'Selesai' | 'Sedang Dihafal' | 'Belum';
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  grade: string; // e.g., "7A", "8B", "9A", "10 IPA 1"
  groupId: string;
  teacherId: string;
  status: 'aktif' | 'nonaktif';
  target: StudentTarget;
  totalJuzCompleted: number;
  totalSurahCompleted: number;
  totalAyatMemorized: number;
  currentJuz: number;
  averageScore: number;
  joinedDate: string;
  avatarUrl?: string;
}

export interface Assessment {
  kelancaran: number; // 1-100
  tajwid: number; // 1-100
  makhraj: number; // 1-100
  ketepatanHafalan: number; // 1-100
  adab: number; // 1-100
  finalScore: number; // auto calculated average
  predicate: PredicateType;
}

export interface MemorizationRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  type: SetoranType;
  juz: number;
  surahNumber: number;
  surahName: string;
  startAyat: number;
  endAyat: number;
  totalAyat: number;
  assessment: Assessment;
  status: SetoranStatus;
  notes: string;
  createdAt: string;
}

export interface SurahMeta {
  number: number;
  name: string;
  arabicName: string;
  englishTranslation: string;
  totalAyah: number;
  juz: number;
}
