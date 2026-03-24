/**
 * Run this ONCE to get your Google OAuth refresh token for Calendar API access.
 * 
 * Usage:
 *   node get-refresh-token.js
 * 
 * Then open the printed URL in your browser, authorize, and paste the code back here.
 * The refresh token will be printed — copy it into your .env as GOOGLE_REFRESH_TOKEN=...
 */

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// Scopes needed for Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',   // 'offline' gives a refresh token
  prompt: 'consent',        // force consent screen so refresh_token is always returned
  scope: SCOPES,
});

console.log('\n🔑 Authorize this app by visiting this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('📋 Paste the authorization code from the browser here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Add this to your backend/.env:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n⚠️  Keep this token secret — it grants access to your Google Calendar.\n');
  } catch (err) {
    console.error('\n❌ Error getting tokens:', err.message);
    console.error('Make sure the authorization code is correct and not expired (codes expire in ~60 seconds).');
  }
});
