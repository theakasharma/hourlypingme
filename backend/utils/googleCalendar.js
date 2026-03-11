const { google } = require('googleapis');

/**
 * Creates a Google Calendar event for a reminder.
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
 * and GOOGLE_REFRESH_TOKEN in .env
 */
async function createCalendarEvent({ name, phone, notes, reminderTime }) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startTime = new Date(reminderTime);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min duration

    const event = {
      summary: `📞 Call: ${name}`,
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
      resource: event,
    });

    return { success: true, eventId: response.data.id };
  } catch (error) {
    console.error('Google Calendar error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { createCalendarEvent };
