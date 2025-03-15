const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Save files in the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });

// Home Page
router.get('/', (req, res) => {
  res.render('index');
});

// About Page
router.get('/about', (req, res) => {
  res.render('about');
});

// Rules Page
router.get('/rules', (req, res) => {
  res.render('rules');
});

// Contact Page
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Registration Form
router.get('/register', (req, res) => {
  res.render('register');
});

// Registration Handler with Photo Upload
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
      console.log("Uploaded file:", req.file); // Debug: Check if file is uploaded
      if (!req.file) {
          throw new Error("No file uploaded.");
      }

      const { name, email, mobile, gender, isLpuStudent, registrationNo, accommodation, participationType, teamName, teamMembers } = req.body;

      // Format team members if in a team
      let formattedTeamMembers = [];
      if (participationType === "team" && teamMembers) {
          formattedTeamMembers = Object.values(teamMembers).map(member => ({
              name: member.name,
              phone: member.phone,
              registrationNo: member.registrationNo
          }));
      }

      const photoPath = req.file.path.replace('public', '');


      const newUser = new User({
          name,
          email,
          mobile,
          gender,
          isLpuStudent: isLpuStudent === 'yes',
          registrationNo,
          accommodation,
          participationType,
          teamName: participationType === "team" ? teamName : null,
          teamMembers: formattedTeamMembers,
          photo: photoPath // Save the file path of the uploaded photo
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

module.exports = router;