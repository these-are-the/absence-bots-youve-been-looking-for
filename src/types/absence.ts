import { AbsenceType } from '@/config/absenceTypes';
import { Office } from '@/config/offices';

export type AbsenceStatus = 'pending' | 'sent' | 'approved' | 'denied' | 'cancelled';

export interface AbsenceRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: AbsenceType;
  office: Office;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string (optional for single day)
  hours?: number; // For hour-based requests
  days?: number; // For day-based requests
  note?: string;
  status: AbsenceStatus;
  managerEmail?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  approvedAt?: string; // ISO datetime string
  deniedAt?: string; // ISO datetime string
  cancelledAt?: string; // ISO datetime string
}

export interface CreateAbsenceRequestInput {
  userId: string;
  userEmail: string;
  type: AbsenceType;
  office: Office;
  startDate: string;
  endDate?: string;
  hours?: number;
  days?: number;
  note?: string;
  managerEmail?: string;
}

export interface UpdateAbsenceRequestInput {
  status?: AbsenceStatus;
  note?: string;
}
