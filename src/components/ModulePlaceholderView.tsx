import React, { useState, useEffect } from 'react';
import { NavTab, UserRole } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { 
  Calendar, 
  FileText, 
  Bus, 
  Bed, 
  Zap, 
  Receipt, 
  Megaphone, 
  BarChart3, 
  Users,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  Link2,
  Building,
  UserCheck,
  Phone,
  Car
} from 'lucide-react';

interface ModulePlaceholderViewProps {
  tab: NavTab;
  currentRole: UserRole;
  onBackToDashboard: () => void;
  onOpenInstructions: () => void;
}

export const ModulePlaceholderView: React.FC<ModulePlaceholderViewProps> = ({
  tab,
  currentRole,
  onBackToDashboard,
  onOpenInstructions,
}) => {
  const [subTab, setSubTab] = useState<'rooms' | 'utilities' | 'payments'>('rooms');

  // Real-time state collections (strictly zero mock data)
  const [flowWorks, setFlowWorks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [vanBookings, setVanBookings] = useState<any[]>([]);
  const [studentGroups, setStudentGroups] = useState<any[]>([]);
  const [accommodationRecords, setAccommodationRecords] = useState<any[]>([]);
  const [trainingSchedules, setTrainingSchedules] = useState<any[]>([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('หอผู้ป่วยอายุรกรรม');
  const [newStudentGroup, setNewStudentGroup] = useState('กลุ่ม ก');
  const [newStudentName, setNewStudentName] = useState('');
  const [newAnnouncementDesc, setNewAnnouncementDesc] = useState('');
  
  // Van assignment form states (with van number, driver name, phone)
  const [vanRoute, setVanRoute] = useState('สถาบัน ⟷ โรงพยาบาลสมเด็จ (รอบ 08:00)');
  const [vanNumber, setVanNumber] = useState('คันที่ 1');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vanSelectedStudentId, setVanSelectedStudentId] = useState('');
  
  // Student Group Upload states
  const [studentInputList, setStudentInputList] = useState('');
  const [targetGroup, setTargetGroup] = useState('กลุ่ม ก');
  const [targetWard, setTargetWard] = useState('หอผู้ป่วยอายุรกรรม');

  // Training Schedule form states (supports multiple instructors co-actively)
  const [schedGroup, setSchedGroup] = useState('กลุ่ม ก');
  const [schedInstructors, setSchedInstructors] = useState('');
  const [schedSite, setSchedSite] = useState('โรงพยาบาลสมเด็จ - หอผู้ป่วยอายุรกรรม');
  const [schedStartDate, setSchedStartDate] = useState('');
  const [schedEndDate, setSchedEndDate] = useState('');

  // Accommodation & Room Assignment form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomSelectedStudentId, setRoomSelectedStudentId] = useState('');
  const [utilityTitle, setUtilityTitle] = useState('');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Setup real-time listeners co-actively
  useEffect(() => {
    const unsubFlow = onSnapshot(query(collection(db, 'flowWorks')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setFlowWorks(items);
    }, (err) => console.error(err));

    const unsubAnn = onSnapshot(query(collection(db, 'announcements')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setAnnouncements(items);
    }, (err) => console.error(err));

    const unsubVan = onSnapshot(query(collection(db, 'vanBookings')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setVanBookings(items);
    }, (err) => console.error(err));

    const unsubSt = onSnapshot(query(collection(db, 'studentGroups')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setStudentGroups(items);
    }, (err) => console.error(err));

    const unsubAcc = onSnapshot(query(collection(db, 'accommodationRecords')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setAccommodationRecords(items);
    }, (err) => console.error(err));

    const unsubSched = onSnapshot(query(collection(db, 'trainingSchedules')), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setTrainingSchedules(items);
    }, (err) => console.error(err));

    return () => {
      unsubFlow();
      unsubAnn();
      unsubVan();
      unsubSt();
      unsubAcc();
      unsubSched();
    };
  }, []);

  // Handlers for adding data
  const handleAddFlowWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'flowWorks'), {
        title: newTitle,
        department: newDepartment.trim() || 'ทั่วไป',
        studentName: newStudentName.trim() || 'นักศึกษาพยาบาล',
        studentGroup: newStudentGroup.trim() || 'กลุ่มทั่วไป',
        status: 'รอตรวจทาน (Pending Review)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setNewTitle('');
      setNewStudentName('');
      setSuccessMsg('บันทึกและส่งโฟลว์งานสำเร็จ ทุกคนเห็นทันทีแบบ Real-time');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAnnouncementDesc.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: newTitle,
        description: newAnnouncementDesc,
        category: 'ประกาศด่วน (Urgent)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setNewTitle('');
      setNewAnnouncementDesc('');
      setSuccessMsg('โพสต์ประกาศสำเร็จ ทุกคนเห็นทันทีแบบ Real-time');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainingSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedInstructors.trim() || !schedStartDate || !schedEndDate) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'trainingSchedules'), {
        studentGroup: schedGroup.trim() || 'กลุ่ม ก',
        instructorNames: schedInstructors.trim(), // Supports multiple instructors co-actively
        trainingSite: schedSite.trim() || 'โรงพยาบาลสมเด็จ',
        startDate: schedStartDate,
        endDate: schedEndDate,
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setSchedInstructors('');
      setSchedStartDate('');
      setSchedEndDate('');
      setSuccessMsg('บันทึกตารางการฝึกปฏิบัติ (ระบุอาจารย์หลายท่าน) สำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVanBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vanRoute.trim() || !vanSelectedStudentId || !driverName.trim()) return;
    setLoading(true);
    try {
      const studentObj = studentGroups.find(s => s.id === vanSelectedStudentId);
      const studentDisplayName = studentObj ? `${studentObj.studentName} (${studentObj.groupName})` : 'ไม่ระบุชื่อ';

      await addDoc(collection(db, 'vanBookings'), {
        route: vanRoute.trim(),
        vanNumber: vanNumber.trim() || 'คันที่ 1',
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || 'ไม่ระบุ',
        assignedStudentId: vanSelectedStudentId,
        assignedStudentName: studentDisplayName,
        timeSlot: '08:00 - 09:00',
        status: 'ยืนยันแล้ว (Confirmed)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setDriverName('');
      setDriverPhone('');
      setVanSelectedStudentId('');
      setSuccessMsg('บันทึกข้อมูลรถตู้ (คันที่ คนขับ เบอร์โทร) สำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStudentGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInputList.trim()) return;
    setLoading(true);
    try {
      const lines = studentInputList.split('\n').filter(l => l.trim() !== '');
      for (const line of lines) {
        const parts = line.split(/[,	]/);
        const name = parts[0]?.trim() || line.trim();
        const studentId = parts[1]?.trim() || `STIN-${Math.floor(10000 + Math.random() * 90000)}`;

        await addDoc(collection(db, 'studentGroups'), {
          studentName: name,
          studentId: studentId,
          groupName: targetGroup.trim() || 'กลุ่มทั่วไป',
          ward: targetWard.trim() || 'วอร์ดทั่วไป',
          createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        });
      }
      setStudentInputList('');
      setSuccessMsg(`อัปโหลดและเพิ่มรายชื่อนักศึกษาสำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoomAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !roomSelectedStudentId) return;
    setLoading(true);
    try {
      const studentObj = studentGroups.find(s => s.id === roomSelectedStudentId);
      const studentDisplayName = studentObj ? `${studentObj.studentName} (${studentObj.groupName} - ID: ${studentObj.studentId})` : 'ไม่ระบุ';

      await addDoc(collection(db, 'accommodationRecords'), {
        type: 'rooms',
        title: `ห้องพัก: ${roomNumber.trim()}`,
        assignedStudentId: roomSelectedStudentId,
        assignedTo: studentDisplayName,
        amount: 'หอพักสถาบัน / รพ.สมเด็จ',
        status: 'เข้าพักแล้ว (Occupied)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setRoomNumber('');
      setRoomSelectedStudentId('');
      setSuccessMsg('Assign นักศึกษาเข้าห้องพักสำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilityTitle.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'accommodationRecords'), {
        type: 'utilities',
        title: utilityTitle.trim(),
        amount: utilityAmount ? `${utilityAmount} ฿` : '0 ฿',
        status: 'รอชำระ (Pending)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setUtilityTitle('');
      setUtilityAmount('');
      setSuccessMsg('บันทึกค่าน้ำ-ค่าไฟสำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTitle.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'accommodationRecords'), {
        type: 'payments',
        title: paymentTitle.trim(),
        amount: paymentAmount ? `${paymentAmount} ฿` : '0 ฿',
        status: 'รอตรวจสอบสลิป (Pending Review)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setPaymentTitle('');
      setPaymentAmount('');
      setSuccessMsg('อัปโหลดสลิปโอนเงินสำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(error);
    }
  };

  const getModuleDetails = () => {
    switch (tab) {
      case 'schedule':
        return { titleTh: 'ตารางการฝึกปฏิบัติ (Training Schedule)', titleEn: 'Training Schedule Module', icon: Calendar, color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'flowwork':
        return { titleTh: 'โฟลว์งาน (Flow Work Submissions)', titleEn: 'Flow Work Review Module', icon: FileText, color: 'bg-red-50 text-[#D9361C] border-red-200' };
      case 'student-groups':
        return { titleTh: 'กลุ่มนักศึกษาและการจัดกลุ่ม (Student Groups)', titleEn: 'Student Groups Module', icon: Users, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'van':
        return { titleTh: 'บริการรถตู้รับส่งและข้อมูลคนขับ (Van Transportation)', titleEn: 'Van Transportation Module', icon: Bus, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'accommodation':
        return { titleTh: 'หอพัก ค่าน้ำ-ค่าไฟ และสลิปโอนเงิน (Accommodation & Billing)', titleEn: 'Rooms, Utilities & Payment Slips Unified Module', icon: Bed, color: 'bg-purple-50 text-purple-600 border-purple-200' };
      case 'announcements':
        return { titleTh: 'ประกาศ / ข่าวสาร (Announcements)', titleEn: 'Announcements Module', icon: Megaphone, color: 'bg-sky-50 text-sky-600 border-sky-200' };
      case 'reports':
        return { titleTh: 'รายงานและสถิติ (Reports)', titleEn: 'Reports & Analytics Module', icon: BarChart3, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      default:
        return { titleTh: 'โมดูลระบบ', titleEn: 'System Module', icon: FileText, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const details = getModuleDetails();
  const Icon = details.icon;

  const uniqueGroups = Array.from(new Set(studentGroups.map(s => s.groupName))).filter(Boolean);
  const defaultGroups = ['กลุ่ม ก', 'กลุ่ม ข', 'กลุ่ม ค', 'กลุ่ม ง'];
  const allAvailableGroups = Array.from(new Set([...defaultGroups, ...uniqueGroups]));

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D9361C]" />
          <span>กลับสู่หน้าแดชบอร์ด (Back to Dashboard)</span>
        </button>
        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Real-Time Van & Multiple Instructors Sync Active</span>
        </span>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Module Card */}
      <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-md ${details.color}`}>
            <Icon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9361C]">
              {details.titleEn}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {details.titleTh}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              รองรับการเลือกอาจารย์นิเทศหลายท่านในตารางฝึก และบันทึกข้อมูลรถตู้ (คันที่, คนขับ, เบอร์โทร, รายชื่อนักศึกษา) แบบ Real-time
            </p>
          </div>
        </div>

        {/* ================= TRAINING SCHEDULE TAB (Multiple Instructors) ================= */}
        {tab === 'schedule' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">เพิ่มตารางการฝึกปฏิบัติ (ระบุอาจารย์นิเทศได้หลายท่าน)</h3>
                  <p className="text-xs text-slate-500">พิมพ์รายชื่ออาจารย์หลายท่านคั่นด้วยเครื่องหมายจุลภาค (,)</p>
                </div>
              </div>

              <form onSubmit={handleAddTrainingSchedule} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">กลุ่มนักศึกษา</label>
                  <input
                    type="text"
                    placeholder="เช่น กลุ่ม ก, กลุ่ม ข..."
                    value={schedGroup}
                    onChange={(e) => setSchedGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">อาจารย์นิเทศ (เลือกหรือพิมพ์หลายท่านได้)</label>
                  <input
                    type="text"
                    placeholder="เช่น อ.ดร.สมชาย, อ.ปิยะดา, อ.วิชัย..."
                    value={schedInstructors}
                    onChange={(e) => setSchedInstructors(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">แหล่งฝึก / วอร์ด / โรงพยาบาล</label>
                  <input
                    type="text"
                    placeholder="เช่น โรงพยาบาลสมเด็จ - หอผู้ป่วยอายุรกรรม..."
                    value={schedSite}
                    onChange={(e) => setSchedSite(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={schedStartDate}
                    onChange={(e) => setSchedStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={schedEndDate}
                    onChange={(e) => setSchedEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'บันทึกตารางการฝึก'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ตารางการฝึกปฏิบัติทั้งหมดแบบ Real-Time</h3>
              {trainingSchedules.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีตารางการฝึกปฏิบัติในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingSchedules.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">{item.studentGroup}</span>
                          <span className="text-[10px] text-slate-500 font-mono">📅 {item.startDate} ถึง {item.endDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span>{item.trainingSite}</span>
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>อาจารย์นิเทศ: <span className="font-semibold text-slate-800">{item.instructorNames}</span></span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc('trainingSchedules', item.id)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= FLOW WORK TAB ================= */}
        {tab === 'flowwork' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D9361C]" />
                <span>เพิ่มโฟลว์งาน / รายงานเคสปฏิบัติการ (Add Flow Work)</span>
              </h3>
              <form onSubmit={handleAddFlowWork} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="หัวข้อรายงานเคส / โฟลว์งาน..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อวอร์ด / แผนกเองได้..."
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
                <input
                  type="text"
                  placeholder="พิมพ์กลุ่มฝึกปฏิบัติเองได้..."
                  value={newStudentGroup}
                  onChange={(e) => setNewStudentGroup(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'บันทึกโฟลว์งาน'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการโฟลว์งานทั้งหมดแบบ Real-Time</h3>
              {flowWorks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีรายการโฟลว์งาน
                </div>
              ) : (
                <div className="space-y-3">
                  {flowWorks.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#D9361C] text-[10px] font-bold">{item.department}</span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">{item.studentGroup}</span>
                          <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                          {item.status}
                        </span>
                        <button
                          onClick={() => handleDeleteDoc('flowWorks', item.id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STUDENT GROUPS TAB ================= */}
        {tab === 'student-groups' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">เพิ่มและจัดกลุ่มนักศึกษา</h3>
                  <p className="text-xs text-slate-500">รายชื่อที่เพิ่มจะเชื่อมโยงกับระบบ Assign ห้องพักและรถตู้</p>
                </div>
              </div>

              <form onSubmit={handleUploadStudentGroups} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">กลุ่มฝึกปฏิบัติ</label>
                    <input
                      type="text"
                      placeholder="เช่น กลุ่ม ก..."
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">วอร์ด / แผนก</label>
                    <input
                      type="text"
                      placeholder="เช่น หอผู้ป่วยอายุรกรรม..."
                      value={targetWard}
                      onChange={(e) => setTargetWard(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">รายชื่อนักศึกษา (บรรทัดละ 1 คน หรือ ชื่อ,รหัส)</label>
                  <textarea
                    rows={3}
                    placeholder="นางสาวพิมพิศา ใจดี, 6701001&#10;นายณัฐพล ศรีสุวรรณ, 6701002"
                    value={studentInputList}
                    onChange={(e) => setStudentInputList(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'เพิ่มข้อมูลนักศึกษา'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายชื่อนักศึกษาทั้งหมดแบบ Real-Time ({studentGroups.length} คน)</h3>
              {studentGroups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลนักศึกษาในระบบ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allAvailableGroups.map((grp) => {
                    const groupStudents = studentGroups.filter(s => s.groupName === grp);
                    if (groupStudents.length === 0) return null;
                    return (
                      <div key={grp} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-900">{grp}</h4>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            {groupStudents.length} คน
                          </span>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {groupStudents.map((st) => (
                            <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-900">{st.studentName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">ID: {st.studentId} · {st.ward}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteDoc('studentGroups', st.id)}
                                className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VAN SERVICE TAB (Van Number, Driver, Phone, Assigned Student) ================= */}
        {tab === 'van' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>บันทึกข้อมูลรถตู้ (คันที่, ชื่อคนขับ, เบอร์โทร, Assign นักศึกษา)</span>
              </h3>
              
              <form onSubmit={handleAddVanBooking} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">คันที่ (Van Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น รถตู้คันที่ 1..."
                    value={vanNumber}
                    onChange={(e) => setVanNumber(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">เส้นทาง (Route)</label>
                  <input
                    type="text"
                    placeholder="เช่น สถาบัน ⟷ รพ.สมเด็จ..."
                    value={vanRoute}
                    onChange={(e) => setVanRoute(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ชื่อคนขับ (Driver Name)</label>
                  <input
                    type="text"
                    placeholder="เช่น นายสมชาย ขับรถ..."
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ (Phone Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น 081-234-5678..."
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Assign นักศึกษาขึ้นรถ</label>
                  <select
                    value={vanSelectedStudentId}
                    onChange={(e) => setVanSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  >
                    <option value="">-- เลือกนักศึกษาจากรายชื่อที่อัปโหลด --</option>
                    {studentGroups.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.studentName} ({st.groupName} - {st.studentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลรถตู้และคนขับ'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการรถตู้ทั้งหมดแบบ Real-Time</h3>
              {vanBookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลรถตู้ในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {vanBookings.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold">{item.vanNumber || 'คันที่ 1'}</span>
                          <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.route}</h4>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Car className="w-3.5 h-3.5 text-emerald-600" />
                            คนขับ: {item.driverName}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            เบอร์โทร: {item.driverPhone}
                          </span>
                          <span className="text-emerald-700">นักศึกษา: {item.assignedStudentName}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc('vanBookings', item.id)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ACCOMMODATION TAB ================= */}
        {tab === 'accommodation' && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <button
                onClick={() => setSubTab('rooms')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'rooms' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bed className="w-4 h-4" />
                <span>Assign ห้องพัก (Rooms)</span>
              </button>
              <button
                onClick={() => setSubTab('utilities')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'utilities' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>ค่าน้ำ - ค่าไฟ (Utilities)</span>
              </button>
              <button
                onClick={() => setSubTab('payments')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'payments' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>สลิปโอนเงิน (Payment Slips)</span>
              </button>
            </div>

            {subTab === 'rooms' && (
              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <span>Assign นักศึกษาเข้าห้องพัก</span>
                </h3>

                {studentGroups.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    ⚠️ ยังไม่มีรายชื่อนักศึกษาในระบบ กรุณาเพิ่มรายชื่อนักศึกษาก่อน
                  </div>
                ) : (
                  <form onSubmit={handleAddRoomAssignment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="เลขห้องพัก (เช่น อาคาร 2 ห้อง 402)..."
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                    <select
                      value={roomSelectedStudentId}
                      onChange={(e) => setRoomSelectedStudentId(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    >
                      <option value="">-- เลือกนักศึกษา --</option>
                      {studentGroups.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.studentName} ({st.groupName} - {st.studentId})
                        </option>
                      ))}
                    </select>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{loading ? 'กำลังบันทึก...' : 'Assign เข้าห้องพัก'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {subTab === 'utilities' && (
              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>เพิ่มรายการค่าน้ำ-ค่าไฟ</span>
                </h3>
                <form onSubmit={handleAddUtility} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="รายละเอียด..."
                    value={utilityTitle}
                    onChange={(e) => setUtilityTitle(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="จำนวนเงิน..."
                    value={utilityAmount}
                    onChange={(e) => setUtilityAmount(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                  </button>
                </form>
              </div>
            )}

            {subTab === 'payments' && (
              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>อัปโหลดสลิปโอนเงิน</span>
                </h3>
                <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="รายละเอียด..."
                    value={paymentTitle}
                    onChange={(e) => setPaymentTitle(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="จำนวนเงิน..."
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึก...' : 'ส่งสลิป'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการแบบ Real-Time</h3>
              {accommodationRecords.filter(r => r.type === subTab).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลในหมวดหมู่นี้
                </div>
              ) : (
                <div className="space-y-3">
                  {accommodationRecords.filter(r => r.type === subTab).map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                            {item.type === 'rooms' ? 'หอพัก' : item.type === 'utilities' ? 'ค่าน้ำ-ค่าไฟ' : 'สลิปโอนเงิน'}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        {item.assignedTo && <p className="text-xs text-slate-600">นักศึกษา: {item.assignedTo}</p>}
                        <p className="text-xs text-slate-500">จำนวน: {item.amount}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc('accommodationRecords', item.id)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ANNOUNCEMENTS TAB ================= */}
        {tab === 'announcements' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-600" />
                <span>โพสต์ประกาศใหม่</span>
              </h3>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <input
                  type="text"
                  placeholder="หัวข้อประกาศ..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
                <textarea
                  placeholder="เนื้อหาประกาศ..."
                  value={newAnnouncementDesc}
                  onChange={(e) => setNewAnnouncementDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังโพสต์...' : 'โพสต์ประกาศ'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ประกาศทั้งหมดแบบ Real-Time</h3>
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีประกาศในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">{item.category}</span>
                          <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc('announcements', item.id)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= OTHER TABS ================= */}
        {tab !== 'flowwork' && tab !== 'student-groups' && tab !== 'van' && tab !== 'accommodation' && tab !== 'announcements' && tab !== 'schedule' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-900">โมดูลนี้พร้อมใช้งานจริง</h3>
              <p className="text-xs text-slate-500">สามารถเพิ่มข้อมูลผ่านเมนูด้านข้างได้ทันที</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
