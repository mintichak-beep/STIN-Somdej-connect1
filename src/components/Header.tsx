import React, { useState } from 'react';
import { NavTab, UserRole } from '../types';
import { ROLES_DATA } from '../data/mockData';
import { Bell, ArrowLeft, BookOpen, Search, GraduationCap, UserCheck, Hospital } from 'lucide-react';

interface SearchableItem {
  id: string;
  label: string;
  sub: string;
  tab: NavTab;
  category: string;
}

interface HeaderProps {
  currentRole: UserRole;
  onBackToRoleSelection: () => void;
  onOpenInstructions: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  searchableItems: SearchableItem[];
  onNavigate: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onBackToRoleSelection,
  onOpenInstructions,
  onOpenNotifications,
  notificationCount,
  searchableItems,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const roleInfo = ROLES_DATA.find((r) => r.id === currentRole);

  const renderRoleIcon = () => {
    if (currentRole === 'instructor') return <UserCheck className="w-4 h-4 text-[#3B82F6]" />;
    if (currentRole === 'staff') return <Hospital className="w-4 h-4 text-emerald-600" />;
    return <GraduationCap className="w-4 h-4 text-[#D9361C]" />;
  };

  const trimmed = searchTerm.trim().toLowerCase();
  const matchedResults = trimmed
    ? searchableItems
        .filter(
          (item) =>
            item.label.toLowerCase().includes(trimmed) ||
            item.sub.toLowerCase().includes(trimmed) ||
            item.category.toLowerCase().includes(trimmed)
        )
        .slice(0, 6)
    : [];

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-sky-100 px-6 lg:px-10 flex items-center justify-between gap-6 sticky top-0 z-30 shadow-xs">
      {/* Real-time Live Search Input across Firestore records */}
      <div className="flex items-center gap-4 flex-1 max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-4 top-3 w-4 h-4 text-sky-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
            placeholder="ค้นหาตารางฝึก โฟลว์งาน รถตู้ หอพัก หรือประกาศ..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#E3F2FD]/60 hover:bg-[#E3F2FD] focus:bg-white border border-sky-200/80 focus:border-[#3B82F6] rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none transition-all"
          />
        </div>

        {isSearchFocused && trimmed && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl border border-sky-200 shadow-xl p-2 z-50 space-y-1">
            {matchedResults.length === 0 ? (
              <p className="text-xs text-slate-500 px-3 py-2.5 text-center">
                ไม่พบข้อมูลที่ตรงกับ "{searchTerm}"
              </p>
            ) : (
              matchedResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onMouseDown={() => {
                    onNavigate(res.tab);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#E3F2FD]/70 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{res.label}</p>
                    {res.sub && <p className="text-[11px] text-slate-500 truncate">{res.sub}</p>}
                  </div>
                  <span className="text-[10px] font-semibold text-[#D9361C] shrink-0">
                    {res.category}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenInstructions}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#E3F2FD]/70 hover:bg-[#E3F2FD] border border-sky-200/80 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4 text-[#D9361C]" />
          <span>คู่มือระบบ</span>
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-2xl bg-[#E3F2FD]/70 hover:bg-[#E3F2FD] border border-sky-200/80 flex items-center justify-center text-slate-700 transition-colors"
          title="การแจ้งเตือน"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5 text-[#3B82F6]" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D9361C] text-white text-[10px] font-bold flex items-center justify-center shadow-xs tabular-nums">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Active Role Display (No mock user identity) */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-sky-100">
          <div className="w-9 h-9 rounded-xl bg-[#FFF3EE] border border-orange-200 flex items-center justify-center shadow-2xs">
            {renderRoleIcon()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
              {roleInfo ? roleInfo.titleTh : 'ผู้ใช้งานระบบ'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
              STIN-Somdej connect
            </p>
          </div>
        </div>

        <button
          onClick={onBackToRoleSelection}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#D9361C] hover:bg-red-700 rounded-xl transition-all shadow-sm shadow-red-500/20 whitespace-nowrap"
          title="เปลี่ยนบทบาท"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xl:inline">เปลี่ยนบทบาท</span>
        </button>
      </div>
    </header>
  );
};
