import React, { useState } from 'react';
import { UserRole } from '../types';
import { ROLES_DATA } from '../data/mockData';
import { GraduationCap, UserCheck, Hospital, ArrowRight, BookOpen, Plus, ShieldCheck, Stethoscope } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenInstructions: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onOpenInstructions }) => {
  const [imgFailed, setImgFailed] = useState(false);

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
    <div className="min-h-screen bg-[#E3F2FD] flex flex-col font-sans">
      {/* Main Split Layout matching reference UI */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Section: Blue Background Panel with Welcome & Role Selection */}
        <div className="lg:col-span-7 bg-[#E3F2FD] p-8 lg:p-14 flex flex-col justify-between space-y-8">
          
          {/* Top Brand & Instructions Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
                <Plus className="w-6 h-6 font-bold" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">STIN-Somdej connect</h1>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">ระบบประสานงานแหล่งฝึกโรงพยาบาลสมเด็จฯ ณ ศรีราชา</p>
              </div>
            </div>

            <button
              onClick={onOpenInstructions}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-sky-200 rounded-xl hover:bg-white hover:text-[#D9361C] transition-all shadow-xs whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-[#D9361C]" />
              <span>System Instructions / คู่มือระบบ</span>
            </button>
          </div>

          {/* Welcome & Titles */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
              Welcome
            </h2>
            <div className="space-y-1">
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#D9361C] tracking-tight">
                Nursing Practice Management System
              </h3>
              <p className="text-sm font-semibold text-slate-700 pt-1">
                ระบบประสานงานแหล่งฝึกโรงพยาบาลสมเด็จฯ ณ ศรีราชา
              </p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white/80 px-3 py-1.5 rounded-full border border-sky-200 inline-block">
                Choose Your Role
              </span>
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES_DATA.map((role) => (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group bg-white rounded-3xl p-6 border border-sky-100 hover:border-[#D9361C] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-6 relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-50/60 border border-red-100 flex items-center justify-center group-hover:bg-red-100 transition-colors shadow-xs mx-auto">
                    {getRoleIcon(role.iconName)}
                  </div>

                  <div className="space-y-1 text-center">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#D9361C] transition-colors">
                      {role.titleTh}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {role.descTh}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole(role.id);
                  }}
                  className="w-full py-3 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Security / Reliable Footer Tag */}
          <div className="pt-4 flex items-center justify-center text-xs font-medium text-slate-600 gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure · Reliable · Efficient — STIN-Somdej connect</span>
          </div>
        </div>

        {/* Right Section: Seamless Clinical Practice Illustration Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF6F0] via-[#FDE6D4] to-[#FCE0CB] flex flex-col items-center justify-center relative overflow-hidden border-t lg:border-t-0 lg:border-l border-orange-100/90 p-8 lg:p-12">
          <style>{`
            @keyframes heroFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            @media (prefers-reduced-motion: no-preference) {
              .animate-hero-float {
                animation: heroFloat 5s ease-in-out infinite;
              }
            }
          `}</style>

          {/* Subtle warm ambient accents */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#E3F2FD]/45 blur-2xl" />

          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            <div className="w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-[#FDE5D2] border border-white/80 shadow-xl shadow-orange-950/10 animate-hero-float">
              {!imgFailed ? (
                <img
                  src="/src/assets/images/nursing_hero_illustration_1794908493930.jpg"
                  alt="ภาพประกอบระบบบริหารจัดการฝึกปฏิบัติการพยาบาล STIN-Somdej connect"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#FFF3EE] to-[#E3F2FD]/60 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-orange-100 flex items-center justify-center text-[#D9361C]">
                    <Stethoscope className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-slate-900">STIN-Somdej connect</p>
                    <p className="text-xs text-slate-600">ระบบประสานงานแหล่งฝึกภาคปฏิบัติการพยาบาล</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
