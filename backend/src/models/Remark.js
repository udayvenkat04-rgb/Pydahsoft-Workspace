const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    comment: {
      type: String,
      required: [true, 'Remark comment is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['General', 'StatusChange', 'Submission', 'Review'],
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Remark', remarkSchema);
