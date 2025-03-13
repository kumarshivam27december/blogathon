require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Admin Login Page
router.get('/login', (req, res) => {
    res.render('admin-login');
});

// Handle Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check credentials against environment variables
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        try {
            // Set session for admin
            req.session.adminLoggedIn = true;

            // Redirect to the admin dashboard
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).send('Error during login');
        }
    } else {
        // Redirect to home page if credentials are incorrect
        res.redirect('/');
    }
});

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
    // Check if admin is logged in
    if (!req.session.adminLoggedIn) {
        return res.redirect('/admin/login');
    }

    try {
        // Fetch all users from the database
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin-dashboard', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Admin Logout
router.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;