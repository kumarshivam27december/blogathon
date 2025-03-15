require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer'); // Import Nodemailer
const fs = require('fs'); // Import fs module for directory creation

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 3000

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET, // Use SESSION_SECRET from .env
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set secure: true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Session expires in 24 hours
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the 'public/uploads' directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created:', uploadsDir);
}

// Import models
const User = require('./models/User'); // Your existing User schema
const Contact = require('./models/Contact'); // New Contact schema

// Routes
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail email address
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    }
});

// New route for handling contact form submissions
app.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Create a new contact document
        const newContact = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });

        // Save the document to the database
        await newContact.save();

        // Send an email to yourself
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: process.env.EMAIL_USER, // Your email address
            subject: `New Contact Form Submission: ${subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Subject: ${subject}
                Message: ${message}
            `,
            html: `
                <h1>New Contact Form Submission</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        // Send a success response
        res.status(200).json({ message: 'Thank you for your message. We will get back to you soon!' });
    } catch (error) {
        console.error('Error saving contact form data or sending email:', error);
        res.status(500).json({ message: 'An error occurred while submitting your message. Please try again later.' });
    }
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});