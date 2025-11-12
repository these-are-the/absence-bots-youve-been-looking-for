import { getDatabase } from './index';
import { Role } from './roleSchema';

export async function createRole(name: string): Promise<Role> {
  const db = await getDatabase();
  
  if (!db.roles) {
    throw new Error('Roles collection not available');
  }
  
  const trimmedName = name.trim();
  
  // Check if role with this name already exists
  const existing = await getRoleByName(trimmedName);
  if (existing) {
    throw new Error(`Role with name "${trimmedName}" already exists`);
  }
  
  const now = new Date().toISOString();
  const role: Role = {
    id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: trimmedName,
    createdAt: now,
    updatedAt: now,
  };

  await db.roles.insert(role);
  return role;
}

export async function getAllRoles(): Promise<Role[]> {
  const db = await getDatabase();
  if (!db.roles) {
    return [];
  }
  
  const roles = await db.roles.find().exec();
  return roles.map((doc: any) => doc.toJSON());
}

export async function getRoleById(id: string): Promise<Role | null> {
  try {
    const db = await getDatabase();
    if (!db.roles) {
      return null;
    }
    
    const role = await db.roles.findOne(id).exec();
    return role ? role.toJSON() : null;
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
}

export async function getRoleByName(name: string): Promise<Role | null> {
  try {
    const db = await getDatabase();
    if (!db.roles) {
      return null;
    }
    
    const role = await db.roles.findOne({
      selector: {
        name: name.trim(),
      },
    }).exec();
    return role ? role.toJSON() : null;
  } catch (error) {
    console.error('Error getting role by name:', error);
    return null;
  }
}

export async function renameRole(oldName: string, newName: string): Promise<Role | null> {
  try {
    const db = await getDatabase();
    if (!db.roles) {
      return null;
    }
    
    const role = await db.roles.findOne({
      selector: {
        name: oldName.trim(),
      },
    }).exec();
    
    if (!role) {
      return null;
    }
    
    // Update role name
    await role.update({
      $set: {
        name: newName.trim(),
        updatedAt: new Date().toISOString(),
      },
    });
    
    // Update all users that have this role
    if (db.users) {
      const allUsers = await db.users.find().exec();
      
      for (const userDoc of allUsers) {
        const user = userDoc.toJSON();
        if ((user.teams || []).includes(oldName.trim())) {
          const updatedTeams = user.teams?.map((team: string) => 
            team === oldName.trim() ? newName.trim() : team
          ) || [];
          
          await userDoc.update({
            $set: {
              teams: updatedTeams,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }
    }
    
    return role.toJSON();
  } catch (error) {
    console.error('Error renaming role:', error);
    return null;
  }
}

export async function deleteRole(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (!db.roles) {
      return false;
    }
    
    const role = await db.roles.findOne(id).exec();
    if (!role) {
      return false;
    }
    
    // Remove role from all users
    if (db.users) {
      const roleName = role.toJSON().name;
      const allUsers = await db.users.find().exec();
      
      for (const userDoc of allUsers) {
        const user = userDoc.toJSON();
        if ((user.teams || []).includes(roleName)) {
          const updatedTeams = user.teams?.filter((team: string) => team !== roleName) || [];
          
          await userDoc.update({
            $set: {
              teams: updatedTeams,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }
    }
    
    await role.remove();
    return true;
  } catch (error) {
    console.error('Error deleting role:', error);
    return false;
  }
}

export async function getRoleUsageCount(roleName: string): Promise<number> {
  try {
    const db = await getDatabase();
    if (!db.users) {
      return 0;
    }
    
    const allUsers = await db.users.find().exec();
    const usersWithRole = allUsers.filter((doc: any) => {
      const user = doc.toJSON();
      return (user.teams || []).includes(roleName);
    });
    
    return usersWithRole.length;
  } catch (error) {
    console.error('Error getting role usage count:', error);
    return 0;
  }
}
