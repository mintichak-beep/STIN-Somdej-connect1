import React from 'react';
import { UserRole } from '../types';
import { ROLES_DATA } from '../data/mockData';
import { GraduationCap, UserCheck, Hospital, ArrowRight, BookOpen, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-[#E3F2FD] flex flex-col font-sans">
      {/* Main Split Layout matching reference UI */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Section: Blue Background Panel with Welcome & Role Selection */}
        <div className="lg:col-span-7 bg-[#E3F2FD] p-8 lg:p-14 flex flex-col justify-between space-y-8">
          
          {/* Top Brand & Instructions Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <Plus className="w-6 h-6 font-bold" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">STIN-Somdej connect</h1>
                <p className="text-[11px] font-semibold text-slate-600">ระบบประสานงานแหล่งฝึกโรงพยาบาลสมเด็จฯ ณ ศรีราชา</p>
              </div>
            </div>

            <button
              onClick={onOpenInstructions}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-sky-200 rounded-xl hover:bg-white hover:text-[#D9361C] transition-all shadow-xs"
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
                  className="w-full py-3 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Security / Reliable Footer Tag */}
          <div className="pt-4 flex items-center justify-center text-xs font-medium text-slate-600 gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Secure · Reliable · Efficient — STIN-Somdej connect</span>
          </div>
        </div>

        {/* Right Section: Animated Medical Equipment Illustration Image */}
        <div className="lg:col-span-5 bg-[#FFF3EE] flex items-center justify-center relative overflow-hidden border-l border-orange-100 p-6 lg:p-12">
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-12px) rotate(0.5deg); }
            }
            .animate-float {
              animation: float 4.5s ease-in-out infinite;
            }
          `}</style>
          <div className="w-full h-full flex items-center justify-center max-w-xl max-h-[85vh]">
            <img
              src="/assets/aistudio/Screenshot_2026-11-17_154012_eb584867.png"
              alt="Animated Medical Equipment Illustration"
              className="w-full h-full object-contain drop-shadow-2xl rounded-3xl animate-float"
            />
          </div>
        </div>

      </main>
    </div>
  );
};
