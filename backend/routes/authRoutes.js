const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/authMiddleware');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Passport Google Strategy ──────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), null);

          // Find existing user by googleId or email
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            // Update Google account info and tokens
            user.googleId           = profile.id;
            user.avatar             = profile.photos?.[0]?.value || user.avatar;
            user.googleAccessToken  = accessToken  || user.googleAccessToken;
            // refreshToken is only returned when the user explicitly re-consents
            if (refreshToken) user.googleRefreshToken = refreshToken;
            await user.save();
          } else {
            // Create new user from Google profile
            user = await User.create({
              name:               profile.displayName,
              email,
              googleId:           profile.id,
              avatar:             profile.photos?.[0]?.value || null,
              googleAccessToken:  accessToken  || null,
              googleRefreshToken: refreshToken || null,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Routes ────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (!user.password)
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please log in with Google.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me — return current user from JWT
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// ─── Google OAuth ───────────────────────────────────────────────────────────

// GET /api/auth/google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],
    accessType: 'offline',
    prompt: 'consent',   // force refresh_token to be returned every time
    session: false,
  })
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to frontend with token in query (frontend stores it in localStorage)
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
