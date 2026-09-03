const PerformanceRecord = require('../models/PerformanceRecord');
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const { calculateEmployeePerformance } = require('../services/performanceService');

const getPerformanceAnalytics = async (req, res) => {
  try {
    const { employeeId, teamId } = req.query;

    if (employeeId) {
      const perf = await calculateEmployeePerformance(employeeId);
      return res.status(200).json({
        success: true,
        data: perf,
        message: 'Employee performance analytics retrieved'
      });
    }

    let filter = {};
    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        filter.employee = { $in: team.members };
      }
    }

    const records = await PerformanceRecord.find(filter)
      .populate('employee', 'name username employeeId department designation role')
      .sort({ performanceScore: -1 });

    res.status(200).json({
      success: true,
      data: records,
      message: 'Performance records analytics retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching performance analytics' }
    });
  }
};

const getTimeUtilization = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name username').populate('project', 'name projectId');
    
    let totalEst = 0;
    let totalAct = 0;
    const projectBreakdown = {};
    const employeeBreakdown = {};

    tasks.forEach(t => {
      const est = t.estimatedHours || 0;
      const act = t.actualHours || 0;
      totalEst += est;
      totalAct += act;

      const projName = t.project ? t.project.name : 'Unassigned Project';
      if (!projectBreakdown[projName]) {
        projectBreakdown[projName] = { estimatedHours: 0, actualHours: 0, taskCount: 0 };
      }
      projectBreakdown[projName].estimatedHours += est;
      projectBreakdown[projName].actualHours += act;
      projectBreakdown[projName].taskCount += 1;

      const empName = t.assignedTo ? t.assignedTo.name : 'Unassigned';
      if (!employeeBreakdown[empName]) {
        employeeBreakdown[empName] = { estimatedHours: 0, actualHours: 0, taskCount: 0 };
      }
      employeeBreakdown[empName].estimatedHours += est;
      employeeBreakdown[empName].actualHours += act;
      employeeBreakdown[empName].taskCount += 1;
    });

    const variance = Number((totalAct - totalEst).toFixed(2));
    const efficiency = totalAct > 0 ? Number(((totalEst / totalAct) * 100).toFixed(2)) : (totalEst > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalEstimatedHours: Number(totalEst.toFixed(2)),
          totalActualHours: Number(totalAct.toFixed(2)),
          variance,
          efficiencyPercentage: efficiency
        },
        projectBreakdown,
        employeeBreakdown
      },
      message: 'Time utilization analytics retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching time utilization analytics' }
    });
  }
};

const getTaskDistribution = async (req, res) => {
  try {
    const tasks = await Task.find();
    
    const byStatus = {};
    const byPriority = {};

    tasks.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks: tasks.length,
        byStatus,
        byPriority
      },
      message: 'Task distribution analytics retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching task distribution analytics' }
    });
  }
};

module.exports = {
  getPerformanceAnalytics,
  getTimeUtilization,
  getTaskDistribution
};
