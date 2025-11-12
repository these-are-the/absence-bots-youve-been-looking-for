import { RxJsonSchema } from 'rxdb';
import { AbsenceRequest } from '@/types/absence';

export const absenceRequestSchema: RxJsonSchema<AbsenceRequest> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    userId: {
      type: 'string',
    },
    userEmail: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    office: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
    hours: {
      type: 'number',
    },
    days: {
      type: 'number',
    },
    note: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
    managerEmail: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
    approvedAt: {
      type: 'string',
    },
    deniedAt: {
      type: 'string',
    },
    cancelledAt: {
      type: 'string',
    },
  },
  required: ['id', 'userId', 'userEmail', 'type', 'office', 'startDate', 'status', 'createdAt', 'updatedAt'],
  indexes: ['userId', 'userEmail', 'managerEmail', 'status', 'startDate', 'office'],
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager';
  managerEmail?: string;
  office: string;
  teams?: string[]; // Array of tag names
  createdAt: string;
  updatedAt?: string;
}

export const userSchema: RxJsonSchema<User> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    email: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    role: {
      type: 'string',
    },
    managerEmail: {
      type: 'string',
    },
    office: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
    teams: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['id', 'email', 'name', 'role', 'office', 'createdAt'],
  indexes: ['email', 'role', 'managerEmail', 'office'],
};
