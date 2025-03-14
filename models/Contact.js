const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Full name of the user
  email: { type: String, required: true }, // Email address
  phone: { type: String }, // Phone number (optional)
  subject: { type: String, required: true }, // Subject of the inquiry
  message: { type: String, required: true }, // User's message
  createdAt: { type: Date, default: Date.now } // Timestamp of submission
});

module.exports = mongoose.model('Contact', contactSchema);