import React from 'react';
import { UserRole, NavTab } from '../types';
import { 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  ArrowRight, 
  Sparkles,
  Inbox,
  Activity,
  BellRing
} from 'lucide-react';

interface DashboardViewProps {
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentRole, onNavigate }) => {
  const getRoleTitle = () => {
    switch (currentRole) {
      case 'instructor': return 'อาจารย์ / ผู้สอน';
      case 'student': return 'นักศึกษาพยาบาล';
      case 'staff': return 'เจ้าหน้าที่โรงพยาบาล';
      default: return 'แดชบอร์ดภาพรวม';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Greeting Banner */}
      <div className="relative bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-3xl p-8 border border-sky-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 via-red-50/30 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#D9361C] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STIN-Somdej connect · Somdet Hospital</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            ยินดีต้อนรับ {getRoleTitle()}
          </h2>
          <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
            ระบบบริหารจัดการฝึกปฏิบัติการพยาบาลแบบเรียลไทม์ พร้อมเชื่อมโยงข้อมูลทุกภาคส่วน
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('flowwork')}
            className="px-4 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
          >
            <span>ส่งข้อมูลรายวิชา</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigate('schedule')}
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-bold text-slate-800">ตารางการฝึกปฏิบัติ</p>
            <p className="text-[11px] text-slate-400">แยกตามรายวิชา</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('flowwork')}
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-[#D9361C] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-[#D9361C] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              Flow
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-bold text-slate-800">โฟลว์งานรายวิชา</p>
            <p className="text-[11px] text-slate-400">ส่งข้อมูลและรายงาน</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('van')}
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Van
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-bold text-slate-800">บริการรถตู้</p>
            <p className="text-[11px] text-slate-400">ไป-กลับคันเดียวกัน</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('accommodation')}
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Bed className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              Room
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono">0</h4>
            <p className="text-xs font-bold text-slate-800">หอพักและบิล</p>
            <p className="text-[11px] text-slate-400">ห้องพัก ค่าน้ำ-ไฟ</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>ตารางการฝึกปฏิบัติล่าสุด</span>
              </h3>
              <p className="text-xs text-slate-400">โรงพยาบาลสมเด็จและแหล่งฝึก</p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="text-center py-12 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">ยังไม่มีข้อมูลตารางฝึกปฏิบัติ</p>
            <p className="text-[11px] text-slate-400">ระบบจะแสดงข้อมูลแบบเรียลไทม์เมื่อบันทึกข้อมูลจริง</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#D9361C]" />
                <span>ประกาศและแจ้งเตือน</span>
              </h3>
              <p className="text-xs text-slate-400">ข่าวสารจากสถาบัน</p>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              เพิ่มเติม →
            </button>
          </div>

          <div className="text-center py-12 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">ยังไม่มีประกาศใหม่</p>
            <p className="text-[11px] text-slate-400">ติดตามข่าวสารผ่านระบบ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
