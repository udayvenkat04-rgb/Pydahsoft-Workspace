const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      unique: true,
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Plan date is required']
    },
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team Lead is required']
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required']
    },
    tasks: [
      {
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
          required: true
        },
        plannedHours: {
          type: Number,
          default: 0
        },
        priority: {
          type: String,
          default: 'Medium'
        },
        status: {
          type: String,
          default: 'Pending'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
