import { getDatabase } from './index';
import { User } from './schema';

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    if (!db.users) {
      console.error('Users collection not available');
      return null;
    }
    const result = await db.users.findOne({
      selector: {
        email: email,
      },
    }).exec();
    
    return result ? result.toJSON() as User : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDatabase();
  const result = await db.users.findOne(id).exec();
  return result ? result.toJSON() as User : null;
}

export async function getAllManagers(): Promise<User[]> {
  const db = await getDatabase();
  const results = await db.users.find({
    selector: {
      role: 'manager',
    },
  }).exec();
  
  return results.map(doc => doc.toJSON() as User);
}

export async function getEmployeesByManager(managerEmail: string): Promise<User[]> {
  const db = await getDatabase();
  const results = await db.users.find({
    selector: {
      role: 'employee',
      managerEmail: managerEmail,
    },
  }).exec();
  
  return results.map(doc => doc.toJSON() as User);
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const db = await getDatabase();
  
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  await db.users.insert(newUser);
  return newUser;
}

export async function listUsers(): Promise<User[]> {
  const db = await getDatabase();
  if (!db.users) {
    return [];
  }
  
  const users = await db.users.find().exec();
  return users.map((doc: any) => doc.toJSON() as User);
}

export async function updateUserTeams(userId: string, teams: string[]): Promise<User | null> {
  try {
    const db = await getDatabase();
    if (!db.users) {
      return null;
    }
    
    const user = await db.users.findOne(userId).exec();
    if (!user) {
      return null;
    }
    
    await user.update({
      $set: {
        teams: teams,
        updatedAt: new Date().toISOString(),
      },
    });
    
    return user.toJSON() as User;
  } catch (error) {
    console.error('Error updating user teams:', error);
    return null;
  }
}
