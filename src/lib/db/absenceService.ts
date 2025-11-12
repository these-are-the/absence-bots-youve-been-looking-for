import { getDatabase } from './index';
import { AbsenceRequest, CreateAbsenceRequestInput, UpdateAbsenceRequestInput } from '@/types/absence';

export async function createAbsenceRequest(
  input: CreateAbsenceRequestInput
): Promise<AbsenceRequest> {
  const db = await getDatabase();
  
  if (!db.absences) {
    throw new Error('Absences collection not available');
  }
  
  const absence: AbsenceRequest = {
    id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.absences.insert(absence);
  return absence;
}

export async function getAbsenceRequest(id: string): Promise<AbsenceRequest | null> {
  try {
    const db = await getDatabase();
    if (!db.absences) {
      return null;
    }
    const result = await db.absences.findOne(id).exec();
    return result ? result.toJSON() : null;
  } catch (error) {
    console.error('Error getting absence request:', error);
    return null;
  }
}

export async function updateAbsenceRequest(
  id: string,
  updates: UpdateAbsenceRequestInput
): Promise<AbsenceRequest | null> {
  try {
    const db = await getDatabase();
    if (!db.absences) {
      return null;
    }
    const doc = await db.absences.findOne(id).exec();
    
    if (!doc) {
      return null;
    }

    // Build update data object
    const updateData: Partial<AbsenceRequest> = {
      updatedAt: new Date().toISOString(),
    };

    // Add status update if provided
    if (updates.status) {
      updateData.status = updates.status;
    }

    // Add timestamp fields based on status
    if (updates.status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    } else if (updates.status === 'denied') {
      updateData.deniedAt = new Date().toISOString();
    } else if (updates.status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
    }

    // Add note if provided
    if (updates.note !== undefined) updateData.note = updates.note;

    // Use RxDB's update method with $set operator
    await doc.incrementalPatch(updateData);
    return doc.toJSON();
  } catch (error) {
    console.error('Error updating absence request:', error);
    return null;
  }
}

export async function deleteAbsenceRequest(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (!db.absences) {
      return false;
    }
    const doc = await db.absences.findOne(id).exec();
    
    if (!doc) {
      return false;
    }

    await doc.incrementalPatch({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error deleting absence request:', error);
    return false;
  }
}

export async function listAbsenceRequests(filters: {
  userId?: string;
  userEmail?: string;
  department?: string;
  managerEmail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AbsenceRequest[]> {
  try {
    const db = await getDatabase();
    if (!db.absences) {
      return [];
    }
    
    // Build selector object for query using Mango query syntax
    const selector: any = {};
    
    if (filters.userId) {
      selector.userId = filters.userId;
    }
    if (filters.userEmail) {
      selector.userEmail = filters.userEmail;
    }
    if (filters.department) {
      selector.office = filters.department;
    }
    if (filters.managerEmail) {
      selector.managerEmail = filters.managerEmail;
    }
    if (filters.status) {
      selector.status = filters.status;
    }
    
    // Handle date range filters using Mango query operators
    if (filters.startDate || filters.endDate) {
      selector.startDate = {};
      if (filters.startDate) {
        selector.startDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        selector.startDate.$lte = filters.endDate;
      }
    }
    
    const query = db.absences.find({
      selector,
    });

    const results = await query.exec();
    return results.map(doc => doc.toJSON());
  } catch (error) {
    console.error('Error listing absence requests:', error);
    return [];
  }
}

export function observeAbsenceRequests(filters: {
  managerEmail?: string;
  status?: string;
}) {
  return async function* () {
    const db = await getDatabase();
    const selector: any = {};
    
    if (filters.managerEmail) {
      selector.managerEmail = filters.managerEmail;
    }
    if (filters.status) {
      selector.status = filters.status;
    }

    const query = db.absences.find({
      selector,
    });

    const results = await query.exec();
    for (const doc of results) {
      yield doc.toJSON();
    }
  };
}
