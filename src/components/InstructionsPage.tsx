import React, { useState } from 'react';
import { INSTRUCTION_SECTIONS } from '../data/mockData';
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Home, 
  Users, 
  BookMarked, 
  Calendar, 
  Grid, 
  UserCheck, 
  Bed, 
  Bus, 
  Clock, 
  CalendarDays, 
  LayoutDashboard, 
  FileText, 
  HelpCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { InstructionSection } from '../types';

interface InstructionsPageProps {
  onBackToDashboard?: () => void;
}

export const InstructionsPage: React.FC<InstructionsPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<InstructionSection | null>(null);

  const categories = ['All', 'General', 'Academic', 'Scheduling', 'Faculty', 'Facilities', 'Logistics', 'Reports', 'Support'];

  const filteredSections = INSTRUCTION_SECTIONS.filter((section) => {
    const matchesSearch = 
      section.titleTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.descriptionTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || section.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-6 h-6 text-[#3B82F6]" />;
      case 'Users': return <Users className="w-6 h-6 text-[#D9361C]" />;
      case 'BookOpen': return <BookMarked className="w-6 h-6 text-emerald-600" />;
      case 'Calendar': return <Calendar className="w-6 h-6 text-amber-600" />;
      case 'Grid': return <Grid className="w-6 h-6 text-indigo-600" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-blue-600" />;
      case 'Bed': return <Bed className="w-6 h-6 text-purple-600" />;
      case 'Bus': return <Bus className="w-6 h-6 text-rose-600" />;
      case 'Clock': return <Clock className="w-6 h-6 text-teal-600" />;
      case 'CalendarDays': return <CalendarDays className="w-6 h-6 text-sky-600" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-6 h-6 text-[#D9361C]" />;
      case 'FileText': return <FileText className="w-6 h-6 text-blue-700" />;
      case 'HelpCircle': return <HelpCircle className="w-6 h-6 text-amber-700" />;
      default: return <BookOpen className="w-6 h-6 text-[#3B82F6]" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Section */}
      <div className="relative bg-gradient-to-r from-sky-100 via-rose-50 to-amber-50 rounded-3xl p-8 lg:p-12 border border-sky-200/60 shadow-lg shadow-sky-950/5 overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-blue-200/40 via-red-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sky-200 text-[#D9361C] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Nursing Education Guide</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9361C] flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                System Instructions
              </h2>
            </div>
            <p className="text-base text-slate-600 font-medium">
              STIN-Somdej connect: คู่มือการใช้งานระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล สำหรับสถาบันการศึกษาและโรงพยาบาลสมเด็จ
            </p>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            เรียนรู้ขั้นตอนการดำเนินงานและการใช้งานโมดูลต่างๆ ตั้งแต่การบริหารจัดการนักศึกษา ตารางฝึกปฏิบัติ การส่งโฟลว์งาน ไปจนถึงการจองรถตู้ ที่พัก และการตรวจทานของประธานหลักสูตร
          </p>

          {/* Search bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาคู่มือ หัวข้อ หรือขั้นตอนการใช้งาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/95 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9361C]/50 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#D9361C] text-white shadow-md shadow-red-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Instruction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-[#D9361C] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -mr-8 -mt-8 group-hover:from-red-50/60 transition-colors"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-100 transition-colors shadow-xs">
                  {getSectionIcon(section.icon)}
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold tracking-wider group-hover:bg-[#D9361C] group-hover:text-white transition-colors">
                  {section.stepNumber}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#D9361C] uppercase tracking-wider">
                  {section.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#D9361C] transition-colors leading-snug">
                  {section.titleTh}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {section.descriptionTh}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
              <span className="text-[11px] font-semibold text-slate-400">
                {section.titleEn}
              </span>
              <button
                onClick={() => setActiveModalItem(section)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#D9361C] bg-red-50 hover:bg-[#D9361C] hover:text-white rounded-xl transition-all flex items-center gap-1 shadow-xs"
              >
                <span>View Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <h4 className="text-lg font-bold text-slate-900">ไม่พบหัวข้อคู่มือที่ค้นหา</h4>
          <p className="text-xs text-slate-500">กรุณาลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      )}

      {/* Detailed Modal for Guide */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#D9361C]">
                  {getSectionIcon(activeModalItem.icon)}
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#D9361C]">Step {activeModalItem.stepNumber} · {activeModalItem.category}</span>
                  <h3 className="text-xl font-bold text-slate-900">{activeModalItem.titleTh}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
                <span className="text-xs font-bold text-sky-900 uppercase">English Overview</span>
                <p className="text-xs text-sky-800">{activeModalItem.descriptionEn}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายละเอียดคู่มือ (Detailed Instructions)</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  {activeModalItem.descriptionTh} ระบบได้รับการออกแบบตามมาตรฐานการพยาบาลเพื่ออำนวยความสะดวกแก่อาจารย์ นักศึกษา และเจ้าหน้าที่โรงพยาบาลสมเด็จ สามารถใช้งานผ่านเมนูด้านข้างได้ทันที
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <span className="font-bold">หมายเหตุ (Milestone 1):</span>
                <span>ในเวอร์ชันนี้เป็นการสร้างโครงสร้างหน้าจอและระบบนำทาง เอกสารคำแนะนำจะได้รับการเชื่อมโยงกับฐานข้อมูลจริงในลำดับถัดไป</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-6 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 transition-all"
              >
                เข้าใจแล้ว (Got It)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
