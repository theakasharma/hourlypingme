const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { createCalendarEvent } = require('../utils/googleCalendar');

// POST /api/reminder/create
router.post('/create', async (req, res) => {
  try {
    const { name, phone, notes, reminderTime } = req.body;

    if (!name || !phone || !reminderTime) {
      return res.status(400).json({ success: false, message: 'Name, phone, and reminder time are required.' });
    }

    const reminder = new Reminder({ name, phone, notes, reminderTime });

    // Try to create Google Calendar event
    const calResult = await createCalendarEvent({ name, phone, notes, reminderTime });
    if (calResult.success) {
      reminder.googleEventId = calResult.eventId;
    }

    await reminder.save();

    return res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
      calendarEvent: calResult.success ? 'Created' : 'Skipped (check Google credentials)',
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reminder/list
router.get('/list', async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.reminderTime = { $gte: start, $lte: end };
    } else if (date === 'upcoming') {
      const now = new Date();
      filter.reminderTime = { $gte: now };
      filter.status = 'Pending';
    } else if (date === 'missed') {
      const now = new Date();
      // Auto-update missed reminders
      await Reminder.updateMany(
        { status: 'Pending', reminderTime: { $lt: now } },
        { $set: { status: 'Missed' } }
      );
      filter.status = 'Missed';
    }

    // Auto-mark as missed for general list
    const now = new Date();
    await Reminder.updateMany(
      { status: 'Pending', reminderTime: { $lt: now } },
      { $set: { status: 'Missed' } }
    );

    const reminders = await Reminder.find(filter).sort({ reminderTime: 1 });

    // Stats for dashboard
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const stats = {
      totalToday: await Reminder.countDocuments({ reminderTime: { $gte: todayStart, $lte: todayEnd } }),
      pendingToday: await Reminder.countDocuments({ reminderTime: { $gte: todayStart, $lte: todayEnd }, status: 'Pending' }),
      completedToday: await Reminder.countDocuments({ reminderTime: { $gte: todayStart, $lte: todayEnd }, status: 'Completed' }),
      missedToday: await Reminder.countDocuments({ reminderTime: { $gte: todayStart, $lte: todayEnd }, status: 'Missed' }),
      totalAll: await Reminder.countDocuments(),
    };

    return res.json({ success: true, data: reminders, stats });
  } catch (error) {
    console.error('List reminders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reminder/update/:id
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, notes, reminderTime, status } = req.body;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { name, phone, notes, reminderTime, status },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    return res.json({ success: true, message: 'Reminder updated', data: reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reminder/delete/:id
router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndDelete(id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    return res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reminder/complete/:id - quick complete action
router.post('/complete/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    return res.json({ success: true, message: 'Marked as completed', data: reminder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
