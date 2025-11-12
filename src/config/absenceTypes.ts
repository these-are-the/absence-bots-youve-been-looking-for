export type AbsenceType =
  | 'vacation'
  | 'sick_leave'
  | 'parental_leave'
  | 'sick_child'
  | 'work_from_home'
  | 'knowledge_time'
  | 'flex_time'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'care_relative'
  | 'military_duties';

export interface AbsenceTypeConfig {
  id: AbsenceType;
  requiresApproval: boolean;
  affectsCalendar: boolean;
  affectsSlackStatus: boolean;
  affectsCinode: boolean;
  durationType: 'hours' | 'days' | 'both';
}

export const absenceTypes: Record<AbsenceType, AbsenceTypeConfig> = {
  vacation: {
    id: 'vacation',
    requiresApproval: true,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  sick_leave: {
    id: 'sick_leave',
    requiresApproval: false,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  parental_leave: {
    id: 'parental_leave',
    requiresApproval: true,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  sick_child: {
    id: 'sick_child',
    requiresApproval: false,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  work_from_home: {
    id: 'work_from_home',
    requiresApproval: false,
    affectsCalendar: false,
    affectsSlackStatus: false,
    affectsCinode: false,
    durationType: 'days',
  },
  knowledge_time: {
    id: 'knowledge_time',
    requiresApproval: true,
    affectsCalendar: false,
    affectsSlackStatus: false,
    affectsCinode: false,
    durationType: 'days',
  },
  flex_time: {
    id: 'flex_time',
    requiresApproval: false,
    affectsCalendar: false,
    affectsSlackStatus: false,
    affectsCinode: false,
    durationType: 'hours',
  },
  paid_leave: {
    id: 'paid_leave',
    requiresApproval: true,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  unpaid_leave: {
    id: 'unpaid_leave',
    requiresApproval: true,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  care_relative: {
    id: 'care_relative',
    requiresApproval: true,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
  military_duties: {
    id: 'military_duties',
    requiresApproval: false,
    affectsCalendar: true,
    affectsSlackStatus: true,
    affectsCinode: true,
    durationType: 'days',
  },
};

export function getAbsenceTypeConfig(typeId: string): AbsenceTypeConfig | null {
  return absenceTypes[typeId as AbsenceType] || null;
}
