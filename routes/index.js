const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Razorpay = require('razorpay'); // Import Razorpay SDK

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

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Razorpay key_id from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Razorpay key_secret from .env
});

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
        registrationNo: member.registrationNo,
      }));
    }

    const photoPath = req.file.path.replace('public', '');

    // Calculate the price based on the form data
    let price = 0;
    if (isLpuStudent === 'yes') {
      if (participationType === 'solo') {
        price = 1; // LPU solo
      } else if (participationType === 'team') {
        price = 1.7; // LPU team
      }
    } else {
      if (participationType === 'solo') {
        price = 1; // Non-LPU solo without accommodation
        if (accommodation === 'yes') {
          price = 1.5; // Non-LPU solo with accommodation
        }
      } else if (participationType === 'team') {
        price = 1.3; // Non-LPU team without accommodation
        if (accommodation === 'yes') {
          price = 1.5; // Non-LPU team with accommodation
        }
      }
    }

    // Store user data in session
    req.session.tempUser = {
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
      photo: photoPath,
      price,
    };

    res.redirect('/payment');
  } catch (error) {
    res.status(400).send("Registration failed: " + error.message);
  }
});

// Payment Page
router.get('/payment', async (req, res) => {
  try {
    const tempUser = req.session.tempUser;
    if (!tempUser) {
      return res.status(400).send('User data missing');
    }

    res.render('payment', { user: tempUser });

  } catch (error) {
    console.error("Payment Page Error:", error);
    res.status(500).send('Error loading payment page');
  }
});

// Route to create a Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paise (e.g., 30000 for ₹300)
    console.log("Received amount:", amount); // Debugging: Log the received amount

    if (!amount || isNaN(amount)) {
      throw new Error("Invalid amount provided.");
    }

    const options = {
      amount: Number(amount), // Ensure amount is a number
      currency: 'INR',
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
      payment_capture: 1, // Auto-capture payment
    };

    // Create a Razorpay order
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order); // Debugging: Log the created order

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
    });
  }
});

// Handle Payment Confirmation
router.post('/confirm-payment', async (req, res) => {
  try {
    // Retrieve temporary user data from session
    const tempUser = req.session.tempUser;
    if (!tempUser) {
      return res.status(404).send("User data not found.");
    }

    // Save the user data to the database
    const newUser = new User(tempUser);
    await newUser.save();

    // Clear the temporary user data from session
    delete req.session.tempUser;

    res.redirect('/payment-success');
  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    res.status(500).send("Error confirming payment.");
  }
});

// Payment Success Page
router.get('/payment-success', (req, res) => {
  res.render('payment-success');
});

module.exports = router;