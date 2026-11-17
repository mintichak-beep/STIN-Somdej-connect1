import React from 'react';
import { UserRole, NavTab } from '../types';
import { 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  ArrowRight, 
  Building2,
  Sparkles,
  Inbox
} from 'lucide-react';

interface DashboardViewProps {
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentRole, onNavigate }) => {
  const getRoleTitle = () => {
    switch (currentRole) {
      case 'instructor': return 'อาจารย์ / ผู้สอน (Instructor Dashboard)';
      case 'student': return 'นักศึกษาพยาบาล (Student Dashboard)';
      case 'staff': return 'เจ้าหน้าที่โรงพยาบาล (Hospital Staff Dashboard)';
      default: return 'แดชบอร์ดภาพรวมระบบ';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Greeting Banner */}
      <div className="bg-gradient-to-r from-[#B8E4FA]/60 via-white to-[#FFF7EF] rounded-3xl p-8 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#D9361C] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STIN-Somdej connect · Somdet Hospital & Academic Institution</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            ยินดีต้อนรับสู่ {getRoleTitle()}
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล ประจำปีการศึกษา 2569 (Milestone 1 Foundation - Real Data Policy)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('flowwork')}
            className="px-4 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
          >
            <span>เปิดโมดูลโฟลว์งาน (Flow Work)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (Zero / Empty States as per Strict Data Policy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigate('schedule')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Empty State
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-semibold text-slate-600">ตารางการฝึกปฏิบัติ</p>
            <p className="text-[11px] text-slate-400">ยังไม่มีตารางฝึกปฏิบัติ</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('flowwork')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D9361C] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Empty State
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-semibold text-slate-600">รายการงาน (Flow Work)</p>
            <p className="text-[11px] text-slate-400">ยังไม่มีรายการงาน</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('van')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Empty State
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-semibold text-slate-600">บันทึกการใช้รถตู้</p>
            <p className="text-[11px] text-slate-400">ยังไม่มีข้อมูลรถตู้</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('accommodation')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Empty State
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-semibold text-slate-600">ห้องพัก / หอพัก</p>
            <p className="text-[11px] text-slate-400">ยังไม่มีข้อมูลห้องพัก</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections with Strict Empty States */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">ตารางการฝึกปฏิบัติ</h3>
              <p className="text-xs text-slate-500">รายงานตารางฝึกปฏิบัติในโรงพยาบาลสมเด็จ</p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">ยังไม่มีตารางฝึกปฏิบัติ</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ระบบจะแสดงตารางฝึกปฏิบัติเมื่อมีการบันทึกข้อมูลจริงเข้าสู่ระบบตามนโยบายข้อมูลจริง (Real Data Only)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">การแจ้งเตือน</h3>
              <p className="text-xs text-slate-500">ประกาศและข้อความจากระบบ</p>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              เพิ่มเติม →
            </button>
          </div>

          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">ยังไม่มีการแจ้งเตือน</p>
            <p className="text-xs text-slate-400">ยังไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        </div>
      </div>
    </div>
  );
};
