import React from 'react';
import { UserRole } from '../types';
import { ROLES_DATA } from '../data/mockData';
import { GraduationCap, UserCheck, Hospital, ArrowRight, ShieldCheck, HeartPulse, Sparkles, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenInstructions: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onOpenInstructions }) => {
  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8 text-[#D9361C]" />;
      case 'UserCheck':
        return <UserCheck className="w-8 h-8 text-[#3B82F6]" />;
      case 'Hospital':
        return <Hospital className="w-8 h-8 text-emerald-600" />;
      default:
        return <GraduationCap className="w-8 h-8 text-[#D9361C]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF8FF] via-[#FFF7EF] to-[#FCE7F3] flex flex-col font-sans">
      {/* Top Bar / Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-sky-100/60 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">STIN-Somdej connect</h1>
            <p className="text-xs text-slate-500">ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-[#D9361C] transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-[#D9361C]" />
            <span>System Instructions / คู่มือระบบ</span>
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section: Branding & Welcome */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#D9361C] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Somdet Hospital & Academic Institution</span>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              STIN-Somdej <br />
              <span className="text-[#D9361C]">connect</span>
            </h2>
            <p className="text-lg font-medium text-slate-600">
              ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              แพลตฟอร์มศูนย์กลางสำหรับการจัดการตารางฝึกปฏิบัติ การส่งโฟลว์งาน (Flow Work) รถตู้รับส่ง หอพักนักศึกษา และการตรวจทานโดยประธานหลักสูตรอย่างเป็นระบบ
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure Role Portal</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Milestone 1 Foundation</span>
            </div>
          </div>
        </div>

        {/* Right Section: Role Cards Selection */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-10 border border-white shadow-xl shadow-sky-900/5 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9361C]">Welcome / ยินดีต้อนรับ</span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Choose Your Role</h3>
            <p className="text-xs text-slate-500">กรุณาเลือกบทบาทผู้ใช้งานเพื่อเข้าสู่ระบบตามสิทธิ์การปฏิบัติงาน</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES_DATA.map((role) => (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#D9361C] hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-50 to-transparent rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-red-50 transition-colors shadow-xs">
                    {getRoleIcon(role.iconName)}
                  </div>

                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-[#D9361C] transition-colors">
                      {role.titleEn}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 leading-snug">{role.titleTh}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">{role.descTh}</p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span className="text-xs font-semibold text-[#D9361C] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-[#D9361C] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">i</div>
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Milestone 1 Notice:</span> Role selection provides navigation and role-specific shell views. Secure backend authentication and live database storage will be integrated in subsequent milestones.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-slate-200/60 bg-white/50 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
        <p>© 2026 Nursing Practice Management System — Somdet Hospital & Academic Institution.</p>
        <p className="text-slate-400">Version 1.0.0 (Milestone 1 Foundation)</p>
      </footer>
    </div>
  );
};
