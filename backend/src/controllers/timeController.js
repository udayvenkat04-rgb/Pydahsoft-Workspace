const {
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  logManualTime,
  getUserActiveTimer,
  getTaskTimeEntries
} = require('../services/timeService');

const startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const timeEntry = await startTracking(taskId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Time tracking started',
      data: timeEntry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to start time tracking' }
    });
  }
};

const pauseTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const timeEntry = await pauseTracking(taskId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Time tracking paused',
      data: timeEntry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to pause time tracking' }
    });
  }
};

const resumeTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const timeEntry = await resumeTracking(taskId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Time tracking resumed',
      data: timeEntry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to resume time tracking' }
    });
  }
};

const stopTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId is required' }
      });
    }

    const metrics = await stopTracking(taskId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Time tracking stopped',
      data: metrics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to stop time tracking' }
    });
  }
};

const createManualTimeLog = async (req, res) => {
  try {
    const { taskId, startTime, endTime } = req.body;
    if (!taskId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: { message: 'taskId, startTime, and endTime are required' }
      });
    }

    const timeEntry = await logManualTime(taskId, req.user._id, startTime, endTime);

    res.status(201).json({
      success: true,
      message: 'Manual time log recorded successfully',
      data: timeEntry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to log manual time' }
    });
  }
};

const getActiveTimer = async (req, res) => {
  try {
    const activeTimer = await getUserActiveTimer(req.user._id);
    res.status(200).json({
      success: true,
      data: activeTimer,
      message: 'Active timer retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching active timer' }
    });
  }
};

const getTaskTimeData = async (req, res) => {
  try {
    const { taskId } = req.params;
    const timeData = await getTaskTimeEntries(taskId);
    res.status(200).json({
      success: true,
      data: timeData,
      message: 'Task time tracking data retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching task time data' }
    });
  }
};

module.exports = {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  createManualTimeLog,
  getActiveTimer,
  getTaskTimeData
};
