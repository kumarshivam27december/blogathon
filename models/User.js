const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: String,
  phone: String,
  registrationNo: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  gender: String,
  isLpuStudent: Boolean,
  registrationNo: { type: String, required: true },
  accommodation: String, // No enum validation
  participationType: String,
  teamName: String,
  teamMembers: [teamMemberSchema],
  paymentStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);