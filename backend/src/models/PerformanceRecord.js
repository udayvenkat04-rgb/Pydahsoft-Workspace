const mongoose = require('mongoose');

const performanceRecordSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
      unique: true
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    onTimeTasks: {
      type: Number,
      default: 0
    },
    delayedTasks: {
      type: Number,
      default: 0
    },
    rejectionsCount: {
      type: Number,
      default: 0
    },
    estimatedHours: {
      type: Number,
      default: 0
    },
    actualHours: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    onTimeRate: {
      type: Number,
      default: 0
    },
    efficiencyPercentage: {
      type: Number,
      default: 0
    },
    performanceScore: {
      type: Number,
      default: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PerformanceRecord', performanceRecordSchema);
