const Project = require('../models/Project');
const Team = require('../models/Team');
const Task = require('../models/Task');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const TimeEntry = require('../models/TimeEntry');
const DailyPlan = require('../models/DailyPlan');
const { calculateEmployeePerformance } = require('./performanceService');

const getSuperiorDashboard = async () => {
  const [
    totalProjects,
    activeProjects,
    totalTeams,
    totalEmployees,
    pendingReviewsCount,
    delayedTasksCount,
    blockedTasksCount,
    allTasks,
    recentAuditLogs
  ] = await Promise.all([
    Project.countDocuments(),
    Project.find().populate('assignedTeam', 'name').sort({ updatedAt: -1 }).limit(10),
    Team.countDocuments(),
    User.countDocuments({ role: { $in: ['employee', 'teamlead'] } }),
    Task.countDocuments({ status: 'Submitted for Review' }),
    Task.countDocuments({ status: 'Delayed' }),
    Task.countDocuments({ status: 'Blocked' }),
    Task.find().select('estimatedHours actualHours status'),
    AuditLog.find().populate('performedBy', 'name username role').sort({ createdAt: -1 }).limit(10)
  ]);

  let totalOrgEstHours = 0;
  let totalOrgActHours = 0;
  allTasks.forEach((t) => {
    totalOrgEstHours += t.estimatedHours || 0;
    totalOrgActHours += t.actualHours || 0;
  });

  const orgEfficiency = totalOrgActHours > 0 
    ? Number(((totalOrgEstHours / totalOrgActHours) * 100).toFixed(2)) 
    : (totalOrgEstHours > 0 ? 100 : 0);

  return {
    summary: {
      totalProjects,
      totalTeams,
      totalEmployees,
      pendingReviewsCount,
      projectsAtRisk: delayedTasksCount + blockedTasksCount,
      delayedTasksCount,
      blockedTasksCount
    },
    timeUtilization: {
      totalEstimatedHours: Number(totalOrgEstHours.toFixed(2)),
      totalActualHours: Number(totalOrgActHours.toFixed(2)),
      variance: Number((totalOrgActHours - totalOrgEstHours).toFixed(2)),
      orgEfficiencyPercentage: orgEfficiency
    },
    activeProjects,
    recentActivity: recentAuditLogs
  };
};

const getTeamLeadDashboard = async (teamLeadId) => {
  const teams = await Team.find({ teamLead: teamLeadId }).populate('members', 'name username employeeId designation status');
  const teamIds = teams.map(t => t._id);

  const projects = await Project.find({ assignedTeam: { $in: teamIds } });
  const projectIds = projects.map(p => p._id);

  const tasks = await Task.find({
    $or: [
      { project: { $in: projectIds } },
      { createdBy: teamLeadId }
    ]
  }).populate('assignedTo', 'name username');

  const pendingReviews = tasks.filter(t => t.status === 'Submitted for Review');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');
  const completedTasks = tasks.filter(t => t.status === 'Approved');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayPlans = await DailyPlan.find({
    teamLead: teamLeadId,
    date: { $gte: today, $lt: tomorrow }
  }).populate('employee', 'name username').populate('tasks.task', 'title status');

  return {
    managedTeams: teams,
    assignedProjects: projects,
    taskStats: {
      totalTasks: tasks.length,
      pendingReviewsCount: pendingReviews.length,
      inProgressCount: inProgressTasks.length,
      blockedCount: blockedTasks.length,
      approvedCount: completedTasks.length
    },
    pendingReviewQueue: pendingReviews,
    todayWorkPlans: todayPlans
  };
};

const getEmployeeDashboard = async (employeeId) => {
  const tasks = await Task.find({ assignedTo: employeeId, status: { $ne: 'Approved' } })
    .populate('project', 'name projectId')
    .populate('module', 'name')
    .sort({ dueDate: 1 });

  const activeTimer = await TimeEntry.findOne({ employee: employeeId, status: 'Running' })
    .populate('task', 'title taskId status');

  const performance = await calculateEmployeePerformance(employeeId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayPlan = await DailyPlan.findOne({
    employee: employeeId,
    date: { $gte: today, $lt: tomorrow }
  }).populate('tasks.task', 'title taskId priority status estimatedHours actualHours');

  return {
    assignedTasks: tasks,
    activeTimer,
    performanceProfile: performance,
    todayWorkPlan: todayPlan
  };
};

module.exports = {
  getSuperiorDashboard,
  getTeamLeadDashboard,
  getEmployeeDashboard
};
