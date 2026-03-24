const express = require('express');
const router  = express.Router();
const Reminder = require('../models/Reminder');
const { createCalendarEvent } = require('../utils/googleCalendar');
const { protect } = require('../middleware/authMiddleware');

// Apply auth protection to every reminder route
router.use(protect);

// ─── POST /api/reminder/create ────────────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    const { name, phone, notes, reminderTime } = req.body;

    if (!name || !phone || !reminderTime) {
      return res.status(400).json({ success: false, message: 'Name, phone, and reminder time are required.' });
    }

    const reminder = new Reminder({
      userId: req.user._id,
      name,
      phone,
      notes,
      reminderTime,
    });

    // Try to create a Google Calendar event using the user's own tokens
    const userTokens = {
      accessToken:  req.user.googleAccessToken,
      refreshToken: req.user.googleRefreshToken,
    };
    const calResult = await createCalendarEvent({ name, phone, notes, reminderTime }, userTokens);
    if (calResult.success) {
      reminder.googleEventId = calResult.eventId;
    }

    await reminder.save();

    return res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data:    reminder,
      calendarEvent: calResult.success ? 'Created' : 'Skipped (sign in with Google to enable)',
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/reminder/list ───────────────────────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    const { status, date } = req.query;
    // Every query is scoped to the logged-in user
    const filter = { userId: req.user._id };

    if (status) filter.status = status;

    if (date === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setHours(23, 59, 59, 999);
      filter.reminderTime = { $gte: start, $lte: end };
    } else if (date === 'upcoming') {
      filter.reminderTime = { $gte: new Date() };
      filter.status = 'Pending';
    } else if (date === 'missed') {
      // Auto-update missed reminders for this user
      await Reminder.updateMany(
        { userId: req.user._id, status: 'Pending', reminderTime: { $lt: new Date() } },
        { $set: { status: 'Missed' } }
      );
      filter.status = 'Missed';
    }

    // Auto-mark past pending reminders as missed (scoped to user)
    await Reminder.updateMany(
      { userId: req.user._id, status: 'Pending', reminderTime: { $lt: new Date() } },
      { $set: { status: 'Missed' } }
    );

    const reminders = await Reminder.find(filter).sort({ reminderTime: 1 });

    // Dashboard stats — scoped to this user
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const userToday = { userId: req.user._id, reminderTime: { $gte: todayStart, $lte: todayEnd } };

    const stats = {
      totalToday:     await Reminder.countDocuments(userToday),
      pendingToday:   await Reminder.countDocuments({ ...userToday, status: 'Pending' }),
      completedToday: await Reminder.countDocuments({ ...userToday, status: 'Completed' }),
      missedToday:    await Reminder.countDocuments({ ...userToday, status: 'Missed' }),
      totalAll:       await Reminder.countDocuments({ userId: req.user._id }),
    };

    return res.json({ success: true, data: reminders, stats });
  } catch (error) {
    console.error('List reminders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/reminder/update/:id ───────────────────────────────────────────
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, notes, reminderTime, status } = req.body;

    // Ownership check
    const existing = await Reminder.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    if (String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this reminder.' });
    }

    const updateData = { name, phone, notes, reminderTime, status };

    // Reset to Pending if new time is in the future
    if (reminderTime && new Date(reminderTime) > new Date()) {
      updateData.status = 'Pending';
    }

    const reminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return res.json({ success: true, message: 'Reminder updated', data: reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/reminder/delete/:id ───────────────────────────────────────────
router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Reminder.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    if (String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this reminder.' });
    }

    await Reminder.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/reminder/complete/:id ─────────────────────────────────────────
router.post('/complete/:id', async (req, res) => {
  try {
    const existing = await Reminder.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    if (String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to complete this reminder.' });
    }

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );

    return res.json({ success: true, message: 'Marked as completed', data: reminder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
