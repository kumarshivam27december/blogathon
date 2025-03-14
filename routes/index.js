const express = require('express');
const router = express.Router(); // Initialize the router
const User = require('../models/User');

// Home Page
router.get('/', (req, res) => {
  res.render('index');
});

// About Page
router.get('/about', (req, res) => {
  res.render('about');
});


// Registration Form
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle Registration
router.post('/register', async (req, res) => {
    try {
        const newUser = new User({
            ...req.body,
            isLpuStudent: req.body.isLpuStudent === 'yes',
            teamMembers: req.body.teamMembers || [] // Handle team members
        });
        
        await newUser.save();
        res.redirect(`/payment?user=${newUser._id}`);
    } catch (error) {
        res.status(400).send("Registration failed: " + error.message);
    }
});

// Payment Page
router.get('/payment', async (req, res) => {
  try {
    const userId = req.query.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('payment', { user });
  } catch (error) {
    res.status(500).send('Error loading payment page');
  }
});

// Handle Payment Confirmation
router.post('/confirm-payment', async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.paymentStatus = true;
    await user.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error confirming payment');
  }
});

module.exports = router; // Export the router