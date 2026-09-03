const AuditLog = require('../models/AuditLog');

const logAudit = async ({ entityType, entityId, action, performedBy, details = {} }) => {
  try {
    await AuditLog.create({
      entityType,
      entityId: String(entityId),
      action,
      performedBy,
      details,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[AuditLog Error]: Failed to create audit log:', err.message);
  }
};

module.exports = { logAudit };
