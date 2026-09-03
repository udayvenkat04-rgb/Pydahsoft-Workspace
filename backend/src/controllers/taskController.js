const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, createdBy } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ success: false, message: 'Title and assigned user are required' });
    }

    const task = await Task.create({
      title,
      description,
      project: project || 'General',
      assignedTo,
      createdBy: createdBy || null,
      priority: priority || 'Medium',
      dueDate: dueDate || null
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name username role');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating task' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name username role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching tasks' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('assignedTo', 'name username role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating task' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus
};
