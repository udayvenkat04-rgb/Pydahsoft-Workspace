const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Module = require('../models/Module');
const Task = require('../models/Task');
const DailyPlan = require('../models/DailyPlan');
const TimeEntry = require('../models/TimeEntry');
const Remark = require('../models/Remark');
const Attachment = require('../models/Attachment');
const TaskReview = require('../models/TaskReview');
const PerformanceRecord = require('../models/PerformanceRecord');
const AuditLog = require('../models/AuditLog');

const clearAllTestData = async () => {
  try {
    await connectDB();
    console.log('[ClearDB] Connected to MongoDB. Clearing all test data...');

    await Promise.all([
      Team.deleteMany({}),
      Project.deleteMany({}),
      Module.deleteMany({}),
      Task.deleteMany({}),
      DailyPlan.deleteMany({}),
      TimeEntry.deleteMany({}),
      Remark.deleteMany({}),
      Attachment.deleteMany({}),
      TaskReview.deleteMany({}),
      PerformanceRecord.deleteMany({}),
      AuditLog.deleteMany({}),
      User.deleteMany({})
    ]);

    console.log('[ClearDB] All teams, projects, modules, tasks, time entries, reviews, and logs deleted.');

    // Create 1 clean initial Superior user for administrative login
    const superiorUser = await User.create({
      employeeId: 'EMP001',
      name: 'System Admin',
      username: 'superior',
      password: 'superior123',
      email: 'admin@pydahsoft.com',
      department: 'Executive',
      designation: 'System Administrator',
      role: 'superior',
      status: 'Active'
    });

    console.log('[ClearDB] Clean slate ready!');
    console.log('--------------------------------------------------');
    console.log('DEFAULT ADMIN ACCOUNT:');
    console.log('Username: superior');
    console.log('Password: superior123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[ClearDB Error]:', err);
    process.exit(1);
  }
};

clearAllTestData();
