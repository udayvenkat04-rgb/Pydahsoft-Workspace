const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { entityType, entityId, action, limit = 50 } = req.query;
    const filter = {};

    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = String(entityId);
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name username role employeeId')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: logs,
      message: 'Audit logs retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching audit logs' }
    });
  }
};

module.exports = {
  getAuditLogs
};
