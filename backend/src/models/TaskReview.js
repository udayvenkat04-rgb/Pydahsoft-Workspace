const mongoose = require('mongoose');

const taskReviewSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required']
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitter is required']
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected'],
      required: [true, 'Review status is required']
    },
    comments: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TaskReview', taskReviewSchema);
