'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AbsenceRequest } from '@/types/absence';
// Manager dashboard is English-only for simplicity
import type { Language } from '@/lib/i18n';
import { TypeformButton } from './TypeformButton';
import { format, parseISO } from 'date-fns';
import { absenceTypes } from '@/config/absenceTypes';
import { offices } from '@/config/offices';
import { listAbsenceRequests, updateAbsenceRequest } from '@/lib/db/absenceService';
import { getDatabase } from '@/lib/db/index';
import { getGroupedHolidays, GroupedHoliday } from '@/lib/holidays';
import { TypeformStep } from './TypeformStep';
import { listUsers, updateUserTeams } from '@/lib/db/userService';
import { User } from '@/lib/db/schema';
import { createRole, getAllRoles, renameRole, getRoleUsageCount } from '@/lib/db/roleService';
import { Role } from '@/lib/db/roleSchema';

interface ManagerDashboardProps {
  managerEmail: string;
  language: Language; // Not used - dashboard is English-only
  onLogout: () => void;
}

// English-only translations for manager dashboard
const absenceTypeNames: Record<string, string> = {
  vacation: 'Vacation',
  sick_leave: 'Sick Leave',
  parental_leave: 'Parental Leave',
  sick_child: 'Care for sick child',
  work_from_home: 'Work from Home',
  knowledge_time: 'Knowledge Time',
  flex_time: 'Flex Time',
  paid_leave: 'Paid Leave',
  unpaid_leave: 'Unpaid Leave',
  care_relative: 'Care of Close Relative',
  military_duties: 'Military Duties',
};

const statusNames: Record<string, string> = {
  pending: 'Pending',
  sent: 'Sent',
  approved: 'Approved',
  denied: 'Denied',
  cancelled: 'Cancelled',
};

export function ManagerDashboard({ managerEmail, language, onLogout }: ManagerDashboardProps) {
  const [allRequests, setAllRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');
  const [showHolidays, setShowHolidays] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleUsageCounts, setRoleUsageCounts] = useState<Record<string, number>>({});
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [renameNewRole, setRenameNewRole] = useState('');
  const [roleToggleLoading, setRoleToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any = null;
    let intervalId: NodeJS.Timeout | null = null;
    
    // Initialize database and set up reactive subscription for ALL requests
    // This ensures counts are always accurate
    const initAndSubscribe = async () => {
      try {
        const db = await getDatabase(); // Ensure database is initialized
        
        if (db.absences) {
          // Subscribe to ALL requests for this manager (no status filter)
          // This ensures filter counts are always accurate
          const selector = {
            managerEmail: managerEmail,
          };
          
          console.log('Setting up subscription for all requests, manager:', managerEmail);
          
          const query = db.absences.find({
            selector,
          });
          
          // Subscribe to reactive updates - this will automatically update when data changes
          subscription = query.$.subscribe((results) => {
            const requests = results.map((doc: any) => doc.toJSON());
            console.log('Subscription update - all requests count:', requests.length, 'statuses:', requests.map(r => `${r.id}:${r.status}`));
            setAllRequests(requests);
            setLoading(false);
          });
        } else {
          // Fallback to polling if reactive updates fail
          const loadAllRequests = async () => {
            try {
              const requests = await listAbsenceRequests({
                managerEmail,
              });
              setAllRequests(requests);
            } catch (error) {
              console.error('Error loading requests:', error);
            } finally {
              setLoading(false);
            }
          };
          await loadAllRequests();
          intervalId = setInterval(loadAllRequests, 2000);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        // Fallback to polling
        const loadAllRequests = async () => {
          try {
            const requests = await listAbsenceRequests({
              managerEmail,
            });
            setAllRequests(requests);
          } catch (error) {
            console.error('Error loading requests:', error);
          } finally {
            setLoading(false);
          }
        };
        await loadAllRequests();
        intervalId = setInterval(loadAllRequests, 2000);
      }
    };
    
    initAndSubscribe();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [managerEmail]);

  const handleApprove = async (requestId: string) => {
    try {
      await updateAbsenceRequest(requestId, { status: 'approved' });
      // Don't call loadRequests - the reactive subscription will update automatically
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await updateAbsenceRequest(requestId, { status: 'denied' });
      // Don't call loadRequests - the reactive subscription will update automatically
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  // Filter requests based on selected filter for display
  const filteredRequests = filter === 'all' 
    ? allRequests 
    : filter === 'pending'
    ? allRequests.filter(r => r.status === 'pending' || r.status === 'sent')
    : allRequests.filter(r => r.status === filter);

  const pendingRequests = allRequests.filter(r => r.status === 'pending' || r.status === 'sent');
  const approvedRequests = allRequests.filter(r => r.status === 'approved');
  const deniedRequests = allRequests.filter(r => r.status === 'denied');

  // Load users when showing users list
  useEffect(() => {
    if (showUsers || showRoleManagement) {
      const loadUsers = async () => {
        try {
          const allUsers = await listUsers();
          setUsers(allUsers);
        } catch (error) {
          console.error('Error loading users:', error);
        }
      };
      loadUsers();
    }
  }, [showUsers, showRoleManagement]);

  // Load roles when showing role management
  useEffect(() => {
    if (showRoleManagement) {
      const loadRoles = async () => {
        try {
          const allRoles = await getAllRoles();
          setRoles(allRoles);
          
          // Load usage counts for each role
          const counts: Record<string, number> = {};
          for (const role of allRoles) {
            counts[role.name] = await getRoleUsageCount(role.name);
          }
          setRoleUsageCounts(counts);
        } catch (error) {
          console.error('Error loading roles:', error);
        }
      };
      loadRoles();
    }
  }, [showRoleManagement]);

  // Load roles when showing user detail
  useEffect(() => {
    if (selectedUser) {
      const loadRoles = async () => {
        try {
          const allRoles = await getAllRoles();
          setRoles(allRoles);
        } catch (error) {
          console.error('Error loading roles:', error);
        }
      };
      loadRoles();
    }
  }, [selectedUser]);

  const handleToggleUserRole = async (roleName: string) => {
    if (!selectedUser || roleToggleLoading) return;
    
    setRoleToggleLoading(roleName);
    
    // Optimistically update UI first
    const currentTeams = selectedUser.teams || [];
    const newTeams = currentTeams.includes(roleName)
      ? currentTeams.filter(t => t !== roleName)
      : [...currentTeams, roleName];
    
    const optimisticUser = { ...selectedUser, teams: newTeams };
    setSelectedUser(optimisticUser);
    setUsers(users.map(u => u.id === selectedUser.id ? optimisticUser : u));
    
    try {
      // Then sync to database
      await updateUserTeams(selectedUser.id, newTeams);
    } catch (error) {
      console.error('Failed to update user teams:', error);
      // Revert on error
      setSelectedUser(selectedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    } finally {
      setRoleToggleLoading(null);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    
    try {
      await createRole(newRoleName.trim());
      setNewRoleName('');
      setShowAddRole(false);
      // Reload roles
      const allRoles = await getAllRoles();
      setRoles(allRoles);
      
      // Reload usage counts
      const counts: Record<string, number> = {};
      for (const role of allRoles) {
        counts[role.name] = await getRoleUsageCount(role.name);
      }
      setRoleUsageCounts(counts);
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role. It may already exist.');
    }
  };

  const handleRenameRole = async () => {
    if (!selectedRole || !renameNewRole.trim()) return;
    
    try {
      const renamed = await renameRole(selectedRole.name, renameNewRole.trim());
      if (renamed) {
        setRenameNewRole('');
        setSelectedRole(null);
        // Reload roles
        const allRoles = await getAllRoles();
        setRoles(allRoles);
        
        // Reload usage counts
        const counts: Record<string, number> = {};
        for (const role of allRoles) {
          counts[role.name] = await getRoleUsageCount(role.name);
        }
        setRoleUsageCounts(counts);
        
        // Update selected user if they had the old role
        if (selectedUser) {
          const updated = await listUsers();
          const user = updated.find(u => u.id === selectedUser.id);
          if (user) setSelectedUser(user);
        }
      } else {
        alert('Failed to rename role. Role may not exist.');
      }
    } catch (error) {
      console.error('Error renaming role:', error);
      alert('Failed to rename role.');
    }
  };

  // Keyboard handler for holidays and backspace navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === '2' && !showHolidays && !showUsers && !showRoleManagement && !selectedUser && !selectedRole && !showAddRole) {
        e.preventDefault();
        setShowHolidays(true);
      } else if (e.key === '1' && showRoleManagement && !selectedRole && !showAddRole) {
        e.preventDefault();
        setShowAddRole(true);
      } else if ((e.key === 'Escape' || e.key === 'Backspace') && (showHolidays || showUsers || showRoleManagement || selectedUser || selectedRole || showAddRole)) {
        e.preventDefault();
        if (showAddRole) {
          setShowAddRole(false);
          setNewRoleName('');
        } else if (selectedRole) {
          setSelectedRole(null);
          setRenameNewRole('');
        } else if (selectedUser) {
          setSelectedUser(null);
        } else if (showRoleManagement) {
          setShowRoleManagement(false);
        } else if (showUsers) {
          setShowUsers(false);
        } else if (showHolidays) {
          setShowHolidays(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHolidays, showUsers, showRoleManagement, selectedUser, selectedRole, showAddRole]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!userSearchQuery.trim()) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      (user.teams || []).some(team => team.toLowerCase().includes(query))
    );
  });

  // User detail view
  if (selectedUser) {
    return (
      <TypeformStep title={`User: ${selectedUser.name}`}>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Email: {selectedUser.email}</p>
            <p className="text-sm text-gray-600 mb-2">Role: {selectedUser.role}</p>
            <p className="text-sm text-gray-600 mb-2">Office: {selectedUser.office}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Roles</h3>
            <div className="space-y-2">
              {roles.length === 0 ? (
                <p className="text-gray-500 text-sm">No roles available. Create roles in Role Management.</p>
              ) : (
                roles.map(role => {
                  const isSelected = (selectedUser.teams || []).includes(role.name);
                  const isLoading = roleToggleLoading === role.name;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleToggleUserRole(role.name)}
                      disabled={isLoading}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>{role.name} {isSelected && '✓'}</span>
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          
          <TypeformButton
            label="Back to User List"
            onClick={() => setSelectedUser(null)}
            variant="primary"
            autoFocus
          />
        </div>
      </TypeformStep>
    );
  }

  // Add Role view
  if (showRoleManagement && showAddRole) {
    return (
      <TypeformStep title="Add Role">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Create New Role</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRole();
                  }
                }}
                placeholder="Role name"
                className="flex-1 px-4 py-2 border rounded-lg"
                autoFocus
              />
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>

          <TypeformButton
            label="Back to Role List"
            onClick={() => {
              setShowAddRole(false);
              setNewRoleName('');
            }}
            variant="primary"
          />
        </div>
      </TypeformStep>
    );
  }

  // Role detail view (for renaming)
  if (showRoleManagement && selectedRole) {
    return (
      <TypeformStep title={`Role: ${selectedRole.name}`}>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Current name: <strong>{selectedRole.name}</strong></p>
            <p className="text-sm text-gray-600 mb-2">
              Used by {roleUsageCounts[selectedRole.name] || 0} user{roleUsageCounts[selectedRole.name] !== 1 ? 's' : ''}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Rename Role</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={renameNewRole}
                onChange={(e) => setRenameNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameRole();
                  }
                }}
                placeholder="New role name"
                className="w-full px-4 py-2 border rounded-lg"
                autoFocus
              />
              <button
                onClick={handleRenameRole}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Rename
              </button>
            </div>
          </div>

          <TypeformButton
            label="Back to Role List"
            onClick={() => {
              setSelectedRole(null);
              setRenameNewRole('');
            }}
            variant="primary"
          />
        </div>
      </TypeformStep>
    );
  }

  // Role management view
  if (showRoleManagement) {
    return (
      <TypeformStep title="Role Management">
        <div className="space-y-6">
          <TypeformButton
            label="Add Role"
            onClick={() => setShowAddRole(true)}
            variant="primary"
            shortcut="1"
            autoFocus
          />

          <div>
            <h3 className="text-lg font-semibold mb-3">Existing Roles</h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {roles.length === 0 ? (
                <p className="text-gray-500 text-sm">No roles created yet.</p>
              ) : (
                roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className="w-full text-left bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <span className="font-medium">{role.name}</span>
                    <span className="text-sm text-gray-600">
                      Used by {roleUsageCounts[role.name] || 0} user{roleUsageCounts[role.name] !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <TypeformButton
            label="Back to Dashboard"
            onClick={() => setShowRoleManagement(false)}
            variant="primary"
          />
        </div>
      </TypeformStep>
    );
  }

  // User list view
  if (showUsers) {
    return (
      <TypeformStep title="All Users">
        <div className="space-y-6">
          <div>
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full px-4 py-2 border rounded-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {userSearchQuery ? 'No users found matching your search.' : 'No users found.'}
              </p>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full text-left bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.teams && user.teams.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.teams.map(role => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <TypeformButton
            label="Back to Dashboard"
            onClick={() => {
              setShowUsers(false);
              setUserSearchQuery('');
            }}
            variant="primary"
          />
        </div>
      </TypeformStep>
    );
  }

  if (showHolidays) {
    const groupedHolidays = getGroupedHolidays(100);

    const getFlagEmoji = (office: 'ljubljana' | 'munich'): string => {
      return office === 'ljubljana' ? '🇸🇮' : '🇩🇪';
    };

    return (
      <TypeformStep title="Public Holidays">
        <div className="space-y-6">
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {groupedHolidays.map((holiday) => (
              <div key={holiday.date} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex gap-1 mt-1">
                    {holiday.offices.map(office => (
                      <span key={office} className="text-2xl">{getFlagEmoji(office)}</span>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      {holiday.displayName.en}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {format(parseISO(holiday.date), 'PPP')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <TypeformButton
            label="Close"
            onClick={() => setShowHolidays(false)}
            variant="primary"
            shortcut="2"
            autoFocus
          />
        </div>
      </TypeformStep>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">{managerEmail}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({approvedRequests.length})
            </button>
            <button
              onClick={() => setFilter('denied')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'denied'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Denied ({deniedRequests.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({allRequests.length})
            </button>
            <TypeformButton
              label="Show Public Holidays"
              onClick={() => setShowHolidays(true)}
              variant="outline"
              shortcut="2"
            />
            <TypeformButton
              label="List All Users"
              onClick={() => setShowUsers(true)}
              variant="outline"
            />
            <TypeformButton
              label="Manage Roles"
              onClick={() => setShowRoleManagement(true)}
              variant="outline"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-gray-600">
              {filter === 'pending' && 'No pending requests'}
              {filter === 'approved' && 'No approved requests'}
              {filter === 'denied' && 'No denied requests'}
              {filter === 'all' && 'No requests'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onDeny={() => handleDeny(request.id)}
                showActions={filter === 'pending'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RequestCardProps {
  request: AbsenceRequest;
  onApprove?: () => void;
  onDeny?: () => void;
  showActions: boolean;
}

function RequestCard({ request, onApprove, onDeny, showActions }: RequestCardProps) {
  const typeConfig = absenceTypes[request.type as keyof typeof absenceTypes];
  const officeConfig = offices[request.office as keyof typeof offices];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {request.userEmail}
          </h3>
          <p className="text-sm text-gray-600">
            {absenceTypeNames[request.type] || request.type} • {officeConfig?.name || request.office}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
          {statusNames[request.status] || request.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Start Date</p>
          <p className="font-medium">
            {format(parseISO(request.startDate), 'PPP')}
          </p>
        </div>
        {request.endDate && (
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">
              {format(parseISO(request.endDate), 'PPP')}
            </p>
          </div>
        )}
        {request.hours && (
          <div>
            <p className="text-sm text-gray-500">Hours</p>
            <p className="font-medium">{request.hours}</p>
          </div>
        )}
        {request.days && (
          <div>
            <p className="text-sm text-gray-500">Days</p>
            <p className="font-medium">{request.days}</p>
          </div>
        )}
      </div>

      {request.note && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Note</p>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.note}</p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <TypeformButton
            label="Yes - Approve"
            onClick={onApprove!}
            variant="primary"
          />
          <TypeformButton
            label="No - Deny"
            onClick={onDeny!}
            variant="outline"
          />
        </div>
      )}
    </motion.div>
  );
}
