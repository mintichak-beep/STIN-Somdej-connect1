import React from 'react';
import { UserRole } from '../types';
import { ROLES_DATA } from '../data/mockData';
import { HeartPulse, Bell, ArrowLeft, User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onBackToRoleSelection: () => void;
  onOpenInstructions: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onBackToRoleSelection,
  onOpenInstructions,
  onOpenNotifications,
}) => {
  const roleInfo = ROLES_DATA.find((r) => r.id === currentRole);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & System Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              STIN-Somdej connect
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล</p>
          </div>
        </div>

        {/* Selected Role Badge */}
        {roleInfo && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.badgeColor} flex items-center gap-1.5`}>
              <User className="w-3.5 h-3.5" />
              <span>{roleInfo.titleTh} ({roleInfo.titleEn})</span>
            </span>
          </div>
        )}
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenInstructions}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors hidden sm:flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-[#D9361C]" />
          <span>Instructions / คู่มือระบบ</span>
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D9361C]"></span>
        </button>

        <button
          onClick={onBackToRoleSelection}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#D9361C] bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Change Role / เปลี่ยนบทบาท</span>
          <span className="sm:hidden">Role</span>
        </button>
      </div>
    </header>
  );
};
