/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, NavTab } from './types';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InstructionsPage } from './components/InstructionsPage';
import { ModulePlaceholderView } from './components/ModulePlaceholderView';
import { Bell, X, HeartPulse } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentTab('dashboard');
  };

  const handleBackToRoleSelection = () => {
    setCurrentRole(null);
    setCurrentTab('dashboard');
  };

  const handleOpenInstructions = () => {
    if (currentRole === null) {
      // If on landing page, we can show instructions in a modal or temp view
      setCurrentRole('student'); // temporary role shell for instructions or dedicated view
      setCurrentTab('instructions');
    } else {
      setCurrentTab('instructions');
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Application Header */}
      <Header
        currentRole={currentRole}
        onBackToRoleSelection={handleBackToRoleSelection}
        onOpenInstructions={() => setCurrentTab('instructions')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Application Body with Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          currentRole={currentRole}
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

      {/* Notifications Drawer / Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-end p-4">
          <div className="bg-white rounded-3xl max-w-md w-full h-[90vh] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 border border-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D9361C]" />
                  <h3 className="text-lg font-bold text-slate-900">การแจ้งเตือน (Notifications)</h3>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-140px)] pr-1">
                {[
                  {
                    title: 'ประกาศจากประธานหลักสูตร',
                    desc: 'กำหนดส่งรายงานโฟลว์งานงวดที่ 2 ภายในวันที่ 20 พฤศจิกายนนี้',
                    time: '10 นาทีที่แล้ว',
                    unread: true,
                  },
                  {
                    title: 'อัปเดตตารางรถตู้',
                    desc: 'เพิ่มรอบรถตู้รับส่งพิเศษเส้นทาง สถาบัน ⟷ รพ.สมเด็จ รอบ 17:30 น.',
                    time: '2 ชั่วโมงที่แล้ว',
                    unread: true,
                  },
                  {
                    title: 'ตรวจสอบสลิปโอนเงิน',
                    desc: 'เจ้าหน้าที่โรงพยาบาลได้ตรวจสอบสลิปค่าน้ำ-ค่าไฟเรียบร้อยแล้ว',
                    time: 'เมื่อวานนี้',
                    unread: false,
                  },
                ].map((notif, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${notif.unread ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200/65'} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      {notif.unread && <span className="w-2 h-2 rounded-full bg-[#D9361C]"></span>}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.desc}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-3 bg-[#D9361C] hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 transition-all"
              >
                ปิดหน้าต่าง (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
