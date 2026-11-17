export type UserRole = 'instructor' | 'student' | 'staff' | null;

export type NavTab = 
  | 'dashboard'
  | 'schedule'
  | 'flowwork'
  | 'van'
  | 'accommodation'
  | 'announcements'
  | 'reports'
  | 'student-groups'
  | 'instructions';

export interface RoleInfo {
  id: UserRole;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  iconName: string;
  badgeColor: string;
}

export interface InstructionSection {
  id: string;
  stepNumber: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  icon: string;
  category: string;
}
