const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  gender: String,
  isLpuStudent: Boolean,
  registrationNo: String,
  participationType: String,
  teamMembers: Array,
  paymentStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);