const Role = require('../models/Role');
const { logAudit } = require('../services/auditService');

const DEFAULT_SYSTEM_ROLES = [
  {
    name: 'superadmin',
    label: 'SuperAdmin',
    isSystem: true,
    defaultPermissions: {
      canViewOverview: true,
      canViewUsers: true,
      canViewEmployees: true,
      canViewProjects: true,
      canViewTeams: true,
      canViewModules: true,
      canViewTasks: true,
      canViewTimeTracker: true,
      canViewReviews: true,
      canViewDailyPlans: true,
      canViewAnalytics: true,
      canViewReports: true,
      canViewAuditLogs: true,
      canViewSettings: true
    }
  },
  {
    name: 'superior',
    label: 'Superior',
    isSystem: true,
    defaultPermissions: {
      canViewOverview: true,
      canViewUsers: true,
      canViewEmployees: true,
      canViewProjects: true,
      canViewTeams: true,
      canViewModules: true,
      canViewTasks: true,
      canViewTimeTracker: true,
      canViewReviews: true,
      canViewDailyPlans: true,
      canViewAnalytics: true,
      canViewReports: true,
      canViewAuditLogs: true,
      canViewSettings: true
    }
  },
  {
    name: 'teamlead',
    label: 'Team Lead',
    isSystem: true,
    defaultPermissions: {
      canViewOverview: true,
      canViewUsers: true,
      canViewEmployees: false,
      canViewProjects: true,
      canViewTeams: true,
      canViewModules: true,
      canViewTasks: true,
      canViewTimeTracker: true,
      canViewReviews: true,
      canViewDailyPlans: true,
      canViewAnalytics: true,
      canViewReports: true,
      canViewAuditLogs: false,
      canViewSettings: false
    }
  },
  {
    name: 'employee',
    label: 'Employee',
    isSystem: true,
    defaultPermissions: {
      canViewOverview: true,
      canViewUsers: false,
      canViewEmployees: false,
      canViewProjects: false,
      canViewTeams: false,
      canViewModules: false,
      canViewTasks: true,
      canViewTimeTracker: true,
      canViewReviews: false,
      canViewDailyPlans: true,
      canViewAnalytics: true,
      canViewReports: false,
      canViewAuditLogs: false,
      canViewSettings: false
    }
  }
];

const seedSystemRolesIfEmpty = async () => {
  const count = await Role.countDocuments();
  if (count === 0) {
    for (const r of DEFAULT_SYSTEM_ROLES) {
      await Role.create(r);
    }
  }
};

const getRoles = async (req, res) => {
  try {
    await seedSystemRolesIfEmpty();
    const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 });
    res.status(200).json({
      success: true,
      data: roles,
      message: 'Roles retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching roles' }
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, label, defaultPermissions } = req.body;
    if (!name || !label) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role name and label are required' }
      });
    }

    const cleanName = name.toLowerCase().trim().replace(/\s+/g, '_');
    const existing = await Role.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role already exists' }
      });
    }

    const newRole = await Role.create({
      name: cleanName,
      label,
      isSystem: false,
      defaultPermissions: defaultPermissions || {}
    });

    await logAudit({
      entityType: 'Role',
      entityId: newRole._id,
      action: 'CREATE_ROLE',
      performedBy: req.user._id,
      details: { name: newRole.name, label }
    });

    res.status(201).json({
      success: true,
      message: 'Custom role created successfully',
      data: newRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating role' }
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, defaultPermissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    if (label) role.label = label;
    if (defaultPermissions) {
      role.defaultPermissions = { ...role.defaultPermissions, ...defaultPermissions };
    }

    await role.save();

    await logAudit({
      entityType: 'Role',
      entityId: role._id,
      action: 'UPDATE_ROLE_PERMISSIONS',
      performedBy: req.user._id,
      details: { roleName: role.name, defaultPermissions: role.defaultPermissions }
    });

    res.status(200).json({
      success: true,
      message: `Role defaults for '${role.label}' updated successfully`,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating role' }
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: { message: 'Role not found' }
      });
    }

    if (role.name === 'superadmin') {
      return res.status(400).json({
        success: false,
        error: { message: 'SuperAdmin role cannot be deleted to prevent system lockout.' }
      });
    }

    await Role.findByIdAndDelete(id);

    await logAudit({
      entityType: 'Role',
      entityId: id,
      action: 'DELETE_ROLE',
      performedBy: req.user._id,
      details: { roleName: role.name }
    });

    res.status(200).json({
      success: true,
      message: `Role '${role.label}' deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error deleting role' }
    });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
