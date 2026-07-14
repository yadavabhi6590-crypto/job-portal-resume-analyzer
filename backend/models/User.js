const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  fullName: { type: String },
  role: { type: String, enum: ['Student', 'Admin'], default: 'Student' },
  profilePicture: { type: String },
  bio: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
