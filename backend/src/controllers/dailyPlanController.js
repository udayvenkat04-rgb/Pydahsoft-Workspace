const DailyPlan = require('../models/DailyPlan');
const Task = require('../models/Task');
const { logAudit } = require('../services/auditService');

const createDailyPlan = async (req, res) => {
  try {
    const { date, employee, tasks, planId } = req.body;

    if (!date || !employee || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date, employee ID, and tasks array are required' }
      });
    }

    const count = await DailyPlan.countDocuments();
    const generatedPlanId = planId || `DPL-${String(count + 1).padStart(4, '0')}`;

    // Ensure all tasks referenced in the daily plan are assigned to the target employee so they appear in Tasks & Time Tracker
    for (const item of tasks) {
      if (item.task) {
        await Task.findByIdAndUpdate(item.task, {
          assignedTo: employee
        });
      }
    }

    const plan = await DailyPlan.create({
      planId: generatedPlanId,
      date: new Date(date),
      teamLead: req.user._id,
      employee,
      tasks
    });

    const populatedPlan = await DailyPlan.findById(plan._id)
      .populate('employee', 'name username employeeId designation')
      .populate('teamLead', 'name username')
      .populate('tasks.task', 'title taskId priority status estimatedHours actualHours');

    await logAudit({
      entityType: 'DailyPlan',
      entityId: plan._id,
      action: 'CREATE_DAILY_PLAN',
      performedBy: req.user._id,
      details: { employee, date }
    });

    res.status(201).json({
      success: true,
      message: 'Daily work plan created and tasks assigned successfully',
      data: populatedPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating daily plan' }
    });
  }
};

const getDailyPlans = async (req, res) => {
  try {
    const { date, employee, teamLead } = req.query;
    const filter = {};

    if (employee) filter.employee = employee;
    if (teamLead) filter.teamLead = teamLead;
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDate };
    }

    if (req.user.role === 'employee') {
      filter.employee = req.user._id;
    }

    const plans = await DailyPlan.find(filter)
      .populate('employee', 'name username employeeId designation')
      .populate('teamLead', 'name username')
      .populate('tasks.task', 'title taskId priority status estimatedHours actualHours')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: plans,
      message: 'Daily work plans retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching daily plans' }
    });
  }
};

const getDailyPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await DailyPlan.findById(id)
      .populate('employee', 'name username employeeId designation')
      .populate('teamLead', 'name username')
      .populate('tasks.task', 'title taskId priority status estimatedHours actualHours');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Daily plan not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
      message: 'Daily plan details retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching daily plan' }
    });
  }
};

const updateDailyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await DailyPlan.findByIdAndUpdate(id, req.body, { new: true })
      .populate('employee', 'name username employeeId designation')
      .populate('teamLead', 'name username')
      .populate('tasks.task', 'title taskId priority status estimatedHours actualHours');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Daily plan not found' }
      });
    }

    await logAudit({
      entityType: 'DailyPlan',
      entityId: plan._id,
      action: 'UPDATE_DAILY_PLAN',
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      data: plan,
      message: 'Daily plan updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating daily plan' }
    });
  }
};

module.exports = {
  createDailyPlan,
  getDailyPlans,
  getDailyPlanById,
  updateDailyPlan
};
