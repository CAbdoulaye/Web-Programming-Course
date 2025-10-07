// Load environment variables from .env file
import "dotenv/config";

// Import nodemailer's createTransport function
import { createTransport } from "nodemailer";

/**
 * Sends an email using SMTP (Gmail in this case)
 * 
 * @param {string} email - Recipient's email address
 * @param {string} mailSubject - Subject of the email
 * @param {string} body - HTML content of the email
 */
export function sendEmail(email, mailSubject, body) {
  // Create a transporter object using SMTP transport
  const transport = createTransport({
    host: "smtp.gmail.com",    // Gmail SMTP server
    port: 587,                 // TLS port for Gmail
    secure: false,             // Use TLS, not SSL
    requireTLS: true,          // Force TLS
    auth: {
      user: process.env.SMTP_EMAIL,     // Your Gmail address (from .env)
      pass: process.env.SMTP_PASSWORD,  // Your Gmail app password (from .env)
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_EMAIL, // Sender address (must match authenticated user)
    to: email,                    // Recipient email
    subject: mailSubject,         // Email subject line
    html: body,                   // Email body as HTML
  };

  // Send the email
  transport.sendMail(mailOptions, function (err, result) {
    if (err) {
      console.error(err);
      console.log("Error in sending email"); // Log failure
    } else {
      console.log("Email has been sent");    // Log success
    }
  });
}