const Task = require('../models/Task');
const Module = require('../models/Module');
const Team = require('../models/Team');
const Remark = require('../models/Remark');
const Attachment = require('../models/Attachment');
const TaskReview = require('../models/TaskReview');
const { recalculateModuleProgress, recalculateProjectProgress } = require('../services/progressService');
const { getTaskTimeEntries } = require('../services/timeService');
const { logAudit } = require('../services/auditService');

const VALID_STATUSES = [
  'Not Started',
  'In Progress',
  'Paused',
  'Submitted for Review',
  'Approved',
  'Rejected',
  'Delayed',
  'Blocked'
];

const ALLOWED_TRANSITIONS = {
  'Not Started': ['In Progress', 'Blocked'],
  'In Progress': ['Paused', 'Submitted for Review', 'Blocked'],
  'Paused': ['In Progress', 'Submitted for Review', 'Blocked'],
  'Submitted for Review': ['Approved', 'Rejected', 'Blocked'],
  'Rejected': ['In Progress', 'Blocked'],
  'Blocked': ['Not Started', 'In Progress', 'Paused'],
  'Delayed': ['In Progress', 'Submitted for Review', 'Approved'],
  'Approved': ['In Progress']
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      module: moduleId,
      assignedTo,
      priority,
      startDate,
      dueDate,
      estimatedHours,
      taskId
    } = req.body;

    if (!title || !assignedTo || !moduleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Task title, parent module, and assigned employee are required' }
      });
    }

    const parentModule = await Module.findById(moduleId).populate('assignedTeam');
    if (!parentModule) {
      return res.status(404).json({
        success: false,
        error: { message: 'Selected parent module not found' }
      });
    }

    const assignedTeamDoc = parentModule.assignedTeam;

    const count = await Task.countDocuments();
    const generatedTaskId = taskId || `TSK-${String(count + 1).padStart(4, '0')}`;

    const task = await Task.create({
      taskId: generatedTaskId,
      title,
      description: description || '',
      module: parentModule._id,
      project: parentModule.project,
      team: assignedTeamDoc?._id || null,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      status: 'Not Started'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name username email employeeId designation')
      .populate('createdBy', 'name username')
      .populate('module', 'name moduleId')
      .populate('project', 'name projectId')
      .populate('team', 'name teamId');

    await recalculateModuleProgress(parentModule._id);

    await logAudit({
      entityType: 'Task',
      entityId: task._id,
      action: 'CREATE_TASK',
      performedBy: req.user._id,
      details: { title: task.title, assignedTo, moduleId: parentModule._id }
    });

    res.status(201).json({
      success: true,
      message: 'Sub-module/Task created successfully under module',
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating task' }
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { project, module: moduleId, assignedTo, status, priority, teamId } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (moduleId) filter.module = moduleId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (teamId) filter.team = teamId;

    // Database-driven authorization check:
    // If the logged in user is an Employee without task management permissions (canCreateTasks is false), only return their assigned tasks
    const perms = req.user.permissions || {};
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManagerOrLead = isSuperAdmin || perms.canCreateTasks !== false || perms.canAssignTasksToMembers !== false;

    if (!isManagerOrLead && !assignedTo) {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name username email employeeId designation')
      .populate('createdBy', 'name username')
      .populate('module', 'name moduleId')
      .populate('project', 'name projectId')
      .populate('team', 'name teamId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching tasks' }
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('assignedTo', 'name username email employeeId designation department')
      .populate('createdBy', 'name username role')
      .populate('module', 'name moduleId estimatedHours actualHours status progress')
      .populate('project', 'name projectId status progress')
      .populate('team', 'name teamId');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    // Role safety check using DB permissions
    const perms = req.user.permissions || {};
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManagerOrLead = isSuperAdmin || perms.canCreateTasks !== false || perms.canAssignTasksToMembers !== false;

    if (!isManagerOrLead && String(task.assignedTo._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied to this task' }
      });
    }

    const timeData = await getTaskTimeEntries(id);
    const remarks = await Remark.find({ task: id }).populate('user', 'name username role').sort({ createdAt: -1 });
    const attachments = await Attachment.find({ task: id }).populate('user', 'name username').sort({ createdAt: -1 });
    const reviews = await TaskReview.find({ task: id }).populate('reviewer submitter', 'name username role').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        task,
        timeData,
        remarks,
        attachments,
        reviews
      },
      message: 'Task details retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching task details' }
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    delete updateData.status;
    delete updateData.actualHours;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTo', 'name username')
      .populate('module', 'name moduleId')
      .populate('project', 'name projectId');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    if (task.module) {
      await recalculateModuleProgress(task.module);
    } else if (task.project) {
      await recalculateProjectProgress(task.project);
    }

    await logAudit({
      entityType: 'Task',
      entityId: task._id,
      action: 'UPDATE_TASK',
      performedBy: req.user._id,
      details: updateData
    });

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating task' }
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    const perms = req.user.permissions || {};
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManagerOrLead = isSuperAdmin || perms.canCreateTasks !== false || perms.canAssignTasksToMembers !== false;

    // Non-lead employees can only update their assigned tasks
    if (!isManagerOrLead && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only update status of your assigned tasks' }
      });
    }

    // Only leads/managers can approve or reject tasks
    if ((status === 'Approved' || status === 'Rejected') && !isManagerOrLead) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only Team Leads and Managers can approve or reject tasks' }
      });
    }

    const currentStatus = task.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(status) && currentStatus !== status) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed target statuses: ${allowed.join(', ') || 'None'}`
        }
      });
    }

    task.status = status;
    if (remark) {
      task.remarks = remark;
    }
    await task.save();

    if (remark) {
      await Remark.create({
        task: id,
        user: req.user._id,
        comment: remark,
        type: 'StatusChange'
      });
    }

    if (task.module) {
      await recalculateModuleProgress(task.module);
    } else if (task.project) {
      await recalculateProjectProgress(task.project);
    }

    await logAudit({
      entityType: 'Task',
      entityId: task._id,
      action: 'UPDATE_TASK_STATUS',
      performedBy: req.user._id,
      details: { fromStatus: currentStatus, toStatus: status, remark }
    });

    const populatedTask = await Task.findById(id)
      .populate('assignedTo', 'name username')
      .populate('module', 'name moduleId progress')
      .populate('project', 'name projectId progress');

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating task status' }
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    if (task.module) {
      await recalculateModuleProgress(task.module);
    } else if (task.project) {
      await recalculateProjectProgress(task.project);
    }

    await logAudit({
      entityType: 'Task',
      entityId: id,
      action: 'DELETE_TASK',
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error deleting task' }
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
