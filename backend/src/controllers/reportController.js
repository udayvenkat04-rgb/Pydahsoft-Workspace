const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');

const generateReport = async (req, res) => {
  try {
    const { scope, projectId, teamId, employeeId, status, startDate, endDate } = req.query;

    const taskQuery = {};
    if (projectId) taskQuery.project = projectId;
    if (teamId) taskQuery.team = teamId;
    if (employeeId) taskQuery.assignedTo = employeeId;
    if (status) taskQuery.status = status;

    if (startDate || endDate) {
      taskQuery.createdAt = {};
      if (startDate) taskQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        taskQuery.createdAt.$lte = end;
      }
    }

    const tasks = await Task.find(taskQuery)
      .populate('project', 'name')
      .populate('module', 'name')
      .populate('team', 'name')
      .populate('assignedTo', 'name username employeeId department role')
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const approvedTasks = tasks.filter((t) => t.status === 'Approved').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const submittedTasks = tasks.filter((t) => t.status === 'Submitted for Review').length;
    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const reportData = {
      scope: scope || 'filtered',
      generatedAt: new Date().toISOString(),
      filtersApplied: { projectId, teamId, employeeId, status, startDate, endDate },
      summary: {
        totalTasks,
        approvedTasks,
        inProgressTasks,
        submittedTasks,
        completionRate: totalTasks > 0 ? ((approvedTasks / totalTasks) * 100).toFixed(1) : 0,
        totalEstHours,
        totalActHours: totalActHours.toFixed(2)
      },
      tasks
    };

    res.status(200).json({
      success: true,
      data: reportData,
      message: 'Filter-driven report generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error generating report' }
    });
  }
};

module.exports = {
  generateReport
};
