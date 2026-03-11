const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    reminderTime: {
      type: Date,
      required: [true, 'Reminder time is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Missed'],
      default: 'Pending',
    },
    googleEventId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-mark as missed if past reminder time and still pending
reminderSchema.methods.checkMissed = function () {
  if (this.status === 'Pending' && new Date() > this.reminderTime) {
    this.status = 'Missed';
  }
  return this;
};

module.exports = mongoose.model('Reminder', reminderSchema);
