const { google } = require('googleapis');

/**
 * Creates a Google Calendar event for a reminder.
 *
 * @param {object} reminderData  - { name, phone, notes, reminderTime }
 * @param {object} [userTokens] - { accessToken, refreshToken } for the logged-in user.
 *                                 If omitted, calendar sync is skipped.
 */
async function createCalendarEvent({ name, phone, notes, reminderTime }, userTokens = null) {
  // ── Guard: skip if no per-user tokens are available ──────────────────────
  if (!userTokens || (!userTokens.accessToken && !userTokens.refreshToken)) {
    console.warn('⚠️  Google Calendar sync skipped — no user tokens available.');
    console.warn('   → User must log in with Google to enable personal calendar sync.');
    return { success: false, error: 'No user Google tokens available' };
  }

  // ── Guard: check OAuth app credentials are present ────────────────────────
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google Calendar sync skipped — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing.');
    return { success: false, error: 'Missing Google OAuth app credentials' };
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token:  userTokens.accessToken,
      refresh_token: userTokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startTime = new Date(reminderTime);
    const endTime   = new Date(startTime.getTime() + 30 * 60 * 1000); // 30-min duration

    const event = {
      summary:     `📞 Call: ${name}`,
      description: `Phone: ${phone}\n\nNotes: ${notes || 'No notes'}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 10 },
        ],
      },
      colorId: '9', // blueberry
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource:   event,
    });

    console.log(`✅ Google Calendar event created: ${response.data.id}`);
    return { success: true, eventId: response.data.id };
  } catch (error) {
    console.error('❌ Google Calendar error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { createCalendarEvent };
