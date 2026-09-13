'use client';

import React, { useState } from 'react';
import { User, UserRole, Student, Teacher } from '@/types/tahfiz';
import { APP_USERS } from '@/lib/dummy-data';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  CheckSquare,
  History,
  Target,
  FileText,
  Users2,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSetoranModal: () => void;
  students: Student[];
  teachers: Teacher[];
}

export default function Navbar({
  currentUser,
  onSwitchUser,
  onResetData,
  activeTab,
  onSelectTab,
  onOpenSetoranModal,
  students,
  teachers,
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role based navigation tabs
  const getNavItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'tracking', label: 'Pelacak Hafalan', icon: CheckSquare },
      { id: 'records', label: 'Riwayat Setoran', icon: History },
      { id: 'targets', label: 'Target Hafalan', icon: Target },
    ];

    if (currentUser.role === 'admin') {
      return [
        common[0], // Dashboard
        { id: 'students', label: 'Data Santri', icon: Users },
        common[1], // Pelacak
        common[2], // Riwayat
        common[3], // Target
        { id: 'groups', label: 'Ustadz & Halaqah', icon: Users2 },
        { id: 'reports', label: 'Laporan', icon: FileText },
      ];
    }

    if (currentUser.role === 'teacher') {
      return [
        common[0], // Dashboard
        { id: 'students', label: 'Santri Binaan', icon: Users },
        common[1], // Pelacak
        common[2], // Riwayat
        common[3], // Target
        { id: 'reports', label: 'Laporan', icon: FileText },
      ];
    }

    // Student
    return [
      common[0], // Dashboard
      common[1], // Pelacak
      common[2], // Riwayat Setoran
      common[3], // Target Saya
    ];
  };

  const navItems = getNavItems();

  const handleRoleSelect = (u: User) => {
    onSwitchUser(u);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs group-hover:bg-emerald-900 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                  Sistem Tahfiz
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Pesantren &amp; Sekolah Islam
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Setoran button for Admin & Teacher */}
            {currentUser.role !== 'student' && (
              <button
                type="button"
                onClick={onOpenSetoranModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Catat Setoran
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  ) : currentUser.role === 'teacher' ? (
                    <GraduationCap className="w-4 h-4 text-emerald-800" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-800" />
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    {currentUser.role === 'admin'
                      ? 'Admin / Pimpinan'
                      : currentUser.role === 'teacher'
                      ? 'Ustadz Penguji'
                      : 'Santri'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown for Role & User Switching */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Peran / Pengguna Demo
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pilih role untuk menguji hak akses &amp; tampilan:
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(APP_USERS[0])}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-3 transition-colors ${
                        currentUser.id === APP_USERS[0].id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">{APP_USERS[0].name}</div>
                        <div className="text-[11px] text-slate-500">Peran: Admin (Akses Penuh)</div>
                      </div>
                    </button>

                    {/* Teacher 1 */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(APP_USERS[1])}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-3 transition-colors ${
                        currentUser.id === APP_USERS[1].id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">{APP_USERS[1].name}</div>
                        <div className="text-[11px] text-slate-500">Peran: Ustadz (Penguji Hafalan)</div>
                      </div>
                    </button>

                    {/* Teacher 2 */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(APP_USERS[2])}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-3 transition-colors ${
                        currentUser.id === APP_USERS[2].id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">{APP_USERS[2].name}</div>
                        <div className="text-[11px] text-slate-500">Peran: Ustadzah (Penguji Putri)</div>
                      </div>
                    </button>

                    {/* Student 1 */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(APP_USERS[3])}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-3 transition-colors ${
                        currentUser.id === APP_USERS[3].id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">{APP_USERS[3].name}</div>
                        <div className="text-[11px] text-slate-500">Peran: Santri (Hafalan Pribadi)</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100 px-3 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Kembalikan semua data ke setelan awal pabrik (seed)?')) {
                          onResetData();
                          setIsUserMenuOpen(false);
                        }
                      }}
                      className="w-full py-1.5 px-2 text-left text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Database Demo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {currentUser.role !== 'student' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSetoranModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Catat Setoran Baru
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
