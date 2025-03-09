// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (if you have frontend in the same project)
app.use(express.static('public'));

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Or another service like 'SendGrid', 'Mailgun'
  auth: {
    user: process.env.EMAIL_USER,     // Your email address
    pass: process.env.EMAIL_PASSWORD  // Your email password or app password
  }
});

// API endpoint for contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  
  try {
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dondgaurav144@gmail.com',  // The email where you want to receive messages
      subject: subject ? `Contact Form: ${subject}` : 'New Contact Form Submission',
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Auto-reply to the sender
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: 'dondgaurav144@gmail.com',
      subject: 'Thank you for contacting us',
      html: `
        <h3>Thank you for reaching out!</h3>
        <p>Dear ${name},</p>
        <p>This is an automated confirmation that we've received your message. We'll get back to you as soon as possible.</p>
        <p>Best regards,</p>
        <p>Gaurav Dond</p>
      `
    };
    
    await transporter.sendMail(autoReplyOptions);
    
    res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});