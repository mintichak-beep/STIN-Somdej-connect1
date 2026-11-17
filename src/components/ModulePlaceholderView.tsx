import React, { useState, useEffect } from 'react';
import { NavTab, UserRole } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
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
  Car,
  BookOpen,
  Pencil,
  Save,
  X,
  Search,
  CheckSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const THAI_WEEKDAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return new Date(y, m - 1, d);
}

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

function parseNumericAmount(val?: string | number): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (!val || typeof val !== 'string') return 0;
  const cleaned = val.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return cleaned ? parseFloat(cleaned[0]) : 0;
}

const SCHEDULE_COLOR_PALETTES = [
  'bg-blue-50 border-blue-300 text-blue-950',
  'bg-[#FFF3EE] border-red-300 text-red-950',
  'bg-emerald-50 border-emerald-300 text-emerald-950',
  'bg-amber-50 border-amber-300 text-amber-950',
  'bg-indigo-50 border-indigo-300 text-indigo-950',
  'bg-teal-50 border-teal-300 text-teal-950',
  'bg-rose-50 border-rose-300 text-rose-950',
  'bg-sky-50 border-sky-300 text-sky-950',
];

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
}) => {
  const [subTab, setSubTab] = useState<'rooms' | 'utilities' | 'payments'>('rooms');

  // Real-time state collections (strictly zero mock data)
  const [flowWorks, setFlowWorks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [vanBookings, setVanBookings] = useState<any[]>([]);
  const [studentGroups, setStudentGroups] = useState<any[]>([]);
  const [accommodationRecords, setAccommodationRecords] = useState<any[]>([]);
  const [trainingSchedules, setTrainingSchedules] = useState<any[]>([]);

  // Announcement form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('ประกาศด่วน (Urgent)');
  const [newAnnouncementDesc, setNewAnnouncementDesc] = useState('');

  // Flow work instructor submission states
  const [flowCourse, setFlowCourse] = useState('ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ');
  const [flowInstructor, setFlowInstructor] = useState('');
  const [flowTitle, setFlowTitle] = useState('');
  const [flowDepartment, setFlowDepartment] = useState('หอผู้ป่วยอายุรกรรม');
  const [flowStudentGroup, setFlowStudentGroup] = useState('กลุ่ม ก');

  // Van assignment form states (multi-student support)
  const [vanRoute, setVanRoute] = useState('สถาบัน ⟷ โรงพยาบาลสมเด็จ');
  const [vanDirection, setVanDirection] = useState('ขาไป (Outbound)');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [vanTimeSlot, setVanTimeSlot] = useState('08:00 น.');
  const [vanReturnTimeSlot, setVanReturnTimeSlot] = useState('16:00 น.');
  const [vanDate, setVanDate] = useState('');
  const [vanNumber, setVanNumber] = useState('คันที่ 1');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vanSelectedStudentIds, setVanSelectedStudentIds] = useState<string[]>([]);
  const [vanStudentGroupFilter, setVanStudentGroupFilter] = useState<string>('ALL');
  const [vanStudentSearch, setVanStudentSearch] = useState<string>('');

  // Student Group Upload states
  const [studentInputList, setStudentInputList] = useState('');
  const [targetGroup, setTargetGroup] = useState('กลุ่ม ก');
  const [targetWard, setTargetWard] = useState('หอผู้ป่วยอายุรกรรม');

  // Training Schedule form states (with Course Name / Subject)
  const [schedCourse, setSchedCourse] = useState('ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ');
  const [schedGroup, setSchedGroup] = useState('กลุ่ม ก');
  const [schedInstructors, setSchedInstructors] = useState('');
  const [schedSite, setSchedSite] = useState('โรงพยาบาลสมเด็จ - หอผู้ป่วยอายุรกรรม');
  const [schedStartDate, setSchedStartDate] = useState('');
  const [schedEndDate, setSchedEndDate] = useState('');

  // Training Schedule weekly calendar state & detail modal
  const [scheduleWeekStart, setScheduleWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [selectedCalendarSchedule, setSelectedCalendarSchedule] = useState<{
    sched: any;
    dayLabel: string;
    palette: string;
  } | null>(null);

  // Accommodation & Room Assignment form states (multi-student + dates support)
  const [roomNumber, setRoomNumber] = useState('');
  const [roomCheckInDate, setRoomCheckInDate] = useState('');
  const [roomCheckOutDate, setRoomCheckOutDate] = useState('');
  const [roomSelectedStudentIds, setRoomSelectedStudentIds] = useState<string[]>([]);
  const [roomStudentGroupFilter, setRoomStudentGroupFilter] = useState<string>('ALL');
  const [roomStudentSearch, setRoomStudentSearch] = useState<string>('');
  const [utilityTitle, setUtilityTitle] = useState('');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Generic inline editing states
  const [editingTarget, setEditingTarget] = useState<{ collection: string; id: string } | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => {
    setErrorMsg('');
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Setup real-time listeners co-actively
  useEffect(() => {
    const unsubFlow = onSnapshot(
      query(collection(db, 'flowWorks')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setFlowWorks(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'flowWorks')
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

    const unsubVan = onSnapshot(
      query(collection(db, 'vanBookings')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setVanBookings(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'vanBookings')
    );

    const unsubSt = onSnapshot(
      query(collection(db, 'studentGroups')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setStudentGroups(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'studentGroups')
    );

    const unsubAcc = onSnapshot(
      query(collection(db, 'accommodationRecords')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setAccommodationRecords(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'accommodationRecords')
    );

    const unsubSched = onSnapshot(
      query(collection(db, 'trainingSchedules')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setTrainingSchedules(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'trainingSchedules')
    );

    return () => {
      unsubFlow();
      unsubAnn();
      unsubVan();
      unsubSt();
      unsubAcc();
      unsubSched();
    };
  }, []);

  // Reset editing state when switching tabs
  useEffect(() => {
    setEditingTarget(null);
    setEditForm({});
  }, [tab, subTab]);

  // Helper to toggle student selection in array
  const toggleStudentInArray = (studentId: string, currentList: string[], setter: (next: string[]) => void) => {
    if (currentList.includes(studentId)) {
      setter(currentList.filter((id) => id !== studentId));
    } else {
      setter([...currentList, studentId]);
    }
  };

  // Handlers for adding data
  const handleAddFlowWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowTitle.trim() || !flowCourse.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'flowWorks'), {
        courseName: flowCourse.trim(),
        instructorName: flowInstructor.trim() || 'อาจารย์ประจำรายวิชา',
        title: flowTitle.trim(),
        department: flowDepartment.trim() || 'ทั่วไป',
        studentGroup: flowStudentGroup.trim() || 'กลุ่มทั่วไป',
        status: 'รอตรวจทานโดยประธานหลักสูตร (Pending Review)',
        feedback: '',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setFlowTitle('');
      showSuccess('ส่งข้อมูลและเอกสารของรายวิชาเข้าสู่ระบบสำเร็จ');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'flowWorks');
      showError('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
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
        title: newTitle.trim(),
        description: newAnnouncementDesc.trim(),
        category: newCategory,
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setNewTitle('');
      setNewAnnouncementDesc('');
      showSuccess('โพสต์ประกาศสำเร็จ ทุกคนเห็นทันทีแบบ Real-time');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
      showError('ไม่สามารถโพสต์ประกาศได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainingSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCourse.trim() || !schedInstructors.trim() || !schedStartDate || !schedEndDate) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'trainingSchedules'), {
        courseName: schedCourse.trim(),
        studentGroup: schedGroup.trim() || 'กลุ่ม ก',
        instructorNames: schedInstructors.trim(),
        trainingSite: schedSite.trim() || 'โรงพยาบาลสมเด็จ',
        startDate: schedStartDate,
        endDate: schedEndDate,
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setSchedInstructors('');
      setSchedStartDate('');
      setSchedEndDate('');
      showSuccess('บันทึกตารางการฝึกปฏิบัติ (แยกตามรายวิชา) สำเร็จ');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trainingSchedules');
      showError('ไม่สามารถบันทึกตารางการฝึกปฏิบัติได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVanBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vanRoute.trim() || vanSelectedStudentIds.length === 0 || !driverName.trim() || !vanDate) {
      if (vanSelectedStudentIds.length === 0) {
        showError('กรุณาเลือกนักศึกษาขึ้นรถอย่างน้อย 1 คน');
      }
      return;
    }
    setLoading(true);
    try {
      const selectedStudents = studentGroups.filter((s) => vanSelectedStudentIds.includes(s.id));
      const studentDisplayNames = selectedStudents.map((s) => `${s.studentName} (${s.groupName})`);
      const joinedDisplay = studentDisplayNames.join(', ');

      const basePayload = {
        route: vanRoute.trim(),
        date: vanDate,
        vanNumber: vanNumber.trim() || 'คันที่ 1',
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || 'ไม่ระบุ',
        assignedStudentId: vanSelectedStudentIds[0] || '',
        assignedStudentIds: vanSelectedStudentIds,
        assignedStudentNames: studentDisplayNames,
        assignedStudentName: joinedDisplay,
        status: 'ยืนยันแล้ว (Confirmed)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      if (isRoundTrip) {
        await addDoc(collection(db, 'vanBookings'), {
          ...basePayload,
          direction: 'ขาไป (Outbound)',
          timeSlot: vanTimeSlot,
        });
        await addDoc(collection(db, 'vanBookings'), {
          ...basePayload,
          direction: 'ขากลับ (Inbound)',
          timeSlot: vanReturnTimeSlot || '16:00 น.',
        });
        showSuccess(`บันทึกข้อมูลรถตู้รอบไป-กลับคันเดียวกันสำเร็จ (นักศึกษา ${selectedStudents.length} คน)`);
      } else {
        await addDoc(collection(db, 'vanBookings'), {
          ...basePayload,
          direction: vanDirection,
          timeSlot: vanTimeSlot,
        });
        showSuccess(`บันทึกข้อมูลรถตู้สำเร็จ (นักศึกษา ${selectedStudents.length} คน)`);
      }

      setDriverName('');
      setDriverPhone('');
      setVanSelectedStudentIds([]);
      setVanDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'vanBookings');
      showError('ไม่สามารถบันทึกข้อมูลรถตู้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStudentGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInputList.trim()) return;
    setLoading(true);
    try {
      const lines = studentInputList.split('\n').filter((l) => l.trim() !== '');
      for (const line of lines) {
        const parts = line.split(/[,\t]/);
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
      showSuccess(`เพิ่มรายชื่อนักศึกษา ${lines.length} คนสำเร็จ`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'studentGroups');
      showError('ไม่สามารถเพิ่มรายชื่อนักศึกษาได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (text) {
        setStudentInputList((prev) => (prev ? `${prev}\n${text.trim()}` : text.trim()));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddRoomAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !roomCheckInDate || roomSelectedStudentIds.length === 0) {
      if (!roomCheckInDate) {
        showError('กรุณาระบุวันที่เข้าพัก');
      } else if (roomSelectedStudentIds.length === 0) {
        showError('กรุณาเลือกนักศึกษาเข้าห้องพักอย่างน้อย 1 คน');
      }
      return;
    }
    setLoading(true);
    try {
      const selectedStudents = studentGroups.filter((s) => roomSelectedStudentIds.includes(s.id));
      const studentDisplayList = selectedStudents.map(
        (s) => `${s.studentName} (${s.groupName} - ID: ${s.studentId})`
      );
      const joinedDisplay = studentDisplayList.join(', ');

      await addDoc(collection(db, 'accommodationRecords'), {
        type: 'rooms',
        title: `ห้องพัก: ${roomNumber.trim()}`,
        assignedStudentId: roomSelectedStudentIds[0] || '',
        assignedStudentIds: roomSelectedStudentIds,
        assignedToList: studentDisplayList,
        assignedTo: joinedDisplay,
        checkInDate: roomCheckInDate,
        checkOutDate: roomCheckOutDate || '',
        amount: 'หอพักสถาบัน / รพ.สมเด็จ',
        status: 'เข้าพักแล้ว (Occupied)',
        createdAt: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
      setRoomNumber('');
      setRoomCheckInDate('');
      setRoomCheckOutDate('');
      setRoomSelectedStudentIds([]);
      showSuccess(`Assign นักศึกษา ${selectedStudents.length} คน เข้าห้องพักสำเร็จ`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accommodationRecords');
      showError('ไม่สามารถ Assign ห้องพักได้');
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
      showSuccess('บันทึกค่าน้ำ-ค่าไฟสำเร็จ');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accommodationRecords');
      showError('ไม่สามารถบันทึกค่าน้ำ-ค่าไฟได้');
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
      showSuccess('อัปโหลดสลิปโอนเงินสำเร็จ เจ้าหน้าที่จะทำการตรวจสอบ');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accommodationRecords');
      showError('ไม่สามารถอัปโหลดสลิปได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (editingTarget?.collection === collectionName && editingTarget?.id === id) {
        setEditingTarget(null);
        setEditForm({});
      }
      showSuccess('ลบข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      showError('ไม่สามารถลบข้อมูลได้');
    }
  };

  // ================= EDIT HANDLERS =================
  const startEditing = (collectionName: string, item: any) => {
    setEditingTarget({ collection: collectionName, id: item.id });

    if (collectionName === 'vanBookings') {
      const initialIds: string[] = Array.isArray(item.assignedStudentIds)
        ? item.assignedStudentIds
        : item.assignedStudentId
        ? [item.assignedStudentId]
        : [];
      setEditForm({
        direction: item.direction || 'ขาไป (Outbound)',
        vanNumber: item.vanNumber || '',
        date: item.date || '',
        timeSlot: item.timeSlot || '',
        route: item.route || 'สถาบัน ⟷ โรงพยาบาลสมเด็จ',
        driverName: item.driverName || '',
        driverPhone: item.driverPhone || '',
        status: item.status || 'ยืนยันแล้ว (Confirmed)',
        assignedStudentIds: initialIds,
      });
    } else if (collectionName === 'trainingSchedules') {
      setEditForm({
        courseName: item.courseName || '',
        studentGroup: item.studentGroup || '',
        instructorNames: item.instructorNames || '',
        trainingSite: item.trainingSite || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
      });
    } else if (collectionName === 'flowWorks') {
      setEditForm({
        courseName: item.courseName || '',
        instructorName: item.instructorName || '',
        studentGroup: item.studentGroup || '',
        department: item.department || '',
        title: item.title || '',
        status: item.status || 'รอตรวจทานโดยประธานหลักสูตร (Pending Review)',
        feedback: item.feedback || '',
      });
    } else if (collectionName === 'studentGroups') {
      setEditForm({
        studentName: item.studentName || '',
        studentId: item.studentId || '',
        groupName: item.groupName || '',
        ward: item.ward || '',
      });
    } else if (collectionName === 'accommodationRecords') {
      const initialRoomIds: string[] = Array.isArray(item.assignedStudentIds) && item.assignedStudentIds.length > 0
        ? item.assignedStudentIds
        : item.assignedStudentId
        ? [item.assignedStudentId]
        : [];
      setEditForm({
        type: item.type || 'rooms',
        title: item.title || '',
        assignedStudentId: item.assignedStudentId || '',
        assignedStudentIds: initialRoomIds,
        assignedTo: item.assignedTo || '',
        checkInDate: item.checkInDate || '',
        checkOutDate: item.checkOutDate || '',
        amount: item.amount || '',
        status: item.status || '',
      });
    } else if (collectionName === 'announcements') {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'ประกาศด่วน (Urgent)',
      });
    }
  };

  const cancelEditing = () => {
    setEditingTarget(null);
    setEditForm({});
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;
    const { collection: colName, id } = editingTarget;
    setLoading(true);

    try {
      let updatePayload: any = { ...editForm };

      if (colName === 'vanBookings') {
        const selectedIds: string[] = Array.isArray(editForm.assignedStudentIds) ? editForm.assignedStudentIds : [];
        const selectedStudents = studentGroups.filter((s) => selectedIds.includes(s.id));
        const studentDisplayNames = selectedStudents.map((s) => `${s.studentName} (${s.groupName})`);
        updatePayload = {
          direction: editForm.direction,
          vanNumber: editForm.vanNumber?.trim() || 'คันที่ 1',
          date: editForm.date,
          timeSlot: editForm.timeSlot?.trim() || '',
          route: editForm.route?.trim() || 'สถาบัน ⟷ โรงพยาบาลสมเด็จ',
          driverName: editForm.driverName?.trim() || '',
          driverPhone: editForm.driverPhone?.trim() || 'ไม่ระบุ',
          status: editForm.status || 'ยืนยันแล้ว (Confirmed)',
          assignedStudentId: selectedIds[0] || '',
          assignedStudentIds: selectedIds,
          assignedStudentNames: studentDisplayNames,
          assignedStudentName: studentDisplayNames.join(', '),
        };
      } else if (colName === 'accommodationRecords' && editForm.type === 'rooms') {
        const selectedIds: string[] = Array.isArray(editForm.assignedStudentIds) ? editForm.assignedStudentIds : [];
        const selectedStudents = studentGroups.filter((s) => selectedIds.includes(s.id));
        const assignedToList = selectedStudents.map(
          (s) => `${s.studentName} (${s.groupName} - ID: ${s.studentId})`
        );
        const assignedToDisplay = assignedToList.length > 0 ? assignedToList.join(', ') : editForm.assignedTo || '';
        updatePayload = {
          title: editForm.title?.trim() || '',
          assignedStudentId: selectedIds[0] || '',
          assignedStudentIds: selectedIds,
          assignedToList,
          assignedTo: assignedToDisplay,
          checkInDate: editForm.checkInDate || '',
          checkOutDate: editForm.checkOutDate || '',
          amount: editForm.amount?.trim() || '',
          status: editForm.status || 'เข้าพักแล้ว (Occupied)',
        };
      } else if (colName === 'accommodationRecords') {
        updatePayload = {
          title: editForm.title?.trim() || '',
          amount: editForm.amount?.trim() || '',
          status: editForm.status || '',
        };
      }

      await updateDoc(doc(db, colName, id), updatePayload);
      setEditingTarget(null);
      setEditForm({});
      showSuccess('บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว (Real-time sync)');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${colName}/${id}`);
      showError('ไม่สามารถบันทึกการแก้ไขได้');
    } finally {
      setLoading(false);
    }
  };

  const getModuleDetails = () => {
    switch (tab) {
      case 'schedule':
        return { titleTh: 'ตารางการฝึกปฏิบัติแยกตามรายวิชา', titleEn: 'Training Schedule Module', icon: Calendar, color: 'bg-[#E3F2FD] text-[#3B82F6] border-sky-200' };
      case 'flowwork':
        return { titleTh: 'โฟลว์งานรายวิชา (Flow Work)', titleEn: 'Flow Work Module', icon: FileText, color: 'bg-[#FFF3EE] text-[#D9361C] border-orange-200' };
      case 'student-groups':
        return { titleTh: 'กลุ่มนักศึกษาและการจัดกลุ่ม', titleEn: 'Student Groups Module', icon: Users, color: 'bg-[#E3F2FD] text-[#3B82F6] border-sky-200' };
      case 'van':
        return { titleTh: 'บริการรถตู้รับส่งและข้อมูลคนขับ', titleEn: 'Van Transportation Module', icon: Bus, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'accommodation':
        return { titleTh: 'หอพัก ค่าน้ำ-ค่าไฟ และสลิปโอนเงิน', titleEn: 'Rooms, Utilities & Payment Slips Module', icon: Bed, color: 'bg-[#FFF3EE] text-[#D9361C] border-orange-200' };
      case 'announcements':
        return { titleTh: 'ประกาศ / ข่าวสาร', titleEn: 'Announcements Module', icon: Megaphone, color: 'bg-[#E3F2FD] text-[#3B82F6] border-sky-200' };
      case 'reports':
        return { titleTh: 'รายงานและสถิติ', titleEn: 'Reports & Analytics Module', icon: BarChart3, color: 'bg-[#E3F2FD] text-[#3B82F6] border-sky-200' };
      default:
        return { titleTh: 'โมดูลระบบ', titleEn: 'System Module', icon: FileText, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const details = getModuleDetails();
  const Icon = details.icon;

  const uniqueGroups = Array.from(new Set(studentGroups.map((s) => s.groupName))).filter(Boolean);
  const defaultGroups = ['กลุ่ม ก', 'กลุ่ม ข', 'กลุ่ม ค', 'กลุ่ม ง'];
  const allAvailableGroups = Array.from(new Set([...defaultGroups, ...uniqueGroups]));

  // Filtered students for multi-select checklist in Van form
  const filteredVanStudents = studentGroups.filter((st) => {
    const matchesGroup = vanStudentGroupFilter === 'ALL' || st.groupName === vanStudentGroupFilter;
    const q = vanStudentSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      st.studentName?.toLowerCase().includes(q) ||
      st.studentId?.toLowerCase().includes(q) ||
      st.groupName?.toLowerCase().includes(q) ||
      st.ward?.toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  // Filtered students for multi-select checklist in Room Assignment form
  const filteredRoomStudents = studentGroups.filter((st) => {
    const matchesGroup = roomStudentGroupFilter === 'ALL' || st.groupName === roomStudentGroupFilter;
    const q = roomStudentSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      st.studentName?.toLowerCase().includes(q) ||
      st.studentId?.toLowerCase().includes(q) ||
      st.groupName?.toLowerCase().includes(q) ||
      st.ward?.toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  // ================= LIVE OVERVIEW SUMMARIES (ZERO MOCK DATA) =================
  // 1. Schedule & Weekly Calendar summary
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(scheduleWeekStart, i));
  const weekStartIso = formatIsoDate(weekDays[0]);
  const weekEndIso = formatIsoDate(weekDays[6]);
  const todayIso = formatIsoDate(new Date());

  const schedulesInWeek = trainingSchedules.filter((item) => {
    if (!item.startDate && !item.endDate) return false;
    const s = item.startDate || item.endDate;
    const e = item.endDate || item.startDate;
    return s <= weekEndIso && e >= weekStartIso;
  });

  const uniqueSchedCourses = Array.from(new Set(trainingSchedules.map((s) => s.courseName).filter(Boolean)));
  const uniqueSchedSites = Array.from(new Set(trainingSchedules.map((s) => s.trainingSite).filter(Boolean)));
  const uniqueSchedGroups = Array.from(new Set(trainingSchedules.map((s) => s.studentGroup).filter(Boolean)));

  const sortedScheduleStarts = trainingSchedules
    .map((s) => s.startDate)
    .filter((d): d is string => Boolean(parseLocalDate(d)))
    .sort();
  const earliestScheduleStartDate = sortedScheduleStarts.length > 0 ? parseLocalDate(sortedScheduleStarts[0]) : null;

  // 2. Flow Work summary
  const flowPendingCount = flowWorks.filter(
    (f) => f.status?.includes('รอตรวจทาน') || f.status?.includes('กำลังตรวจทาน')
  ).length;
  const flowApprovedCount = flowWorks.filter(
    (f) => f.status?.includes('ผ่านการตรวจทาน') || f.status?.includes('Approved')
  ).length;
  const flowRevisionCount = flowWorks.filter(
    (f) => f.status?.includes('ส่งกลับแก้ไข') || f.status?.includes('Revision')
  ).length;
  const flowCourseCounts = flowWorks.reduce<Record<string, number>>((acc, item) => {
    const key = item.courseName || 'รายวิชาทั่วไป';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 3. Student Groups summary
  const uniqueWards = Array.from(new Set(studentGroups.map((s) => s.ward).filter(Boolean)));
  const wardCounts = studentGroups.reduce<Record<string, number>>((acc, st) => {
    const w = st.ward || 'ไม่ระบุวอร์ด';
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});
  const assignedStudentIdSet = new Set<string>();
  vanBookings.forEach((v) => {
    if (Array.isArray(v.assignedStudentIds)) {
      v.assignedStudentIds.forEach((id: string) => assignedStudentIdSet.add(id));
    } else if (v.assignedStudentId) {
      assignedStudentIdSet.add(v.assignedStudentId);
    }
  });
  accommodationRecords
    .filter((r) => r.type === 'rooms')
    .forEach((r) => {
      if (Array.isArray(r.assignedStudentIds)) {
        r.assignedStudentIds.forEach((id: string) => assignedStudentIdSet.add(id));
      } else if (r.assignedStudentId) {
        assignedStudentIdSet.add(r.assignedStudentId);
      }
    });

  // 4. Van Transportation summary
  const vanOutboundCount = vanBookings.filter((v) => v.direction?.includes('ขาไป')).length;
  const vanInboundCount = vanBookings.filter((v) => v.direction?.includes('ขากลับ')).length;
  const vanStatsMap = vanBookings.reduce<Record<string, { trips: number; seats: number }>>((acc, v) => {
    const key = v.vanNumber || 'ไม่ระบุคัน';
    const seats = Array.isArray(v.assignedStudentNames) && v.assignedStudentNames.length > 0
      ? v.assignedStudentNames.length
      : v.assignedStudentName
      ? v.assignedStudentName.split(',').filter((x: string) => x.trim()).length
      : 0;
    if (!acc[key]) acc[key] = { trips: 0, seats: 0 };
    acc[key].trips += 1;
    acc[key].seats += seats;
    return acc;
  }, {});
  const totalVanPassengers = Object.values(vanStatsMap).reduce((sum, x) => sum + x.seats, 0);

  // 5. Accommodation & Billing summary
  const roomRecords = accommodationRecords.filter((r) => r.type === 'rooms');
  const utilityRecords = accommodationRecords.filter((r) => r.type === 'utilities');
  const paymentRecords = accommodationRecords.filter((r) => r.type === 'payments');

  const getRoomOccupants = (item: any): string[] => {
    if (Array.isArray(item.assignedToList) && item.assignedToList.length > 0) {
      return item.assignedToList;
    }
    if (item.assignedTo && typeof item.assignedTo === 'string') {
      return item.assignedTo.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };
  const totalRoomOccupants = roomRecords.reduce((sum, r) => sum + getRoomOccupants(r).length, 0);
  const utilityPendingRecords = utilityRecords.filter((u) => !u.status?.includes('ชำระแล้ว'));
  const utilityTotalBaht = utilityRecords.reduce((sum, u) => sum + parseNumericAmount(u.amount), 0);
  const utilityPendingBaht = utilityPendingRecords.reduce((sum, u) => sum + parseNumericAmount(u.amount), 0);
  const paymentPendingCount = paymentRecords.filter((p) => p.status?.includes('รอตรวจสอบ')).length;
  const paymentVerifiedCount = paymentRecords.filter((p) => p.status?.includes('ตรวจสอบแล้ว')).length;
  const paymentRejectedCount = paymentRecords.filter((p) => p.status?.includes('ไม่ถูกต้อง')).length;
  const paymentTotalBaht = paymentRecords.reduce((sum, p) => sum + parseNumericAmount(p.amount), 0);

  // 6. Announcements summary
  const annUrgentCount = announcements.filter((a) => a.category?.includes('ประกาศด่วน')).length;
  const annGeneralCount = announcements.filter((a) => a.category?.includes('ประกาศทั่วไป')).length;
  const annScheduleCount = announcements.filter((a) => a.category?.includes('ตารางฝึกปฏิบัติ')).length;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-sky-200 rounded-xl hover:bg-[#E3F2FD]/60 hover:text-[#D9361C] transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D9361C]" />
          <span>กลับสู่หน้าแดชบอร์ด</span>
        </button>
        <span className="text-xs font-semibold text-[#3B82F6] bg-white px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
          เชื่อมต่อฐานข้อมูลเรียลไทม์
        </span>
      </div>

      {/* Success & Error Banners */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <X className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Module Card */}
      <div className="bg-white rounded-3xl p-8 lg:p-12 border border-sky-100 shadow-md shadow-sky-950/5 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-sky-100">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-xs ${details.color}`}>
            <Icon className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9361C]">
              {details.titleEn}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {details.titleTh}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              STIN-Somdej connect · ระบบประสานงานแหล่งฝึกโรงพยาบาลสมเด็จฯ ณ ศรีราชา
            </p>
          </div>
        </div>

        {/* ================= TRAINING SCHEDULE TAB ================= */}
        {tab === 'schedule' && (
          <div className="space-y-8">
            {/* Overview Summary Strip */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <p className="text-[11px] font-semibold text-blue-700">ตารางฝึกทั้งหมด</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{trainingSchedules.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <p className="text-[11px] font-semibold text-indigo-700">รายวิชาที่เปิดฝึก</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{uniqueSchedCourses.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-emerald-700">ฝึกในสัปดาห์ที่เลือก</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{schedulesInWeek.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <p className="text-[11px] font-semibold text-amber-700">แหล่งฝึก / กลุ่มนักศึกษา</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                    {uniqueSchedSites.length} <span className="text-xs font-semibold text-slate-500">/ {uniqueSchedGroups.length} กลุ่ม</span>
                  </p>
                </div>
              </div>

              {uniqueSchedSites.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-[11px] font-bold text-slate-600">สีแยกตามแหล่งฝึก:</span>
                  {uniqueSchedSites.map((site, idx) => {
                    const count = trainingSchedules.filter((s) => s.trainingSite === site).length;
                    return (
                      <span
                        key={site}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${SCHEDULE_COLOR_PALETTES[idx % SCHEDULE_COLOR_PALETTES.length]}`}
                      >
                        🏥 {site} ({count})
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Overview Calendar */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#E3F2FD]/45 border border-sky-200/80 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-sky-200/70 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3B82F6]" />
                    <span>ปฏิทินภาพรวมตารางการฝึกปฏิบัติรายสัปดาห์</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ช่วงวันที่ {formatThaiShortDate(weekDays[0])} – {formatThaiShortDate(weekDays[6])} {weekDays[6].getFullYear() + 543} · แสดง {schedulesInWeek.length} ตารางในสัปดาห์นี้ (คลิกที่รายการเพื่อดูข้อความใหญ่)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleWeekStart((prev) => addDays(prev, -7))}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-sky-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>สัปดาห์ก่อนหน้า</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleWeekStart(getMondayOfWeek(new Date()))}
                    className="px-3 py-1.5 rounded-xl bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold shadow-2xs"
                  >
                    สัปดาห์นี้
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleWeekStart((prev) => addDays(prev, 7))}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-sky-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
                  >
                    <span>สัปดาห์ถัดไป</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {earliestScheduleStartDate && (
                    <button
                      type="button"
                      onClick={() => setScheduleWeekStart(getMondayOfWeek(earliestScheduleStartDate))}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF3EE] border border-orange-200 text-[#D9361C] text-xs font-semibold"
                    >
                      ไปยังสัปดาห์ที่มีตาราง
                    </button>
                  )}
                </div>
              </div>

              {uniqueSchedSites.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-sky-100">
                  <span className="text-[11px] font-bold text-slate-600">คำอธิบายสีแหล่งฝึก:</span>
                  {uniqueSchedSites.map((site, idx) => (
                    <span
                      key={`legend-${site}`}
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${SCHEDULE_COLOR_PALETTES[idx % SCHEDULE_COLOR_PALETTES.length]}`}
                    >
                      {site}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
                {weekDays.map((dayDate, dayIdx) => {
                  const dayIso = formatIsoDate(dayDate);
                  const isToday = dayIso === todayIso;
                  const daySchedules = trainingSchedules.filter((item) => {
                    if (!item.startDate && !item.endDate) return false;
                    const s = item.startDate || item.endDate;
                    const e = item.endDate || item.startDate;
                    return s <= dayIso && dayIso <= e;
                  });

                  return (
                    <div
                      key={dayIso}
                      className={`rounded-2xl border p-3 flex flex-col gap-2 min-h-[140px] transition-all ${
                        isToday
                          ? 'bg-white border-[#3B82F6] ring-2 ring-sky-200 shadow-xs'
                          : 'bg-white border-sky-100'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <p className={`text-[11px] font-bold ${isToday ? 'text-[#3B82F6]' : 'text-slate-600'}`}>
                            {THAI_WEEKDAYS[dayIdx]}
                          </p>
                          <p className={`text-xs font-extrabold ${isToday ? 'text-slate-900' : 'text-slate-900'}`}>
                            {formatThaiShortDate(dayDate)}
                          </p>
                        </div>
                        {daySchedules.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E3F2FD] text-[#3B82F6] text-[10px] font-bold tabular-nums">
                            {daySchedules.length}
                          </span>
                        )}
                      </div>

                      {daySchedules.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400 text-center py-4">
                          ไม่มีตารางฝึก
                        </div>
                      ) : (
                        <div className="space-y-1.5 overflow-y-auto max-h-52">
                          {daySchedules.map((sched) => {
                            const siteIdx = Math.max(0, uniqueSchedSites.indexOf(sched.trainingSite));
                            const palette = SCHEDULE_COLOR_PALETTES[siteIdx % SCHEDULE_COLOR_PALETTES.length];
                            const dayLabel = `วัน${THAI_WEEKDAYS[dayIdx]}ที่ ${formatThaiShortDate(dayDate)} ${dayDate.getFullYear() + 543}`;
                            return (
                              <button
                                key={`${dayIso}-${sched.id}`}
                                type="button"
                                onClick={() => setSelectedCalendarSchedule({ sched, dayLabel, palette })}
                                className={`w-full text-left p-2 rounded-xl border text-[10px] space-y-0.5 cursor-pointer hover:shadow-md hover:brightness-98 transition-all ${palette}`}
                                title="คลิกเพื่อดูรายละเอียดขนาดใหญ่"
                              >
                                <p className="font-extrabold leading-snug line-clamp-2">{sched.courseName}</p>
                                <p className="font-semibold opacity-90">👥 {sched.studentGroup}</p>
                                <p className="font-bold truncate">🏥 {sched.trainingSite}</p>
                                <p className="opacity-80 truncate">👩‍🏫 {sched.instructorNames}</p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {currentRole === 'student' ? (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                💡 มุมมองนักศึกษา: คุณสามารถตรวจสอบตารางการฝึกปฏิบัติ รายวิชา อาจารย์นิเทศ และแหล่งฝึกได้จากปฏิทินและรายการด้านล่าง
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">เพิ่มตารางการฝึกปฏิบัติ (แยกตามรายวิชา)</h3>
                    <p className="text-xs text-slate-500">ระบุชื่อรายวิชา กลุ่มนักศึกษา อาจารย์นิเทศ แหล่งฝึก และช่วงวันที่</p>
                  </div>
                </div>

                <form onSubmit={handleAddTrainingSchedule} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">รายวิชา (Course Name / Subject)</label>
                    <input
                      type="text"
                      placeholder="เช่น ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 1..."
                      value={schedCourse}
                      onChange={(e) => setSchedCourse(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">กลุ่มนักศึกษา</label>
                    <input
                      type="text"
                      placeholder="เช่น กลุ่ม ก..."
                      value={schedGroup}
                      onChange={(e) => setSchedGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">อาจารย์นิเทศ (หลายท่านคั่นด้วยจุลภาค)</label>
                    <input
                      type="text"
                      placeholder="เช่น อ.ดร.สมชาย, อ.ปิยะดา..."
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
                      <span>{loading ? 'กำลังบันทึก...' : 'บันทึกตารางการฝึกรายวิชา'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ตารางการฝึกปฏิบัติแยกตามรายวิชา ({trainingSchedules.length})</h3>
              {trainingSchedules.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีตารางการฝึกปฏิบัติในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingSchedules.map((item) => {
                    const isEditing = editingTarget?.collection === 'trainingSchedules' && editingTarget?.id === item.id;
                    if (isEditing) {
                      return (
                        <form key={item.id} onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-blue-50/70 border-2 border-blue-400 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                            <span className="text-xs font-bold text-blue-900">แก้ไขตารางการฝึกปฏิบัติ</span>
                            <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                              <X className="w-4 h-4" /> ยกเลิก
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">รายวิชา</label>
                              <input
                                type="text"
                                value={editForm.courseName}
                                onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">กลุ่มนักศึกษา</label>
                              <input
                                type="text"
                                value={editForm.studentGroup}
                                onChange={(e) => setEditForm({ ...editForm, studentGroup: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">อาจารย์นิเทศ</label>
                              <input
                                type="text"
                                value={editForm.instructorNames}
                                onChange={(e) => setEditForm({ ...editForm, instructorNames: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">แหล่งฝึก / วอร์ด</label>
                              <input
                                type="text"
                                value={editForm.trainingSite}
                                onChange={(e) => setEditForm({ ...editForm, trainingSite: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">วันที่เริ่มต้น</label>
                              <input
                                type="date"
                                value={editForm.startDate}
                                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">วันที่สิ้นสุด</label>
                              <input
                                type="date"
                                value={editForm.endDate}
                                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                              ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <Save className="w-3.5 h-3.5" />
                              <span>บันทึกการแก้ไข</span>
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">📚 {item.courseName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">{item.studentGroup}</span>
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
                        {currentRole !== 'student' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditing('trainingSchedules', item)}
                              className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200"
                              title="แก้ไขข้อมูล"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc('trainingSchedules', item.id)}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                              title="ลบข้อมูล"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= FLOW WORK TAB ================= */}
        {tab === 'flowwork' && (
          <div className="space-y-6">
            {/* Flow Work Overview Summary */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                  <p className="text-[11px] font-semibold text-[#D9361C]">เอกสารทั้งหมด</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{flowWorks.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <p className="text-[11px] font-semibold text-amber-800">รอตรวจทาน / กำลังตรวจ</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{flowPendingCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-emerald-800">ผ่านการตรวจทานแล้ว</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{flowApprovedCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <p className="text-[11px] font-semibold text-rose-800">ส่งกลับแก้ไข</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{flowRevisionCount}</p>
                </div>
              </div>

              {Object.keys(flowCourseCounts).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-[11px] font-bold text-slate-500">สรุปตามรายวิชา:</span>
                  {Object.entries(flowCourseCounts).map(([course, count]) => (
                    <span key={course} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                      {course} ({count} รายการ)
                    </span>
                  ))}
                </div>
              )}
            </div>

            {currentRole === 'student' ? (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                💡 มุมมองนักศึกษา: คุณสามารถตรวจสอบรายการงานและรายงานที่อาจารย์ส่งในระบบได้
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D9361C]" />
                  <span>อาจารย์ส่งข้อมูลและเอกสารรายวิชาเข้าสู่ระบบ</span>
                </h3>
                
                <form onSubmit={handleAddFlowWork} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">รายวิชา (Course Name / Subject)</label>
                    <input
                      type="text"
                      placeholder="เช่น ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 1..."
                      value={flowCourse}
                      onChange={(e) => setFlowCourse(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">อาจารย์ผู้ส่ง / ผู้รับผิดชอบรายวิชา</label>
                    <input
                      type="text"
                      placeholder="เช่น อ.ดร.สมชาย ใจดี..."
                      value={flowInstructor}
                      onChange={(e) => setFlowInstructor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">กลุ่มนักศึกษา</label>
                    <input
                      type="text"
                      placeholder="เช่น กลุ่ม ก..."
                      value={flowStudentGroup}
                      onChange={(e) => setFlowStudentGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">แหล่งฝึก / วอร์ด / แผนก</label>
                    <input
                      type="text"
                      placeholder="เช่น หอผู้ป่วยอายุรกรรม..."
                      value={flowDepartment}
                      onChange={(e) => setFlowDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">หัวข้อเอกสาร / รายงานข้อมูล</label>
                    <input
                      type="text"
                      placeholder="เช่น ส่งแผนการสอนและเกณฑ์ประเมิน..."
                      value={flowTitle}
                      onChange={(e) => setFlowTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลรายวิชาเข้าสู่ระบบ'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการโฟลว์งานทั้งหมดแบบ Real-Time ({flowWorks.length})</h3>
              {flowWorks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีรายการโฟลว์งาน
                </div>
              ) : (
                <div className="space-y-3">
                  {flowWorks.map((item) => {
                    const isEditing = editingTarget?.collection === 'flowWorks' && editingTarget?.id === item.id;
                    if (isEditing) {
                      return (
                        <form key={item.id} onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-red-50/70 border-2 border-[#D9361C] space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-red-200 pb-2">
                            <span className="text-xs font-bold text-[#D9361C]">แก้ไขข้อมูลโฟลว์งานรายวิชา</span>
                            <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                              <X className="w-4 h-4" /> ยกเลิก
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">รายวิชา</label>
                              <input
                                type="text"
                                value={editForm.courseName}
                                onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">อาจารย์ผู้ส่ง</label>
                              <input
                                type="text"
                                value={editForm.instructorName}
                                onChange={(e) => setEditForm({ ...editForm, instructorName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">กลุ่มนักศึกษา</label>
                              <input
                                type="text"
                                value={editForm.studentGroup}
                                onChange={(e) => setEditForm({ ...editForm, studentGroup: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">แหล่งฝึก / วอร์ด</label>
                              <input
                                type="text"
                                value={editForm.department}
                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">สถานะการตรวจทาน</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                              >
                                <option value="รอตรวจทานโดยประธานหลักสูตร (Pending Review)">รอตรวจทานโดยประธานหลักสูตร (Pending Review)</option>
                                <option value="กำลังตรวจทาน (In Review)">กำลังตรวจทาน (In Review)</option>
                                <option value="ผ่านการตรวจทานแล้ว (Approved)">ผ่านการตรวจทานแล้ว (Approved)</option>
                                <option value="ส่งกลับแก้ไข (Needs Revision)">ส่งกลับแก้ไข (Needs Revision)</option>
                              </select>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">หัวข้อเอกสาร / รายงานข้อมูล</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">ข้อเสนอแนะ / หมายเหตุเพิ่มเติม</label>
                              <input
                                type="text"
                                placeholder="หมายเหตุหรือข้อเสนอแนะ..."
                                value={editForm.feedback || ''}
                                onChange={(e) => setEditForm({ ...editForm, feedback: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                              ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#D9361C] hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <Save className="w-3.5 h-3.5" />
                              <span>บันทึกการแก้ไข</span>
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">📚 {item.courseName || 'รายวิชาทั่วไป'}</span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">{item.studentGroup || item.studentName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#D9361C] text-[10px] font-bold">{item.department}</span>
                            <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>อาจารย์ผู้ส่ง: <span className="font-semibold text-slate-800">{item.instructorName || 'อาจารย์ประจำรายวิชา'}</span></span>
                          </p>
                          {item.feedback && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              หมายเหตุ: {item.feedback}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                            {item.status || 'รอตรวจทาน'}
                          </span>
                          {currentRole !== 'student' && (
                            <>
                              <button
                                onClick={() => startEditing('flowWorks', item)}
                                className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200"
                                title="แก้ไขข้อมูล"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDoc('flowWorks', item.id)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                                title="ลบข้อมูล"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STUDENT GROUPS TAB ================= */}
        {tab === 'student-groups' && (
          <div className="space-y-8">
            {/* Student Groups Overview Summary */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <p className="text-[11px] font-semibold text-indigo-800">นักศึกษาทั้งหมด</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{studentGroups.length} <span className="text-xs font-semibold text-slate-500">คน</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <p className="text-[11px] font-semibold text-blue-800">จำนวนกลุ่มฝึกปฏิบัติ</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{uniqueGroups.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <p className="text-[11px] font-semibold text-purple-800">จำนวนวอร์ด / แผนก</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{uniqueWards.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-emerald-800">จัดสรรรถ/หอพักแล้ว</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{assignedStudentIdSet.size} <span className="text-xs font-semibold text-slate-500">คน</span></p>
                </div>
              </div>

              {(uniqueGroups.length > 0 || Object.keys(wardCounts).length > 0) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  {uniqueGroups.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">สรุปรายกลุ่ม:</span>
                      {uniqueGroups.map((grp) => (
                        <span key={grp} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
                          {grp}: {studentGroups.filter((s) => s.groupName === grp).length} คน
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(wardCounts).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">สรุปรายวอร์ด:</span>
                      {Object.entries(wardCounts).map(([ward, count]) => (
                        <span key={ward} className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 text-[11px] font-medium">
                          {ward}: {count} คน
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentRole !== 'student' && (
              <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">เพิ่มและอัปโหลดรายชื่อนักศึกษาเข้ากลุ่ม</h3>
                      <p className="text-xs text-slate-500">รายชื่อที่เพิ่มจะเชื่อมโยงกับระบบ Assign ห้องพักและรถตู้โดยอัตโนมัติ</p>
                    </div>
                  </div>
                  <label className="cursor-pointer px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>นำเข้าไฟล์ .CSV / .TXT</span>
                    <input type="file" accept=".csv,.txt" onChange={handleCsvFileImport} className="hidden" />
                  </label>
                </div>

                <form onSubmit={handleUploadStudentGroups} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">กลุ่มฝึกปฏิบัติ (พิมพ์เพิ่มเองได้)</label>
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
                      <label className="text-xs font-bold text-slate-700">วอร์ด / แผนก (พิมพ์เพิ่มเองได้)</label>
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
                    <label className="text-xs font-bold text-slate-700">รายชื่อนักศึกษา (บรรทัดละ 1 คน: ชื่อ-นามสกุล, รหัสนักศึกษา)</label>
                    <textarea
                      rows={4}
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
                      <Plus className="w-4 h-4" />
                      <span>{loading ? 'กำลังบันทึก...' : 'อัปโหลดและเพิ่มข้อมูลนักศึกษา'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายชื่อนักศึกษาทั้งหมด ({studentGroups.length} คน)</h3>
              {studentGroups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลนักศึกษาในระบบ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allAvailableGroups.map((grp) => {
                    const groupStudents = studentGroups.filter((s) => s.groupName === grp);
                    if (groupStudents.length === 0) return null;
                    return (
                      <div key={grp} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-900">{grp}</h4>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            {groupStudents.length} คน
                          </span>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {groupStudents.map((st) => {
                            const isEditing = editingTarget?.collection === 'studentGroups' && editingTarget?.id === st.id;
                            if (isEditing) {
                              return (
                                <form key={st.id} onSubmit={handleSaveEdit} className="p-3.5 rounded-xl bg-indigo-50/80 border-2 border-indigo-400 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-indigo-900">แก้ไขข้อมูลนักศึกษา</span>
                                    <button type="button" onClick={cancelEditing} className="text-[11px] text-slate-500 hover:text-slate-700">
                                      ยกเลิก
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={editForm.studentName}
                                    onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    required
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="รหัสนักศึกษา"
                                      value={editForm.studentId}
                                      onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                      required
                                    />
                                    <input
                                      type="text"
                                      placeholder="กลุ่ม"
                                      value={editForm.groupName}
                                      onChange={(e) => setEditForm({ ...editForm, groupName: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                      required
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="วอร์ด / แผนก"
                                    value={editForm.ward}
                                    onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    required
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button type="submit" disabled={loading} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1">
                                      <Save className="w-3 h-3" /> บันทึก
                                    </button>
                                  </div>
                                </form>
                              );
                            }

                            return (
                              <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{st.studentName}</p>
                                  <p className="text-[10px] text-slate-500 font-mono truncate">ID: {st.studentId} · {st.ward}</p>
                                </div>
                                {currentRole !== 'student' && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => startEditing('studentGroups', st)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 text-blue-600 flex items-center justify-center border border-slate-200"
                                      title="แก้ไขรายชื่อ"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDoc('studentGroups', st.id)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                                      title="ลบรายชื่อ"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VAN SERVICE TAB ================= */}
        {tab === 'van' && (
          <div className="space-y-6">
            {/* Van Service Overview Summary */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-emerald-800">เที่ยวรถทั้งหมด</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{vanBookings.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <p className="text-[11px] font-semibold text-blue-800">รอบขาไป / ขากลับ</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                    {vanOutboundCount} <span className="text-xs font-semibold text-slate-500">/ {vanInboundCount}</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <p className="text-[11px] font-semibold text-indigo-800">รถตู้ที่ให้บริการ</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{Object.keys(vanStatsMap).length} <span className="text-xs font-semibold text-slate-500">คัน</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <p className="text-[11px] font-semibold text-purple-800">ยอดผู้โดยสารรวม</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{totalVanPassengers} <span className="text-xs font-semibold text-slate-500">ที่นั่ง</span></p>
                </div>
              </div>

              {Object.keys(vanStatsMap).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-[11px] font-bold text-slate-500">สรุปรายคัน:</span>
                  {Object.entries(vanStatsMap).map(([van, stat]) => (
                    <span key={van} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      🚐 {van}: {stat.trips} เที่ยว · {stat.seats} ที่นั่ง
                    </span>
                  ))}
                </div>
              )}
            </div>

            {currentRole === 'student' ? (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                💡 มุมมองนักศึกษา: คุณสามารถตรวจสอบรอบรถตู้ หมายเลขรถ รายชื่อผู้โดยสาร และข้อมูลคนขับได้จากรายการด้านล่าง
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>บันทึกข้อมูลรถตู้ (เลือกไป-กลับคันเดียวกันได้ และ Assign นักศึกษาได้หลายคน)</span>
                </h3>
                
                <form onSubmit={handleAddVanBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3 p-4 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="roundTripCheck"
                        checked={isRoundTrip}
                        onChange={(e) => setIsRoundTrip(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <label htmlFor="roundTripCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                        🚗 ไป-กลับคันเดียวกัน (Round-Trip Same Van) — บันทึกทั้งขาไปและขากลับด้วยรถคันนี้ทันที
                      </label>
                    </div>
                  </div>

                  {!isRoundTrip && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ทิศทาง (Direction)</label>
                      <select
                        value={vanDirection}
                        onChange={(e) => setVanDirection(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 w-full"
                      >
                        <option value="ขาไป (Outbound)">ขาไป (Outbound)</option>
                        <option value="ขากลับ (Inbound)">ขากลับ (Inbound)</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">คันที่</label>
                    <input
                      type="text"
                      placeholder="เช่น รถตู้คันที่ 1..."
                      value={vanNumber}
                      onChange={(e) => setVanNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">วันที่เดินทาง</label>
                    <input
                      type="date"
                      value={vanDate}
                      onChange={(e) => setVanDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">เส้นทาง (Route)</label>
                    <input
                      type="text"
                      placeholder="เช่น สถาบัน ⟷ โรงพยาบาลสมเด็จ"
                      value={vanRoute}
                      onChange={(e) => setVanRoute(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {isRoundTrip ? 'เวลาออกเดินทาง (ขาไป)' : 'เวลาออกเดินทาง'}
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 08:00 น...."
                      value={vanTimeSlot}
                      onChange={(e) => setVanTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  {isRoundTrip && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">เวลากลับ (ขากลับ)</label>
                      <input
                        type="text"
                        placeholder="เช่น 16:00 น...."
                        value={vanReturnTimeSlot}
                        onChange={(e) => setVanReturnTimeSlot(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">ชื่อคนขับ</label>
                    <input
                      type="text"
                      placeholder="เช่น นายสมชาย..."
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">เบอร์โทรคนขับ</label>
                    <input
                      type="text"
                      placeholder="เช่น 081-234-5678..."
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  {/* Multi-select Students Checklist */}
                  <div className="space-y-3 sm:col-span-3 p-4 rounded-2xl bg-white border border-emerald-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <label className="text-xs font-bold text-slate-800">
                          Assign รายชื่อนักศึกษาขึ้นรถ (เลือกได้หลายคน)
                        </label>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          เลือกแล้ว {vanSelectedStudentIds.length} คน
                        </span>
                      </div>

                      {studentGroups.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const idsToAdd = filteredVanStudents.map((s) => s.id);
                              setVanSelectedStudentIds(Array.from(new Set([...vanSelectedStudentIds, ...idsToAdd])));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200"
                          >
                            เลือกทั้งหมดที่แสดง ({filteredVanStudents.length})
                          </button>
                          {vanSelectedStudentIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setVanSelectedStudentIds([])}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold"
                            >
                              ล้างที่เลือก
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {studentGroups.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        ⚠️ ยังไม่มีรายชื่อนักศึกษาในระบบ กรุณาเพิ่มรายชื่อในเมนู "ข้อมูลกลุ่มนักศึกษา" ก่อน
                      </div>
                    ) : (
                      <>
                        {/* Filter by group & search */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="ค้นหาชื่อ รหัส หรือวอร์ดนักศึกษา..."
                              value={vanStudentSearch}
                              onChange={(e) => setVanStudentSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            />
                          </div>
                          <select
                            value={vanStudentGroupFilter}
                            onChange={(e) => setVanStudentGroupFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                          >
                            <option value="ALL">ทุกกลุ่ม ({studentGroups.length} คน)</option>
                            {uniqueGroups.map((grp) => (
                              <option key={grp} value={grp}>
                                {grp} ({studentGroups.filter((s) => s.groupName === grp).length})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                          {filteredVanStudents.map((st) => {
                            const isChecked = vanSelectedStudentIds.includes(st.id);
                            return (
                              <label
                                key={st.id}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs'
                                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleStudentInArray(st.id, vanSelectedStudentIds, setVanSelectedStudentIds)
                                  }
                                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">{st.studentName}</p>
                                  <p className="text-[10px] text-slate-500 font-mono truncate">
                                    {st.groupName} · {st.studentId} · {st.ward}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || studentGroups.length === 0}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลรถตู้'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการรถตู้ทั้งหมดแบบ Real-Time ({vanBookings.length})</h3>
              {vanBookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลรถตู้ในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {vanBookings.map((item) => {
                    const isEditing = editingTarget?.collection === 'vanBookings' && editingTarget?.id === item.id;
                    const passengerNames: string[] = Array.isArray(item.assignedStudentNames) && item.assignedStudentNames.length > 0
                      ? item.assignedStudentNames
                      : item.assignedStudentName
                      ? item.assignedStudentName.split(',').map((s: string) => s.trim()).filter(Boolean)
                      : [];

                    if (isEditing) {
                      const editStudentIds: string[] = Array.isArray(editForm.assignedStudentIds) ? editForm.assignedStudentIds : [];
                      return (
                        <form key={item.id} onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                            <span className="text-xs font-bold text-emerald-900">แก้ไขข้อมูลรถตู้และรายชื่อนักศึกษา</span>
                            <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                              <X className="w-4 h-4" /> ยกเลิก
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">ทิศทาง</label>
                              <select
                                value={editForm.direction}
                                onChange={(e) => setEditForm({ ...editForm, direction: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                              >
                                <option value="ขาไป (Outbound)">ขาไป (Outbound)</option>
                                <option value="ขากลับ (Inbound)">ขากลับ (Inbound)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">คันที่</label>
                              <input
                                type="text"
                                value={editForm.vanNumber}
                                onChange={(e) => setEditForm({ ...editForm, vanNumber: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">วันที่เดินทาง</label>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">เวลา</label>
                              <input
                                type="text"
                                value={editForm.timeSlot}
                                onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">ชื่อคนขับ</label>
                              <input
                                type="text"
                                value={editForm.driverName}
                                onChange={(e) => setEditForm({ ...editForm, driverName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">เบอร์โทรคนขับ</label>
                              <input
                                type="text"
                                value={editForm.driverPhone}
                                onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700">เส้นทาง</label>
                              <input
                                type="text"
                                value={editForm.route}
                                onChange={(e) => setEditForm({ ...editForm, route: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">สถานะ</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                              >
                                <option value="ยืนยันแล้ว (Confirmed)">ยืนยันแล้ว (Confirmed)</option>
                                <option value="อยู่ระหว่างเดินทาง (In Transit)">อยู่ระหว่างเดินทาง (In Transit)</option>
                                <option value="เสร็จสิ้น (Completed)">เสร็จสิ้น (Completed)</option>
                                <option value="ยกเลิก (Cancelled)">ยกเลิก (Cancelled)</option>
                              </select>
                            </div>

                            <div className="sm:col-span-3 p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-800">
                                  แก้ไขรายชื่อนักศึกษาขึ้นรถ (เลือกแล้ว {editStudentIds.length} คน)
                                </span>
                                {studentGroups.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, assignedStudentIds: studentGroups.map((s) => s.id) })}
                                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                                  >
                                    เลือกทั้งหมด
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                                {studentGroups.map((st) => {
                                  const checked = editStudentIds.includes(st.id);
                                  return (
                                    <label
                                      key={st.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                                        checked ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleStudentInArray(st.id, editStudentIds, (next) =>
                                            setEditForm({ ...editForm, assignedStudentIds: next })
                                          )
                                        }
                                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                                      />
                                      <span className="truncate font-medium text-slate-800">
                                        {st.studentName} ({st.groupName})
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                              ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <Save className="w-3.5 h-3.5" />
                              <span>บันทึกการแก้ไข</span>
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-white text-[11px] font-bold ${item.direction?.includes('ขาไป') ? 'bg-blue-600' : 'bg-purple-600'}`}>
                              {item.direction || 'ขาไป'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">{item.vanNumber || 'คันที่ 1'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">📅 วันที่: {item.date} ({item.timeSlot})</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              👥 ผู้โดยสาร {passengerNames.length} คน
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{item.route}</h4>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <Car className="w-3.5 h-3.5 text-emerald-600" />
                              คนขับ: {item.driverName}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                              เบอร์โทร: {item.driverPhone}
                            </span>
                          </div>
                          {passengerNames.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {passengerNames.map((pName, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                                  {pName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {currentRole !== 'student' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditing('vanBookings', item)}
                              className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200"
                              title="แก้ไขข้อมูลรถตู้"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc('vanBookings', item.id)}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                              title="ลบข้อมูล"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ACCOMMODATION TAB ================= */}
        {tab === 'accommodation' && (
          <div className="space-y-8">
            {/* Accommodation & Billing Overview Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                <p className="text-[11px] font-semibold text-purple-800">ห้องพักที่ Assign</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                  {roomRecords.length} <span className="text-xs font-semibold text-slate-500">ห้อง ({totalRoomOccupants} คน)</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <p className="text-[11px] font-semibold text-amber-800">ค่าน้ำ-ค่าไฟทั้งหมด</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                  {utilityRecords.length} <span className="text-xs font-semibold text-slate-500">({utilityTotalBaht.toLocaleString()} ฿)</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <p className="text-[11px] font-semibold text-rose-800">บิลรอชำระ</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                  {utilityPendingRecords.length} <span className="text-xs font-semibold text-slate-500">({utilityPendingBaht.toLocaleString()} ฿)</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-[11px] font-semibold text-emerald-800">สลิปโอนเงิน</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                  {paymentRecords.length} <span className="text-xs font-semibold text-slate-500">(รอตรวจ {paymentPendingCount} / ผ่าน {paymentVerifiedCount})</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
              <button
                onClick={() => setSubTab('rooms')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'rooms' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bed className="w-4 h-4" />
                <span>หอพัก / ห้องพัก ({roomRecords.length})</span>
              </button>
              <button
                onClick={() => setSubTab('utilities')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'utilities' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>ค่าน้ำ - ค่าไฟ ({utilityRecords.length})</span>
              </button>
              <button
                onClick={() => setSubTab('payments')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  subTab === 'payments' ? 'bg-[#D9361C] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>อัปโหลดสลิปโอนเงิน ({paymentRecords.length})</span>
              </button>
            </div>

            {currentRole === 'student' && subTab === 'payments' && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                💡 มุมมองนักศึกษา: คุณสามารถอัปโหลดสลิปโอนเงินค่าห้องพักหรือค่าน้ำ-ค่าไฟได้ที่นี่ เพื่อให้เจ้าหน้าที่ตรวจสอบ
              </div>
            )}

            {subTab === 'rooms' && currentRole !== 'student' && (
              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <span>Assign นักศึกษาเข้าห้องพัก (1 ห้องเลือกเข้าพักได้หลายคน)</span>
                </h3>

                {studentGroups.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    ⚠️ ยังไม่มีรายชื่อนักศึกษาในระบบ กรุณาเพิ่มรายชื่อนักศึกษาก่อน
                  </div>
                ) : (
                  <form onSubmit={handleAddRoomAssignment} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">เลขห้องพัก / อาคาร</label>
                        <input
                          type="text"
                          placeholder="เช่น อาคาร 2 ห้อง 402..."
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">วันที่เข้าพัก (Check-in)</label>
                        <input
                          type="date"
                          value={roomCheckInDate}
                          onChange={(e) => setRoomCheckInDate(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">วันที่ย้ายออก (Check-out)</label>
                        <input
                          type="date"
                          value={roomCheckOutDate}
                          onChange={(e) => setRoomCheckOutDate(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Multi-select Students Checklist for Room */}
                    <div className="space-y-3 p-4 rounded-2xl bg-white border border-purple-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                          <label className="text-xs font-bold text-slate-800">
                            เลือกนักศึกษาเข้าห้องพัก (เลือกได้หลายคน)
                          </label>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                            เลือกแล้ว {roomSelectedStudentIds.length} คน
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const idsToAdd = filteredRoomStudents.map((s) => s.id);
                              setRoomSelectedStudentIds(Array.from(new Set([...roomSelectedStudentIds, ...idsToAdd])));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold border border-purple-200"
                          >
                            เลือกทั้งหมดที่แสดง ({filteredRoomStudents.length})
                          </button>
                          {roomSelectedStudentIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setRoomSelectedStudentIds([])}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold"
                            >
                              ล้างที่เลือก
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="ค้นหาชื่อ รหัส หรือวอร์ดนักศึกษา..."
                            value={roomStudentSearch}
                            onChange={(e) => setRoomStudentSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <select
                          value={roomStudentGroupFilter}
                          onChange={(e) => setRoomStudentGroupFilter(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        >
                          <option value="ALL">ทุกกลุ่ม ({studentGroups.length} คน)</option>
                          {uniqueGroups.map((grp) => (
                            <option key={grp} value={grp}>
                              {grp} ({studentGroups.filter((s) => s.groupName === grp).length})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                        {filteredRoomStudents.map((st) => {
                          const isChecked = roomSelectedStudentIds.includes(st.id);
                          return (
                            <label
                              key={st.id}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-2xs'
                                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  toggleStudentInArray(st.id, roomSelectedStudentIds, setRoomSelectedStudentIds)
                                }
                                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate">{st.studentName}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  {st.groupName} · {st.studentId} · {st.ward}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end">
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

            {subTab === 'utilities' && currentRole !== 'student' && (
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
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 justify-center"
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
                  <Receipt className="w-4 h-4 text-purple-600" />
                  <span>อัปโหลดสลิปโอนเงิน (Upload Payment Slip)</span>
                </h3>
                <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="ชื่อรายการ / เช่น ค่าห้องพักเดือน พ.ค..."
                    value={paymentTitle}
                    onChange={(e) => setPaymentTitle(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="จำนวนเงิน (บาท)..."
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'กำลังอัปโหลด...' : 'อัปโหลดสลิป'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {subTab === 'rooms' ? 'รายการห้องพักทั้งหมด' : subTab === 'utilities' ? 'รายการค่าน้ำ-ค่าไฟ' : 'รายการสลิปโอนเงินทั้งหมด'}
              </h3>
              {accommodationRecords.filter((r) => r.type === subTab).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลในหมวดหมู่นี้
                </div>
              ) : (
                <div className="space-y-3">
                  {accommodationRecords
                    .filter((r) => r.type === subTab)
                    .map((item) => {
                      const isEditing = editingTarget?.collection === 'accommodationRecords' && editingTarget?.id === item.id;
                      const occupants = item.type === 'rooms' ? getRoomOccupants(item) : [];

                      if (isEditing) {
                        const editRoomStudentIds: string[] = Array.isArray(editForm.assignedStudentIds)
                          ? editForm.assignedStudentIds
                          : [];

                        return (
                          <form key={item.id} onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-400 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                              <span className="text-xs font-bold text-purple-900">แก้ไขข้อมูล{item.type === 'rooms' ? 'ห้องพัก' : item.type === 'utilities' ? 'ค่าน้ำ-ค่าไฟ' : 'สลิปโอนเงิน'}</span>
                              <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <X className="w-4 h-4" /> ยกเลิก
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700">หัวข้อ / เลขห้อง</label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700">
                                  {item.type === 'rooms' ? 'อาคาร / หมายเหตุ' : 'จำนวนเงิน'}
                                </label>
                                <input
                                  type="text"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[11px] font-bold text-slate-700">สถานะ</label>
                                <select
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                >
                                  {item.type === 'rooms' ? (
                                    <>
                                      <option value="เข้าพักแล้ว (Occupied)">เข้าพักแล้ว (Occupied)</option>
                                      <option value="จองแล้ว (Reserved)">จองแล้ว (Reserved)</option>
                                      <option value="ย้ายออกแล้ว (Checked Out)">ย้ายออกแล้ว (Checked Out)</option>
                                    </>
                                  ) : item.type === 'utilities' ? (
                                    <>
                                      <option value="รอชำระ (Pending)">รอชำระ (Pending)</option>
                                      <option value="ชำระแล้ว (Paid)">ชำระแล้ว (Paid)</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="รอตรวจสอบสลิป (Pending Review)">รอตรวจสอบสลิป (Pending Review)</option>
                                      <option value="ตรวจสอบแล้ว (Verified)">ตรวจสอบแล้ว (Verified)</option>
                                      <option value="สลิปไม่ถูกต้อง (Rejected)">สลิปไม่ถูกต้อง (Rejected)</option>
                                    </>
                                  )}
                                </select>
                              </div>

                              {item.type === 'rooms' && (
                                <>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">วันที่เข้าพัก (Check-in)</label>
                                    <input
                                      type="date"
                                      value={editForm.checkInDate || ''}
                                      onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">วันที่ย้ายออก (Check-out)</label>
                                    <input
                                      type="date"
                                      value={editForm.checkOutDate || ''}
                                      onChange={(e) => setEditForm({ ...editForm, checkOutDate: e.target.value })}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                                    />
                                  </div>
                                </>
                              )}

                              {item.type === 'rooms' && (
                                <div className="sm:col-span-2 p-3 rounded-xl bg-white border border-purple-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-800">
                                      แก้ไขรายชื่อนักศึกษาที่เข้าพัก (เลือกแล้ว {editRoomStudentIds.length} คน)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {studentGroups.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => setEditForm({ ...editForm, assignedStudentIds: studentGroups.map((s) => s.id) })}
                                          className="text-[11px] font-semibold text-purple-700 hover:underline"
                                        >
                                          เลือกทั้งหมด
                                        </button>
                                      )}
                                      {editRoomStudentIds.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => setEditForm({ ...editForm, assignedStudentIds: [] })}
                                          className="text-[11px] font-semibold text-slate-500 hover:underline"
                                        >
                                          ล้าง
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                                    {studentGroups.map((st) => {
                                      const checked = editRoomStudentIds.includes(st.id);
                                      return (
                                        <label
                                          key={st.id}
                                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                                            checked ? 'bg-purple-50 border-purple-400' : 'bg-slate-50 border-slate-200'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                              toggleStudentInArray(st.id, editRoomStudentIds, (next) =>
                                                setEditForm({ ...editForm, assignedStudentIds: next })
                                              )
                                            }
                                            className="w-3.5 h-3.5 text-purple-600 rounded"
                                          />
                                          <span className="truncate font-medium text-slate-800">
                                            {st.studentName} ({st.groupName} - {st.studentId})
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                ยกเลิก
                              </button>
                              <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                                <Save className="w-3.5 h-3.5" />
                                <span>บันทึกการแก้ไข</span>
                              </button>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#FFF3EE] text-[#D9361C] text-[10px] font-bold">
                                {item.type === 'rooms' ? 'หอพัก' : item.type === 'utilities' ? 'ค่าน้ำ-ค่าไฟ' : 'สลิปโอนเงิน'}
                              </span>
                              {item.type === 'rooms' && (
                                <span className="px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#3B82F6] text-[10px] font-semibold">
                                  🛏️ ผู้เข้าพัก {occupants.length} คน
                                </span>
                              )}
                              {item.type === 'rooms' && item.checkInDate && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono">
                                  📅 เข้าพัก: {item.checkInDate}{item.checkOutDate ? ` ถึง ${item.checkOutDate}` : ''}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            {item.type === 'rooms' && occupants.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {occupants.map((occ, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#E3F2FD]/60 text-slate-800 border border-sky-200 text-[11px] font-medium">
                                    {occ}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              item.assignedTo && <p className="text-xs text-slate-600">นักศึกษา: {item.assignedTo}</p>
                            )}
                            <p className="text-xs text-slate-500">รายละเอียด/จำนวน: {item.amount}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                              {item.status || 'บันทึกแล้ว'}
                            </span>
                            {currentRole !== 'student' && (
                              <>
                                <button
                                  onClick={() => startEditing('accommodationRecords', item)}
                                  className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc('accommodationRecords', item.id)}
                                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                                  title="ลบข้อมูล"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ANNOUNCEMENTS TAB ================= */}
        {tab === 'announcements' && (
          <div className="space-y-6">
            {/* Announcements Overview Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                <p className="text-[11px] font-semibold text-sky-800">ประกาศทั้งหมด</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{announcements.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                <p className="text-[11px] font-semibold text-[#D9361C]">ประกาศด่วน (Urgent)</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{annUrgentCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700">ประกาศทั่วไป (General)</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{annGeneralCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <p className="text-[11px] font-semibold text-blue-800">ตารางฝึกปฏิบัติ (Schedule)</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{annScheduleCount}</p>
              </div>
            </div>

            {currentRole === 'student' ? (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                💡 มุมมองนักศึกษา: คุณสามารถตรวจสอบประกาศและข่าวสารจากสถาบันและโรงพยาบาลได้ที่นี่
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-sky-600" />
                  <span>โพสต์ประกาศใหม่</span>
                </h3>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="หัวข้อประกาศ..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="sm:col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      required
                    />
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    >
                      <option value="ประกาศด่วน (Urgent)">ประกาศด่วน (Urgent)</option>
                      <option value="ประกาศทั่วไป (General)">ประกาศทั่วไป (General)</option>
                      <option value="ตารางฝึกปฏิบัติ (Schedule)">ตารางฝึกปฏิบัติ (Schedule)</option>
                    </select>
                  </div>
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
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ประกาศทั้งหมดแบบ Real-Time ({announcements.length})</h3>
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ยังไม่มีประกาศในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((item) => {
                    const isEditing = editingTarget?.collection === 'announcements' && editingTarget?.id === item.id;
                    if (isEditing) {
                      return (
                        <form key={item.id} onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                            <span className="text-xs font-bold text-sky-900">แก้ไขประกาศ</span>
                            <button type="button" onClick={cancelEditing} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                              <X className="w-4 h-4" /> ยกเลิก
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                              required
                            />
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                            >
                              <option value="ประกาศด่วน (Urgent)">ประกาศด่วน (Urgent)</option>
                              <option value="ประกาศทั่วไป (General)">ประกาศทั่วไป (General)</option>
                              <option value="ตารางฝึกปฏิบัติ (Schedule)">ตารางฝึกปฏิบัติ (Schedule)</option>
                            </select>
                          </div>
                          <textarea
                            rows={3}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                            required
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                              ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <Save className="w-3.5 h-3.5" />
                              <span>บันทึกการแก้ไข</span>
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">{item.category}</span>
                            <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.description}</p>
                        </div>
                        {currentRole !== 'student' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditing('announcements', item)}
                              className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200"
                              title="แก้ไขประกาศ"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc('announcements', item.id)}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center border border-slate-200"
                              title="ลบประกาศ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= REPORTS TAB (Live Firestore Summary) ================= */}
        {tab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <p className="text-xs font-semibold text-blue-800">ตารางการฝึกปฏิบัติ</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{trainingSchedules.length}</p>
                <p className="text-[11px] text-slate-500">{uniqueSchedCourses.length} รายวิชา · {uniqueSchedSites.length} แหล่งฝึก</p>
              </div>
              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-1">
                <p className="text-xs font-semibold text-[#D9361C]">โฟลว์งานรายวิชา</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{flowWorks.length}</p>
                <p className="text-[11px] text-slate-500">ผ่าน {flowApprovedCount} · รอตรวจ {flowPendingCount} · แก้ไข {flowRevisionCount}</p>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <p className="text-xs font-semibold text-indigo-800">นักศึกษาในระบบ</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{studentGroups.length}</p>
                <p className="text-[11px] text-slate-500">{uniqueGroups.length} กลุ่ม · {uniqueWards.length} วอร์ด</p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <p className="text-xs font-semibold text-emerald-800">รอบรถตู้รับส่ง</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{vanBookings.length}</p>
                <p className="text-[11px] text-slate-500">ขาไป {vanOutboundCount} / ขากลับ {vanInboundCount} · {totalVanPassengers} ที่นั่ง</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                <p className="text-xs font-semibold text-purple-800">หอพัก/บิล/สลิป</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{accommodationRecords.length}</p>
                <p className="text-[11px] text-slate-500">{roomRecords.length} ห้อง ({totalRoomOccupants} คน) · สลิป {paymentRecords.length}</p>
              </div>
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
                <p className="text-xs font-semibold text-sky-800">ประกาศในระบบ</p>
                <p className="text-2xl font-extrabold font-mono text-slate-900">{announcements.length}</p>
                <p className="text-[11px] text-slate-500">ประกาศด่วน {annUrgentCount} · ทั่วไป {annGeneralCount}</p>
              </div>
            </div>

            {/* Detailed Live Cross-Module Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">สรุปนักศึกษาตามกลุ่มและวอร์ด</h3>
                {studentGroups.length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่มีข้อมูลนักศึกษาในระบบ</p>
                ) : (
                  <div className="space-y-2">
                    {uniqueGroups.map((grp) => (
                      <div key={grp} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800">{grp}</span>
                        <span className="font-mono font-semibold text-indigo-700">
                          {studentGroups.filter((s) => s.groupName === grp).length} คน
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">สรุปการเดินรถตู้แยกตามคัน</h3>
                {Object.keys(vanStatsMap).length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่มีข้อมูลรถตู้ในระบบ</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(vanStatsMap).map(([van, stat]) => (
                      <div key={van} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800">🚐 {van}</span>
                        <span className="font-mono font-semibold text-emerald-700">
                          {stat.trips} เที่ยว · ผู้โดยสาร {stat.seats} ที่นั่ง
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">สรุปหอพัก ค่าน้ำ-ค่าไฟ และสลิปโอนเงิน</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-semibold">ห้องพักทั้งหมด / ผู้เข้าพักรวม</span>
                    <span className="font-mono font-bold text-purple-700">{roomRecords.length} ห้อง / {totalRoomOccupants} คน</span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-semibold">ยอดค่าน้ำ-ค่าไฟรวม / รอชำระ</span>
                    <span className="font-mono font-bold text-amber-700">{utilityTotalBaht.toLocaleString()} ฿ / {utilityPendingBaht.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-semibold">ยอดสลิปโอนเงิน (รอตรวจ {paymentPendingCount} · ผ่าน {paymentVerifiedCount} · ไม่ผ่าน {paymentRejectedCount})</span>
                    <span className="font-mono font-bold text-emerald-700">{paymentTotalBaht.toLocaleString()} ฿</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">สรุปตารางฝึกปฏิบัติรายวิชา</h3>
                {trainingSchedules.length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่มีตารางฝึกปฏิบัติในระบบ</p>
                ) : (
                  <div className="space-y-2">
                    {uniqueSchedCourses.map((course) => (
                      <div key={course} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800 truncate pr-2">{course}</span>
                        <span className="font-mono font-semibold text-blue-700 shrink-0">
                          {trainingSchedules.filter((s) => s.courseName === course).length} ตาราง
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Large-Text Detail Modal for Weekly Calendar Schedule */}
      {selectedCalendarSchedule && (
        <div
          className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCalendarSchedule(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sky-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-lg border text-xs font-bold ${selectedCalendarSchedule.palette}`}>
                  {selectedCalendarSchedule.dayLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedCalendarSchedule.sched.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarSchedule(null)}
                className="w-9 h-9 rounded-full bg-[#E3F2FD] hover:bg-sky-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border space-y-1 ${selectedCalendarSchedule.palette}`}>
                <p className="text-xs font-bold opacity-80">แหล่งฝึกปฏิบัติ / วอร์ด / โรงพยาบาล</p>
                <p className="text-lg font-extrabold flex items-center gap-2">
                  <Building className="w-5 h-5 shrink-0" />
                  <span>{selectedCalendarSchedule.sched.trainingSite}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#E3F2FD]/45 border border-sky-100 space-y-1">
                  <p className="text-xs font-bold text-[#3B82F6]">กลุ่มนักศึกษา</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {selectedCalendarSchedule.sched.studentGroup}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF3EE]/70 border border-orange-100 space-y-1">
                  <p className="text-xs font-bold text-[#D9361C]">ช่วงวันที่ฝึกปฏิบัติ</p>
                  <p className="text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {selectedCalendarSchedule.sched.startDate} ถึง {selectedCalendarSchedule.sched.endDate}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span>อาจารย์นิเทศประจำรายวิชา</span>
                </p>
                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {selectedCalendarSchedule.sched.instructorNames}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-sky-100 flex flex-wrap items-center justify-end gap-3">
              {currentRole !== 'student' && (
                <button
                  type="button"
                  onClick={() => {
                    const targetSched = selectedCalendarSchedule.sched;
                    setSelectedCalendarSchedule(null);
                    startEditing('trainingSchedules', targetSched);
                  }}
                  className="px-5 py-2.5 bg-[#E3F2FD] hover:bg-sky-200 text-[#3B82F6] text-xs font-bold rounded-xl border border-sky-200 transition-all flex items-center gap-1.5"
                >
                  <Pencil className="w-4 h-4" />
                  <span>แก้ไขตารางนี้</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCalendarSchedule(null)}
                className="px-6 py-2.5 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
