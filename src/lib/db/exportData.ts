import { getDatabase } from './index';
import { AbsenceRequest } from './schema';
import { User } from './schema';
import { Role } from './roleSchema';

/**
 * Exports all data from IndexedDB and displays it in the console using console.table
 * This is useful for debugging and copying current data state
 */
export async function exportAllDataToConsole(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Get all absences
    const absences = db.absences ? await db.absences.find().exec() : [];
    const absenceData = absences.map((doc: any) => doc.toJSON());
    
    // Get all users
    const users = db.users ? await db.users.find().exec() : [];
    const userData = users.map((doc: any) => doc.toJSON());
    
    // Get all roles
    const roles = db.roles ? await db.roles.find().exec() : [];
    const roleData = roles.map((doc: any) => doc.toJSON());
    
    console.log('=== IndexedDB Data Export ===');
    console.log(`Total Absences: ${absenceData.length}`);
    console.log(`Total Users: ${userData.length}`);
    console.log(`Total Roles: ${roleData.length}`);
    console.log('');
    
    if (absenceData.length > 0) {
      console.log('--- Absences ---');
      console.table(absenceData);
    } else {
      console.log('--- Absences: No data ---');
    }
    
    console.log('');
    
    if (userData.length > 0) {
      console.log('--- Users ---');
      console.table(userData);
    } else {
      console.log('--- Users: No data ---');
    }
    
    console.log('');
    
    if (roleData.length > 0) {
      console.log('--- Roles ---');
      console.table(roleData);
    } else {
      console.log('--- Roles: No data ---');
    }
    
    console.log('');
    console.log('=== End of Export ===');
    
    // Also log as JSON for easy copying
    console.log('--- JSON Export (for copying) ---');
    console.log(JSON.stringify({
      absences: absenceData,
      users: userData,
      roles: roleData,
    }, null, 2));
    
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}
