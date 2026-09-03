const Task = require('../models/Task');
const TaskReview = require('../models/TaskReview');
const Remark = require('../models/Remark');
const Attachment = require('../models/Attachment');
const { stopTracking } = require('../services/timeService');
const { recalculateModuleProgress, recalculateProjectProgress } = require('../services/progressService');
const { calculateEmployeePerformance } = require('../services/performanceService');
const { logAudit } = require('../services/auditService');

const submitTaskForReview = async (req, res) => {
  try {
    const { taskId, remarks, attachments } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    if (req.user.role === 'employee' && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only submit your assigned tasks' }
      });
    }

    // Stop active time tracking if running
    try {
      await stopTracking(taskId, req.user._id);
    } catch (err) {
      // Ignore if no active timer
    }

    task.status = 'Submitted for Review';
    if (remarks) {
      task.remarks = remarks;
    }
    await task.save();

    if (remarks) {
      await Remark.create({
        task: taskId,
        user: req.user._id,
        comment: remarks,
        type: 'Submission'
      });
    }

    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.fileName && att.fileUrl) {
          await Attachment.create({
            task: taskId,
            user: req.user._id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType || 'document'
          });
        }
      }
    }

    await logAudit({
      entityType: 'Task',
      entityId: taskId,
      action: 'SUBMIT_TASK_REVIEW',
      performedBy: req.user._id,
      details: { remarks }
    });

    const populatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name username')
      .populate('module', 'name moduleId')
      .populate('project', 'name projectId');

    res.status(200).json({
      success: true,
      message: 'Task submitted for review successfully',
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error submitting task for review' }
    });
  }
};

const approveTask = async (req, res) => {
  try {
    const { taskId, comments } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    const previousStatus = task.status;
    task.status = 'Approved';
    await task.save();

    const review = await TaskReview.create({
      task: taskId,
      reviewer: req.user._id,
      submitter: task.assignedTo,
      status: 'Approved',
      comments: comments || 'Task approved cleanly'
    });

    if (comments) {
      await Remark.create({
        task: taskId,
        user: req.user._id,
        comment: comments,
        type: 'Review'
      });
    }

    // Automatically recalculate Module Progress and Project Progress
    if (task.module) {
      await recalculateModuleProgress(task.module);
    } else if (task.project) {
      await recalculateProjectProgress(task.project);
    }

    // Recalculate employee performance metrics
    await calculateEmployeePerformance(task.assignedTo);

    await logAudit({
      entityType: 'Task',
      entityId: taskId,
      action: 'APPROVE_TASK',
      performedBy: req.user._id,
      details: { previousStatus, comments }
    });

    res.status(200).json({
      success: true,
      message: 'Task approved successfully. Module and project progress updated.',
      data: {
        task,
        review
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error approving task' }
    });
  }
};

const rejectTask = async (req, res) => {
  try {
    const { taskId, comments } = req.body;

    if (!taskId || !comments) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId and rejection comments are required' }
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    task.status = 'Rejected';
    task.remarks = `[Rejected]: ${comments}`;
    await task.save();

    const review = await TaskReview.create({
      task: taskId,
      reviewer: req.user._id,
      submitter: task.assignedTo,
      status: 'Rejected',
      comments
    });

    await Remark.create({
      task: taskId,
      user: req.user._id,
      comment: `[Task Rejected - Rework Required]: ${comments}`,
      type: 'Review'
    });

    // Recalculate performance metrics (rejection count update)
    await calculateEmployeePerformance(task.assignedTo);

    await logAudit({
      entityType: 'Task',
      entityId: taskId,
      action: 'REJECT_TASK',
      performedBy: req.user._id,
      details: { comments }
    });

    res.status(200).json({
      success: true,
      message: 'Task rejected and returned for rework',
      data: {
        task,
        review
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error rejecting task' }
    });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const pendingTasks = await Task.find({ status: 'Submitted for Review' })
      .populate('assignedTo', 'name username employeeId designation')
      .populate('createdBy', 'name username')
      .populate('module', 'name moduleId')
      .populate('project', 'name projectId')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingTasks,
      message: 'Pending tasks for review retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching pending reviews' }
    });
  }
};

module.exports = {
  submitTaskForReview,
  approveTask,
  rejectTask,
  getPendingReviews
};
