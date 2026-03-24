const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'calldesk_jwt_secret_change_in_production';

/**
 * Generate a signed JWT token for a user
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Middleware: verify JWT and attach req.user
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in.' });
  }
}

module.exports = { protect, generateToken };
