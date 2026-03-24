const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required for Google OAuth users
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    // Google OAuth tokens — stored so we can add events to the user's own calendar
    googleAccessToken: {
      type: String,
      default: null,
    },
    googleRefreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (exclude password)
userSchema.methods.toSafeObject = function () {
  const { _id, name, email, avatar, googleId, createdAt } = this;
  return { _id, name, email, avatar, hasGoogle: !!googleId, createdAt };
};

module.exports = mongoose.model('User', userSchema);
