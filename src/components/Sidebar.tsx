import React from 'react';
import { NavTab, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  Megaphone, 
  BarChart3, 
  Users,
  BookOpen,
  Plus,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentRole: UserRole;
  pendingFlowCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  pendingFlowCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, labelTh: 'หน้าหลัก', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as NavTab, labelTh: 'ตารางการฝึกปฏิบัติ', labelEn: 'Training Schedule', icon: Calendar },
    { id: 'flowwork' as NavTab, labelTh: 'โฟลว์งาน (Flow Work)', labelEn: 'Flow Work', icon: FileText },
    { id: 'student-groups' as NavTab, labelTh: 'ข้อมูลกลุ่มนักศึกษา', labelEn: 'Student Groups', icon: Users },
    { id: 'van' as NavTab, labelTh: 'บริการรถตู้', labelEn: 'Van Service', icon: Bus },
    { id: 'accommodation' as NavTab, labelTh: 'หอพัก ค่าน้ำ-ค่าไฟ และสลิป', labelEn: 'Accommodation & Billing', icon: Bed },
    { id: 'announcements' as NavTab, labelTh: 'ประกาศ / ข่าวสาร', labelEn: 'Announcements', icon: Megaphone },
    { id: 'reports' as NavTab, labelTh: 'รายงานและสถิติ', labelEn: 'Reports', icon: BarChart3 },
    { id: 'instructions' as NavTab, labelTh: 'คู่มือระบบ', labelEn: 'System Instructions', icon: BookOpen },
  ];

  const getFilteredItems = () => {
    if (currentRole === 'student') {
      return navItems.filter((item) => item.id !== 'student-groups' && item.id !== 'reports');
    }
    return navItems;
  };

  return (
    <aside className="w-full lg:w-72 bg-white/95 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-sky-100 text-slate-800 p-6 shrink-0 flex flex-col justify-between shadow-xs">
      <div className="space-y-8">
        {/* Brand Logo Header matching Landing Page */}
        <div className="flex items-center gap-3.5 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
              STIN-Somdej connect
            </h1>
            <p className="text-[11px] font-semibold text-[#3B82F6] truncate">
              ระบบประสานงานแหล่งฝึก
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              โรงพยาบาลสมเด็จฯ ณ ศรีราชา
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {getFilteredItems().map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#D9361C] text-white shadow-md shadow-red-500/20'
                    : 'text-slate-700 hover:bg-[#E3F2FD]/80 hover:text-[#D9361C]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#3B82F6] group-hover:text-[#D9361C]'
                    }`}
                  />
                  <span className="text-left tracking-wide truncate">{item.labelTh}</span>
                </div>
                {item.id === 'flowwork' && pendingFlowCount > 0 && (
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-white text-[#D9361C]'
                        : 'bg-[#FFF3EE] text-[#D9361C] border border-orange-200'
                    }`}
                  >
                    {pendingFlowCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Guide Link Card matching Landing Page palette */}
      <div className="mt-8 pt-4 border-t border-sky-100">
        <button
          type="button"
          onClick={() => onSelectTab('instructions')}
          className="w-full text-left p-4 bg-gradient-to-br from-[#E3F2FD]/80 to-[#FFF3EE]/80 hover:from-[#E3F2FD] hover:to-[#FFF3EE] rounded-2xl border border-sky-200/80 space-y-1.5 transition-all"
        >
          <div className="flex items-center gap-2 text-[#D9361C]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">คู่มือการใช้งานระบบ</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            ดูขั้นตอนการใช้งานสำหรับอาจารย์ นักศึกษา และเจ้าหน้าที่โรงพยาบาล
          </p>
        </button>
      </div>
    </aside>
  );
};
