/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, NavTab } from './types';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InstructionsPage } from './components/InstructionsPage';
import { ModulePlaceholderView } from './components/ModulePlaceholderView';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Bell, X, Inbox, Megaphone, FileText, Receipt } from 'lucide-react';

interface LiveNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  targetTab: NavTab;
  kind: 'announcement' | 'flowwork' | 'payment';
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Live Firestore collections for Header search, Sidebar badge & Notifications drawer (zero mock data)
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [flowWorks, setFlowWorks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [vanBookings, setVanBookings] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);

  useEffect(() => {
    if (!currentRole) return;

    const unsubAnn = onSnapshot(
      query(collection(db, 'announcements')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setAnnouncements(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'announcements')
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

    const unsubSched = onSnapshot(
      query(collection(db, 'trainingSchedules')),
      (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setSchedules(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'trainingSchedules')
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

    return () => {
      unsubAnn();
      unsubFlow();
      unsubSched();
      unsubVan();
      unsubAcc();
    };
  }, [currentRole]);

  // Derived real-time counts & notifications
  const pendingFlowCount = flowWorks.filter(
    (f) => f.status?.includes('รอตรวจทาน') || f.status?.includes('กำลังตรวจทาน')
  ).length;

  const liveNotifications: LiveNotificationItem[] = [
    ...announcements.map((a) => ({
      id: `ann-${a.id}`,
      title: a.title || 'ประกาศใหม่',
      desc: a.description || '',
      time: a.createdAt || '',
      targetTab: 'announcements' as NavTab,
      kind: 'announcement' as const,
    })),
    ...flowWorks
      .filter((f) => f.status?.includes('รอตรวจทาน') || f.status?.includes('ส่งกลับแก้ไข'))
      .map((f) => ({
        id: `flow-${f.id}`,
        title: `${f.courseName || 'รายวิชา'}: ${f.title || 'โฟลว์งาน'}`,
        desc: `${f.status} · ${f.studentGroup || ''} ${f.department ? `(${f.department})` : ''}`,
        time: f.createdAt || '',
        targetTab: 'flowwork' as NavTab,
        kind: 'flowwork' as const,
      })),
    ...accommodations
      .filter((r) => r.type === 'payments' && r.status?.includes('รอตรวจสอบ'))
      .map((p) => ({
        id: `pay-${p.id}`,
        title: `สลิปโอนเงิน: ${p.title || 'รอตรวจสอบ'}`,
        desc: `${p.amount || ''} · ${p.status || ''}`,
        time: p.createdAt || '',
        targetTab: 'accommodation' as NavTab,
        kind: 'payment' as const,
      })),
  ];

  const searchableItems = [
    ...schedules.map((s) => ({
      id: `sched-${s.id}`,
      label: s.courseName || 'ตารางฝึกปฏิบัติ',
      sub: `${s.studentGroup || ''} · ${s.trainingSite || ''}`,
      tab: 'schedule' as NavTab,
      category: 'ตารางฝึกปฏิบัติ',
    })),
    ...flowWorks.map((f) => ({
      id: `flow-${f.id}`,
      label: f.title || 'โฟลว์งาน',
      sub: `${f.courseName || ''} · ${f.instructorName || ''}`,
      tab: 'flowwork' as NavTab,
      category: 'โฟลว์งาน',
    })),
    ...vanBookings.map((v) => ({
      id: `van-${v.id}`,
      label: `${v.vanNumber || 'รถตู้'} · ${v.direction || ''}`,
      sub: `${v.date || ''} ${v.timeSlot || ''} · ${v.driverName || ''}`,
      tab: 'van' as NavTab,
      category: 'บริการรถตู้',
    })),
    ...accommodations.map((a) => ({
      id: `acc-${a.id}`,
      label: a.title || 'หอพักและบิล',
      sub: a.assignedTo || a.amount || '',
      tab: 'accommodation' as NavTab,
      category: 'หอพักและบิล',
    })),
    ...announcements.map((a) => ({
      id: `ann-${a.id}`,
      label: a.title || 'ประกาศ',
      sub: a.category || '',
      tab: 'announcements' as NavTab,
      category: 'ประกาศ',
    })),
  ];

  // Handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentTab('dashboard');
  };

  const handleBackToRoleSelection = () => {
    setCurrentRole(null);
    setCurrentTab('dashboard');
  };

  // If no role selected and not viewing instructions
  if (currentRole === null && currentTab !== 'instructions') {
    return (
      <LandingPage
        onSelectRole={handleSelectRole}
        onOpenInstructions={() => {
          setCurrentRole('student');
          setCurrentTab('instructions');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F4F9FE] to-[#FFF8F5] flex flex-col font-sans text-slate-900">
      {/* Application Header */}
      <Header
        currentRole={currentRole}
        onBackToRoleSelection={handleBackToRoleSelection}
        onOpenInstructions={() => setCurrentTab('instructions')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        notificationCount={liveNotifications.length}
        searchableItems={searchableItems}
        onNavigate={(tab) => setCurrentTab(tab)}
      />

      {/* Main Application Body with Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          currentRole={currentRole}
          pendingFlowCount={pendingFlowCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentRole={currentRole}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'instructions' && (
            <InstructionsPage
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab !== 'dashboard' && currentTab !== 'instructions' && (
            <ModulePlaceholderView
              tab={currentTab}
              currentRole={currentRole}
              onBackToDashboard={() => setCurrentTab('dashboard')}
              onOpenInstructions={() => setCurrentTab('instructions')}
            />
          )}
        </main>
      </div>

      {/* Live Firestore Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-end p-4">
          <div className="bg-white rounded-3xl max-w-md w-full h-[90vh] p-6 shadow-2xl flex flex-col justify-between border border-sky-100">
            <div className="space-y-6 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3EE] border border-orange-200 flex items-center justify-center text-[#D9361C]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">การแจ้งเตือนจากระบบ</h3>
                    <p className="text-[11px] text-slate-500">อัปเดตตามข้อมูลจริง ({liveNotifications.length} รายการ)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#E3F2FD] hover:bg-sky-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                  aria-label="ปิดหน้าต่างแจ้งเตือน"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {liveNotifications.length === 0 ? (
                  <div className="text-center py-16 bg-[#E3F2FD]/40 rounded-2xl border border-sky-100 space-y-2">
                    <Inbox className="w-8 h-8 text-sky-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">ยังไม่มีการแจ้งเตือนในขณะนี้</p>
                    <p className="text-[11px] text-slate-500">ระบบจะแสดงประกาศและรายการรอตรวจสอบแบบเรียลไทม์</p>
                  </div>
                ) : (
                  liveNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => {
                        setCurrentTab(notif.targetTab);
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-sky-100 bg-[#E3F2FD]/35 hover:bg-[#FFF3EE]/70 hover:border-[#D9361C]/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D9361C]">
                          {notif.kind === 'announcement' && <Megaphone className="w-3.5 h-3.5" />}
                          {notif.kind === 'flowwork' && <FileText className="w-3.5 h-3.5" />}
                          {notif.kind === 'payment' && <Receipt className="w-3.5 h-3.5" />}
                          <span>
                            {notif.kind === 'announcement'
                              ? 'ประกาศ'
                              : notif.kind === 'flowwork'
                              ? 'โฟลว์งาน'
                              : 'สลิปโอนเงิน'}
                          </span>
                        </span>
                        {notif.time && <span className="text-[10px] text-slate-400">{notif.time}</span>}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      {notif.desc && <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{notif.desc}</p>}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-sky-100">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-3 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
