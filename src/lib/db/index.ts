import { createRxDatabase, RxDatabase, RxCollection, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { absenceRequestSchema } from './schema';
import { AbsenceRequest } from '@/types/absence';
import { userSchema, User } from './schema';
import { roleSchema, Role } from './roleSchema';

// Add required plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

export type DatabaseCollections = {
  absences: RxCollection<AbsenceRequest>;
  users: RxCollection<User>;
  roles: RxCollection<Role>;
};

export type Database = RxDatabase<DatabaseCollections>;

let databaseInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (databaseInstance) {
    return databaseInstance;
  }

  const storage = getRxStorageDexie();

  databaseInstance = await createRxDatabase<DatabaseCollections>({
    name: 'vacaybot',
    storage,
    ignoreDuplicate: true,
  });

  // Create collections
  const collections = await databaseInstance.addCollections({
    absences: {
      schema: absenceRequestSchema,
    },
    users: {
      schema: userSchema,
    },
    roles: {
      schema: roleSchema,
    },
  });

  // Verify collections were created - use the returned collections object
  if (!collections.users || !collections.absences || !collections.roles) {
    throw new Error('Failed to create database collections');
  }

  // Ensure collections are available on the database instance
  if (!databaseInstance.users || !databaseInstance.absences || !databaseInstance.roles) {
    // Collections might not be immediately available, wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!databaseInstance.users || !databaseInstance.absences || !databaseInstance.roles) {
      throw new Error('Database collections not available after initialization');
    }
  }

  // Initialize demo data if database is empty
  try {
    const usersCount = await databaseInstance.users.count().exec();
    const absencesCount = await databaseInstance.absences.count().exec();
    const rolesCount = await databaseInstance.roles.count().exec();
    
    if (usersCount === 0 && absencesCount === 0) {
      await initializeDemoData(databaseInstance);
    }
    
    // Initialize default roles if none exist
    if (rolesCount === 0) {
      await initializeDefaultRoles(databaseInstance);
    }
  } catch (error) {
    console.error('Error checking/initializing demo data:', error);
    // Try to initialize anyway if count fails
    try {
      const usersCount = await databaseInstance.users.count().exec();
      const absencesCount = await databaseInstance.absences.count().exec();
      if (usersCount === 0 && absencesCount === 0) {
        await initializeDemoData(databaseInstance);
      }
      
      const rolesCount = await databaseInstance.roles.count().exec();
      if (rolesCount === 0) {
        await initializeDefaultRoles(databaseInstance);
      }
    } catch (initError) {
      console.error('Error initializing demo data:', initError);
    }
  }

  return databaseInstance;
}

async function initializeDemoData(db: Database) {
  const now = '2025-11-11T22:55:29.924Z';
  
  // Initialize demo users
  await db.users.insert({
    id: 'demo-employee-1',
    email: 'employee@demo.com',
    name: 'Demo Employee',
    role: 'employee',
    managerEmail: 'manager@demo.com',
    office: 'ljubljana',
    createdAt: now,
  });

  await db.users.insert({
    id: 'demo-manager-1',
    email: 'manager@demo.com',
    name: 'Demo Manager',
    role: 'manager',
    office: 'ljubljana',
    createdAt: now,
  });

  // Initialize demo absence requests
  await db.absences.insert({
    id: 'abs_1762902314011_fmgqo8zsq',
    userId: 'employee@demo.com',
    userEmail: 'employee@demo.com',
    type: 'vacation',
    office: 'ljubljana',
    startDate: '2025-11-15',
    endDate: '2025-11-23',
    managerEmail: 'manager@demo.com',
    status: 'approved',
    createdAt: '2025-11-11T23:05:14.011Z',
    updatedAt: '2025-11-11T23:13:44.571Z',
    approvedAt: '2025-11-11T23:13:44.571Z',
  });

  await db.absences.insert({
    id: 'abs_1762903173668_13geoe102',
    userId: 'employee@demo.com',
    userEmail: 'employee@demo.com',
    type: 'sick_child',
    office: 'ljubljana',
    startDate: '2025-11-14',
    endDate: '2025-11-17',
    note: 'test',
    managerEmail: 'manager@demo.com',
    status: 'pending',
    createdAt: '2025-11-11T23:19:33.668Z',
    updatedAt: '2025-11-11T23:19:33.668Z',
  });
}

async function initializeDefaultRoles(db: Database) {
  const now = new Date().toISOString();
  
  await db.roles.insert({
    id: 'role_manager',
    name: 'Manager',
    createdAt: now,
    updatedAt: now,
  });

  await db.roles.insert({
    id: 'role_employee',
    name: 'Employee',
    createdAt: now,
    updatedAt: now,
  });

  await db.roles.insert({
    id: 'role_admin',
    name: 'Admin',
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Manually trigger database seeding
 * This can be called via keyboard shortcut to re-seed the database
 */
export async function seedDatabase(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await db.users.find().remove();
    // await db.absences.find().remove();
    // await db.roles.find().remove();
    
    // Check what needs to be seeded
    const usersCount = await db.users.count().exec();
    const absencesCount = await db.absences.count().exec();
    const rolesCount = await db.roles.count().exec();
    
    if (usersCount === 0 && absencesCount === 0) {
      await initializeDemoData(db);
      console.log('✅ Seeded demo users and absence requests');
    } else {
      console.log('ℹ️ Users/absences already exist, skipping demo data seed');
    }
    
    if (rolesCount === 0) {
      await initializeDefaultRoles(db);
      console.log('✅ Seeded default roles (Manager, Employee, Admin)');
    } else {
      console.log('ℹ️ Roles already exist, skipping role seed');
    }
    
    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (databaseInstance) {
    await databaseInstance.destroy();
    databaseInstance = null;
  }
}
