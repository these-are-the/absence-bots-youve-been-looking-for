import { RxJsonSchema } from 'rxdb';

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const roleSchema: RxJsonSchema<Role> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
  },
  required: ['id', 'name', 'createdAt', 'updatedAt'],
  indexes: ['name'],
};
