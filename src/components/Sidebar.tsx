import React from 'react';
import { NavTab, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  Zap, 
  Receipt, 
  Megaphone, 
  BarChart3, 
  Users,
  BookOpen 
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, currentRole }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, labelTh: 'แดชบอร์ด', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as NavTab, labelTh: 'ตารางการฝึกปฏิบัติ', labelEn: 'Training Schedule', icon: Calendar },
    { id: 'flowwork' as NavTab, labelTh: 'โฟลว์งาน (Flow Work)', labelEn: 'Flow Work', icon: FileText },
    { id: 'student-groups' as NavTab, labelTh: 'อัปโหลดกลุ่มนักศึกษา', labelEn: 'Student Groups', icon: Users },
    { id: 'van' as NavTab, labelTh: 'บริการรถตู้', labelEn: 'Van Service', icon: Bus },
    { id: 'accommodation' as NavTab, labelTh: 'หอพัก ค่าน้ำ-ค่าไฟ และสลิป', labelEn: 'Accommodation & Billing', icon: Bed },
    { id: 'announcements' as NavTab, labelTh: 'ประกาศ / ข่าวสาร', labelEn: 'Announcements', icon: Megaphone },
    { id: 'reports' as NavTab, labelTh: 'รายงานสรุป', labelEn: 'Reports', icon: BarChart3 },
    { id: 'instructions' as NavTab, labelTh: 'คู่มือระบบ', labelEn: 'System Instructions', icon: BookOpen },
  ];

  // Filter or prioritize based on role if desired, or show all with role badge context
  const getFilteredItems = () => {
    return navItems;
  };

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu ({currentRole || 'General'})
          </span>
          <p className="text-xs font-semibold text-slate-800 pt-0.5">ระบบฝึกปฏิบัติการพยาบาล</p>
        </div>

        <nav className="space-y-1">
          {getFilteredItems().map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#D9361C] text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#D9361C]'}`} />
                  <span className="text-left leading-snug">{item.labelTh}</span>
                </div>
                <span className={`text-[10px] hidden sm:inline ${isActive ? 'text-red-100' : 'text-slate-400'}`}>
                  {item.labelEn}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 px-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
          <p className="text-[11px] font-bold text-slate-700">Somdet Hospital</p>
          <p className="text-[10px] text-slate-500">Academic & Clinical Training Collaboration Center</p>
        </div>
      </div>
    </aside>
  );
};
