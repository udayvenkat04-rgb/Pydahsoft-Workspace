const TimeEntry = require('../models/TimeEntry');
const Task = require('../models/Task');
const { logAudit } = require('./auditService');

const calculateTaskTimeMetrics = (estimatedHours, actualHours) => {
  const est = estimatedHours || 0;
  const act = Number(actualHours.toFixed(2));
  const variance = Number((act - est).toFixed(2));
  const efficiency = act > 0 ? Number(((est / act) * 100).toFixed(2)) : (est > 0 ? 100 : 0);

  return {
    estimatedHours: est,
    actualHours: act,
    variance,
    efficiencyPercentage: efficiency
  };
};

const updateTaskActualHours = async (taskId) => {
  const entries = await TimeEntry.find({ task: taskId });
  let totalSeconds = 0;

  const now = new Date();
  entries.forEach((entry) => {
    if (entry.status === 'Running') {
      const currentDuration = Math.floor((now - new Date(entry.startTime)) / 1000);
      totalSeconds += currentDuration;
    } else {
      totalSeconds += entry.durationSeconds || 0;
    }
  });

  const actualHours = Number((totalSeconds / 3600).toFixed(2));
  await Task.findByIdAndUpdate(taskId, { actualHours });
  return actualHours;
};

const startTracking = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Ensure any other running timer for this user is paused/stopped first
  const runningEntries = await TimeEntry.find({ employee: userId, status: 'Running' });
  for (const entry of runningEntries) {
    const endTime = new Date();
    const durationSeconds = Math.max(0, Math.floor((endTime - new Date(entry.startTime)) / 1000));
    entry.endTime = endTime;
    entry.durationSeconds = durationSeconds;
    entry.status = 'Paused';
    await entry.save();
    await updateTaskActualHours(entry.task);
  }

  const timeEntry = await TimeEntry.create({
    task: taskId,
    employee: userId,
    startTime: new Date(),
    status: 'Running'
  });

  // Update task status if applicable
  if (task.status === 'Not Started' || task.status === 'Paused' || task.status === 'Rejected') {
    task.status = 'In Progress';
    await task.save();
  }

  await logAudit({
    entityType: 'Task',
    entityId: taskId,
    action: 'START_TIMER',
    performedBy: userId,
    details: { timeEntryId: timeEntry._id }
  });

  return timeEntry;
};

const pauseTracking = async (taskId, userId) => {
  const runningEntry = await TimeEntry.findOne({
    task: taskId,
    employee: userId,
    status: 'Running'
  });

  if (!runningEntry) {
    throw new Error('No active running timer found for this task');
  }

  const endTime = new Date();
  const durationSeconds = Math.max(0, Math.floor((endTime - new Date(runningEntry.startTime)) / 1000));

  runningEntry.endTime = endTime;
  runningEntry.durationSeconds = durationSeconds;
  runningEntry.status = 'Paused';
  await runningEntry.save();

  const actualHours = await updateTaskActualHours(taskId);

  await Task.findByIdAndUpdate(taskId, { status: 'Paused' });

  await logAudit({
    entityType: 'Task',
    entityId: taskId,
    action: 'PAUSE_TIMER',
    performedBy: userId,
    details: { durationSeconds, actualHours }
  });

  return runningEntry;
};

const resumeTracking = async (taskId, userId) => {
  return await startTracking(taskId, userId);
};

const stopTracking = async (taskId, userId) => {
  const runningEntry = await TimeEntry.findOne({
    task: taskId,
    employee: userId,
    status: 'Running'
  });

  if (runningEntry) {
    const endTime = new Date();
    const durationSeconds = Math.max(0, Math.floor((endTime - new Date(runningEntry.startTime)) / 1000));
    runningEntry.endTime = endTime;
    runningEntry.durationSeconds = durationSeconds;
    runningEntry.status = 'Stopped';
    await runningEntry.save();
  }

  const actualHours = await updateTaskActualHours(taskId);
  const task = await Task.findById(taskId);

  await logAudit({
    entityType: 'Task',
    entityId: taskId,
    action: 'STOP_TIMER',
    performedBy: userId,
    details: { actualHours }
  });

  return calculateTaskTimeMetrics(task.estimatedHours, actualHours);
};

const logManualTime = async (taskId, userId, startTimeInput, endTimeInput) => {
  const start = new Date(startTimeInput);
  const end = new Date(endTimeInput);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end time format');
  }

  if (end <= start) {
    throw new Error('End time must be after Start time');
  }

  const durationSeconds = Math.floor((end - start) / 1000);

  const entry = await TimeEntry.create({
    task: taskId,
    employee: userId,
    startTime: start,
    endTime: end,
    durationSeconds,
    status: 'Stopped'
  });

  const actualHours = await updateTaskActualHours(taskId);

  await logAudit({
    entityType: 'Task',
    entityId: taskId,
    action: 'LOG_MANUAL_TIME',
    performedBy: userId,
    details: { startTime: start, endTime: end, durationSeconds, actualHours }
  });

  return entry;
};

const getUserActiveTimer = async (userId) => {
  return await TimeEntry.findOne({ employee: userId, status: 'Running' }).populate('task', 'title taskId status');
};

const getTaskTimeEntries = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  const actualHours = await updateTaskActualHours(taskId);
  const entries = await TimeEntry.find({ task: taskId }).populate('employee', 'name username').sort({ createdAt: -1 });
  const metrics = calculateTaskTimeMetrics(task.estimatedHours, actualHours);

  return {
    taskMetrics: metrics,
    timeEntries: entries
  };
};

module.exports = {
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  logManualTime,
  getUserActiveTimer,
  getTaskTimeEntries,
  calculateTaskTimeMetrics,
  updateTaskActualHours
};
