import React, { useEffect, useState } from 'react';
import { UserRole, NavTab } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  ArrowRight, 
  Sparkles,
  Inbox,
  Activity,
  BellRing,
  Building,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
}

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function formatThaiShortDate(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]}`;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentRole, onNavigate }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [flowWorks, setFlowWorks] = useState<any[]>([]);
  const [vanBookings, setVanBookings] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const unsubSched = onSnapshot(
      query(collection(db, 'trainingSchedules')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setSchedules(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'trainingSchedules')
    );

    const unsubFlow = onSnapshot(
      query(collection(db, 'flowWorks')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setFlowWorks(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'flowWorks')
    );

    const unsubVan = onSnapshot(
      query(collection(db, 'vanBookings')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setVanBookings(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'vanBookings')
    );

    const unsubAcc = onSnapshot(
      query(collection(db, 'accommodationRecords')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setAccommodations(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'accommodationRecords')
    );

    const unsubAnn = onSnapshot(
      query(collection(db, 'announcements')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setAnnouncements(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'announcements')
    );

    return () => {
      unsubSched();
      unsubFlow();
      unsubVan();
      unsubAcc();
      unsubAnn();
    };
  }, []);

  const getRoleTitle = () => {
    switch (currentRole) {
      case 'instructor': return 'อาจารย์ / ผู้สอน';
      case 'student': return 'นักศึกษาพยาบาล';
      case 'staff': return 'เจ้าหน้าที่โรงพยาบาล';
    default: return 'แดชบอร์ดภาพรวม';
    }
  };

  const currentWeekStart = getMondayOfWeek(new Date());
  const currentWeekEnd = addDays(currentWeekStart, 6);
  const currentWeekStartIso = formatIsoDate(currentWeekStart);
  const currentWeekEndIso = formatIsoDate(currentWeekEnd);

  const currentWeekSchedules = schedules.filter((item) => {
    const s = item.startDate || item.endDate;
    const e = item.endDate || item.startDate;
    return Boolean(s && e && s <= currentWeekEndIso && e >= currentWeekStartIso);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Greeting Banner matching Landing Page palette */}
      <div className="relative bg-gradient-to-r from-[#E3F2FD] via-white to-[#FFF3EE] rounded-3xl p-8 border border-sky-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-sky-200 text-[#D9361C] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STIN-Somdej connect · Somdet Hospital</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            ยินดีต้อนรับ {getRoleTitle()}
          </h2>
          <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
            ระบบประสานงานแหล่งฝึกโรงพยาบาลสมเด็จฯ ณ ศรีราชา แบบเรียลไทม์
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate(currentRole === 'student' ? 'accommodation' : 'flowwork')}
            className="px-5 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
          >
            <span>{currentRole === 'student' ? 'อัปโหลดสลิป / ดูหอพัก' : 'ส่งข้อมูลรายวิชา'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (Live Firestore Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigate('schedule')}
          className="group bg-white rounded-3xl p-6 border border-sky-100 hover:border-[#3B82F6] hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#3B82F6] border border-sky-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#3B82F6]">
              {schedules.length > 0 ? 'ใช้งานอยู่' : 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{schedules.length}</h4>
            <p className="text-xs font-bold text-slate-800">ตารางการฝึกปฏิบัติ</p>
            <p className="text-[11px] text-slate-500">แยกตามรายวิชา</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('flowwork')}
          className="group bg-white rounded-3xl p-6 border border-sky-100 hover:border-[#D9361C] hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF3EE] text-[#D9361C] border border-orange-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#D9361C]">
              {flowWorks.length > 0 ? 'ใช้งานอยู่' : 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{flowWorks.length}</h4>
            <p className="text-xs font-bold text-slate-800">โฟลว์งานรายวิชา</p>
            <p className="text-[11px] text-slate-500">ส่งข้อมูลและรายงาน</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('van')}
          className="group bg-white rounded-3xl p-6 border border-sky-100 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              {vanBookings.length > 0 ? 'ใช้งานอยู่' : 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{vanBookings.length}</h4>
            <p className="text-xs font-bold text-slate-800">บริการรถตู้</p>
            <p className="text-[11px] text-slate-500">ไป-กลับและรายชื่อ</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('accommodation')}
          className="group bg-white rounded-3xl p-6 border border-sky-100 hover:border-[#3B82F6] hover:shadow-lg transition-all cursor-pointer space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#3B82F6] border border-sky-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bed className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#3B82F6]">
              {accommodations.length > 0 ? 'ใช้งานอยู่' : 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{accommodations.length}</h4>
            <p className="text-xs font-bold text-slate-800">หอพักและบิล</p>
            <p className="text-[11px] text-slate-500">ห้องพัก ค่าน้ำ-ไฟ</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-sky-100 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3B82F6]" />
                <span>ตารางการฝึกปฏิบัติสัปดาห์ปัจจุบัน</span>
              </h3>
              <p className="text-xs text-slate-500">
                ช่วงวันที่ {formatThaiShortDate(currentWeekStart)} – {formatThaiShortDate(currentWeekEnd)} {currentWeekEnd.getFullYear() + 543} · {currentWeekSchedules.length} รายการ
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              ดูทั้งหมด →
            </button>
          </div>

          {currentWeekSchedules.length === 0 ? (
            <div className="text-center py-12 bg-[#E3F2FD]/40 rounded-2xl border border-sky-100 space-y-2">
              <Inbox className="w-8 h-8 text-sky-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">ยังไม่มีตารางฝึกปฏิบัติในสัปดาห์ปัจจุบัน</p>
              <p className="text-[11px] text-slate-500">
                {schedules.length > 0
                  ? `มีตารางฝึกทั้งหมด ${schedules.length} รายการในสัปดาห์อื่น กด "ดูทั้งหมด" เพื่อเปิดปฏิทิน`
                  : 'ระบบจะแสดงข้อมูลแบบเรียลไทม์เมื่อบันทึกข้อมูลจริง'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentWeekSchedules.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#E3F2FD]/35 border border-sky-100 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-[#3B82F6]">{item.courseName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">{item.studentGroup}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {item.startDate} – {item.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{item.trainingSite}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    <span>อาจารย์นิเทศ: {item.instructorNames}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-sky-100 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#D9361C]" />
                <span>ประกาศและแจ้งเตือน</span>
              </h3>
              <p className="text-xs text-slate-500">ข่าวสารจากสถาบัน</p>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-[#D9361C] hover:underline"
            >
              เพิ่มเติม →
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-[#FFF3EE]/60 rounded-2xl border border-orange-100 space-y-2">
              <Inbox className="w-8 h-8 text-orange-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">ยังไม่มีประกาศใหม่</p>
              <p className="text-[11px] text-slate-500">ติดตามข่าวสารผ่านระบบ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 4).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#FFF3EE]/60 border border-orange-100 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-[#D9361C]">{item.category}</span>
                    <span className="text-slate-400">{item.createdAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
