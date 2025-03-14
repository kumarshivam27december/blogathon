const express = require('express');
const router = express.Router();
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

// Registration Handler
router.post('/register', async (req, res) => {
  try {
      // console.log(req.body); // Debug: Log the request body
      const { name, email, mobile, gender, isLpuStudent, registrationNo, accommodation, participationType, teamName, teamMembers } = req.body;

      console.log("Accommodation:", accommodation); // Debug: Log the accommodation value

      // Format team members if in a team
      let formattedTeamMembers = [];
      if (participationType === "team" && teamMembers) {
          formattedTeamMembers = Object.values(teamMembers).map(member => ({
              name: member.name,
              phone: member.phone,
              registrationNo: member.registrationNo
          }));
      }

      const newUser = new User({
          name,
          email,
          mobile,
          gender,
          isLpuStudent: isLpuStudent === 'yes',
          registrationNo,
          accommodation, // Ensure this is included
          participationType,
          teamName: participationType === "team" ? teamName : null,
          teamMembers: formattedTeamMembers
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
    if (!userId) {
      return res.status(400).send('User ID missing');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('payment', { user });

  } catch (error) {
    console.error("Payment Page Error:", error);
    res.status(500).send('Error loading payment page');
  }
});

// Handle Payment Confirmation
router.post('/confirm-payment', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    user.paymentStatus = true;
    await user.save();

    res.redirect('/');

  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    res.status(500).send("Error confirming payment.");
  }
});

module.exports = router; // Export the router
