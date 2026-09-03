import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../config/api';

const PAGE_PRIVILEGES_LIST = [
  { key: 'canViewOverview', label: '📊 Dashboard Overview', path: '/dashboard/overview' },
  { key: 'canViewUsers', label: '🔑 User Accounts', path: '/dashboard/users' },
  { key: 'canViewEmployees', label: '👥 Employee Directory', path: '/dashboard/employees' },
  { key: 'canViewProjects', label: '📁 Projects & Modules', path: '/dashboard/projects' },
  { key: 'canViewTeams', label: '🏢 Teams & Tasks', path: '/dashboard/teams' },
  { key: 'canViewTimeTracker', label: '⏱️ Time Tracker', path: '/dashboard/time-tracker' },
  { key: 'canViewReviews', label: '✅ Task Approvals Queue', path: '/dashboard/reviews' },
  { key: 'canViewDailyPlans', label: '📅 Daily Work Plans', path: '/dashboard/daily-plans' },
  { key: 'canViewAnalytics', label: '📈 Performance & Reports', path: '/dashboard/analytics' },
  { key: 'canViewAuditLogs', label: '🛡️ System Audit Logs', path: '/dashboard/audit-logs' },
  { key: 'canViewSettings', label: '⚙️ System Settings', path: '/dashboard/settings' }
];

export default function SettingsPage({ currentUser }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    label: '',
    defaultPermissions: {
      canViewOverview: 'write',
      canViewUsers: 'none',
      canViewEmployees: 'none',
      canViewProjects: 'write',
      canViewTeams: 'write',
      canViewTimeTracker: 'write',
      canViewReviews: 'read',
      canViewDailyPlans: 'read',
      canViewAnalytics: 'read',
      canViewAuditLogs: 'none',
      canViewSettings: 'none'
    }
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/roles');
      setRoles(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const setRolePermissionLevel = (roleId, permissionKey, level) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) => {
        if (r._id === roleId) {
          return {
            ...r,
            defaultPermissions: {
              ...r.defaultPermissions,
              [permissionKey]: level
            }
          };
        }
        return r;
      })
    );
  };

  const setBulkRolePermissions = (roleId, level) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) => {
        if (r._id === roleId) {
          const updated = { ...r.defaultPermissions };
          PAGE_PRIVILEGES_LIST.forEach((p) => {
            updated[p.key] = level;
          });
          return { ...r, defaultPermissions: updated };
        }
        return r;
      })
    );
  };

  const handleSaveRoleDefaults = async (role) => {
    setSavingRoleId(role._id);
    try {
      await fetchApi(`/roles/${role._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          label: role.label,
          defaultPermissions: role.defaultPermissions
        })
      });
      alert(`Default page access privileges for role '${role.label}' saved successfully!`);
    } catch (err) {
      alert(`Failed to save role defaults: ${err.message}`);
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete the role '${role.label}'?`)) return;
    try {
      await fetchApi(`/roles/${role._id}`, { method: 'DELETE' });
      loadRoles();
    } catch (err) {
      alert(`Failed to delete role: ${err.message}`);
    }
  };

  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/roles', {
        method: 'POST',
        body: JSON.stringify(newRoleForm)
      });
      setShowRoleModal(false);
      setNewRoleForm({
        name: '',
        label: '',
        defaultPermissions: {
          canViewOverview: 'write',
          canViewUsers: 'none',
          canViewEmployees: 'none',
          canViewProjects: 'write',
          canViewTeams: 'write',
          canViewTimeTracker: 'write',
          canViewReviews: 'read',
          canViewDailyPlans: 'read',
          canViewAnalytics: 'read',
          canViewAuditLogs: 'none',
          canViewSettings: 'none'
        }
      });
      loadRoles();
    } catch (err) {
      alert(`Failed to create custom role: ${err.message}`);
    }
  };

  const setBulkNewRolePermissions = (level) => {
    const updated = { ...newRoleForm.defaultPermissions };
    PAGE_PRIVILEGES_LIST.forEach((p) => {
      updated[p.key] = level;
    });
    setNewRoleForm({ ...newRoleForm, defaultPermissions: updated });
  };

  return (
    <div className="space-y-4">
      {(currentUser?.role === 'superior' || currentUser?.role === 'superadmin') && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowRoleModal(true)}
            className="px-4 py-2 bg-[#20b875] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#169e63]"
          >
            + Add Custom Role
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-gray-500">Loading role configurations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const isSuperAdmin = role.name === 'superadmin';
            const perms = role.defaultPermissions || {};

            return (
              <div key={role._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                  <div>
                    <span className="text-sm font-bold text-[#09233d]">{role.label || role.name}</span>
                    <small className="text-gray-400 block font-mono text-[10px]">key: {role.name}</small>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      role.isSystem ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {role.isSystem ? 'System Role' : 'Custom Role'}
                    </span>
                    {!isSuperAdmin && (currentUser?.role === 'superior' || currentUser?.role === 'superadmin') && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>

                {isSuperAdmin ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold space-y-1">
                    <p className="font-bold">👑 SuperAdmin Default Access</p>
                    <p className="text-[11px] text-amber-800">SuperAdmin possesses permanent full Read & Write privileges across all system pages.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Master Bulk Control Bar */}
                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                      <span className="font-bold text-gray-700 text-[11px]">Master Toggles:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBulkRolePermissions(role._id, 'read')}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200"
                        >
                          👁️ All Read
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkRolePermissions(role._id, 'write')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200"
                        >
                          ✏️ All Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkRolePermissions(role._id, 'none')}
                          className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[10px] font-bold"
                        >
                          🚫 Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs max-h-[350px] overflow-y-auto pr-1">
                      {PAGE_PRIVILEGES_LIST.map((page) => {
                        const rawVal = perms[page.key];
                        const currentLevel = rawVal === 'write' || rawVal === true ? 'write' : (rawVal === 'read' ? 'read' : 'none');

                        return (
                          <div key={page.key} className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl hover:bg-gray-100/60 border border-gray-100">
                            <div>
                              <span className="font-bold text-gray-900 block">{page.label}</span>
                              <small className="text-gray-400 font-mono text-[10px]">{page.path}</small>
                            </div>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setRolePermissionLevel(role._id, page.key, 'none')}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  currentLevel === 'none' ? 'bg-gray-300 text-gray-800 shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                None
                              </button>
                              <button
                                type="button"
                                onClick={() => setRolePermissionLevel(role._id, page.key, 'read')}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  currentLevel === 'read' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                Read
                              </button>
                              <button
                                type="button"
                                onClick={() => setRolePermissionLevel(role._id, page.key, 'write')}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  currentLevel === 'write' ? 'bg-[#20b875] text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                Write
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isSuperAdmin && (currentUser?.role === 'superior' || currentUser?.role === 'superadmin') && (
                  <div className="pt-2 border-t flex justify-end">
                    <button
                      onClick={() => handleSaveRoleDefaults(role)}
                      disabled={savingRoleId === role._id}
                      className="px-4 py-2 bg-[#20b875] hover:bg-[#169e63] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-60"
                    >
                      {savingRoleId === role._id ? 'Saving Defaults...' : 'Save Role Defaults'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#09233d] mb-4">Add Custom System Role</h3>
            <form onSubmit={handleCreateCustomRole} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Role Title / Label</label>
                <input
                  type="text"
                  required
                  value={newRoleForm.label}
                  onChange={(e) => {
                    const lbl = e.target.value;
                    const nm = lbl.toLowerCase().replace(/\s+/g, '_');
                    setNewRoleForm({ ...newRoleForm, label: lbl, name: nm });
                  }}
                  placeholder="e.g. Project Manager"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:border-[#20b875] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Role Identifier Key</label>
                <input
                  type="text"
                  readOnly
                  value={newRoleForm.name}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-xs font-mono text-gray-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase">Default Page Access Privileges</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setBulkNewRolePermissions('read')}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded"
                    >
                      All Read
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkNewRolePermissions('write')}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded"
                    >
                      All Write
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                  {PAGE_PRIVILEGES_LIST.map((page) => {
                    const level = newRoleForm.defaultPermissions[page.key] || 'none';
                    return (
                      <div key={page.key} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-800">{page.label}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setNewRoleForm({
                              ...newRoleForm,
                              defaultPermissions: { ...newRoleForm.defaultPermissions, [page.key]: 'none' }
                            })}
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${level === 'none' ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-500'}`}
                          >
                            None
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoleForm({
                              ...newRoleForm,
                              defaultPermissions: { ...newRoleForm.defaultPermissions, [page.key]: 'read' }
                            })}
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${level === 'read' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
                          >
                            Read
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoleForm({
                              ...newRoleForm,
                              defaultPermissions: { ...newRoleForm.defaultPermissions, [page.key]: 'write' }
                            })}
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${level === 'write' ? 'bg-[#20b875] text-white' : 'bg-emerald-50 text-emerald-700'}`}
                          >
                            Write
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#20b875] text-white rounded-xl text-xs font-bold hover:bg-[#169e63]"
                >
                  Create Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
