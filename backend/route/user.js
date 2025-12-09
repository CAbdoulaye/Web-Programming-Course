import { Router } from "express";
import { connection } from "../database/connection.js";
import bcrypt from "bcryptjs";

// Import password hashing function
// import { hashPassword } from "../utils/helper.js";
// // Import compare password function
// import { comparePassword } from "../utils/helper.js";
// // Import send email function
import { sendEmail } from "../utils/sendmail.js";
import fetch from 'node-fetch'; // Add this import at the top if not already


const user = Router(); 

// Temporary store for 2FA codes
const twoFACodes = {};
 


const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; // Set your secret in env

async function verifyRecaptcha(token, remoteip) {
  const params = new URLSearchParams();
  params.append('secret', RECAPTCHA_SECRET);
  params.append('response', token);
  if (remoteip) params.append('remoteip', remoteip);

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params,
  });
  return response.json();
}

user.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  // console.log("recaptcha token:", recaptchaToken);
 

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA token is required" });
  }

  // try {
  //   // Verify reCAPTCHA token first
  //   const recaptchaResponse = await verifyRecaptcha(recaptchaToken, req.ip);
  //   if (!recaptchaResponse.success) {
  //     return res.status(401).json({ message: "Failed reCAPTCHA verification" });
  //   }

  const secretKey = process.env.RECAPTCHA_SECRET;
    // console.log("secret Key:", secretKey);


  const googleRes = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`
    }
  );

  const data = await googleRes.json();
  // console.log("Google Response:", data);


  if (!data.success) {
    return res.status(401).json({ message: "Failed reCAPTCHA verification" });
  }

    // Existing login logic below

    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE u_email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    if (user.is_verified === 0) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.u_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2FA email code logic stays the same
    const code = Math.floor(100000 + Math.random() * 900000);
    twoFACodes[email] = code;
    const subject = "Login Notification - 2FA";
    const htmlBody = `
      <p>Hi ${user.u_first_name},</p>
      <p>You have successfully logged in to your account.</p>
      <p>Your verification Code is: ${code}</p>
      <p>If this wasn't you, please reset your password immediately.</p>
      <br/>
      <p>Regards,<br/>Your Advisor</p>
    `;

    sendEmail(user.u_email, subject, htmlBody);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.u_first_name,
        lastName: user.u_last_name,
        email: user.u_email,
        isAdmin: user.is_admin
      }
    });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
});


user.get("/", (req, res) => {
  ////write logic
  connection.execute("select * from users", function (err, result) {
    if (err) {
      return res.json({ message: err.message });
    }
    // response json
    res.json({
      status: 200,
      message: "Response from get api",
      result: result,
    });
  });
});

// Register route
user.post("/register", async(req, res) => {

  const { firstName, lastName,  email, password, uin } = req.body;
  console.log(req.body);

  // Simple validation
  if (!firstName || !lastName ||!uin ||!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const [existing] = await connection.promise().query(
      "SELECT * FROM users WHERE u_email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user into DB, verified = 0 initially
    await connection.promise().query(
      "INSERT INTO `users`( `u_first_name`, `u_last_name`, `u_email`, `u_password`, `UIN`,`is_verified`, `is_admin`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, uin, 0, 0]
    );

    // TODO: send verification email
    console.log(`Send verification email to ${email}`);
        // TODO: Implement 2FA here (email, SMS, DUO push)
    // Send login email
    const code = Math.floor(100000 + Math.random() * 900000);
    twoFACodes[email] = code;
    const subject = "Login Notification - 2FA";
    const htmlBody = `
      <p>Hi ${firstName},</p>
      <p>You have successfully Created your account.</p>
      <p>Your verification Code is: ${code}</p>
      <br/>
      <p>Regards,<br/>Your Advisor</p>
    `;

    console.log(email, subject, htmlBody);
    sendEmail(email, subject, htmlBody);

    res.status(201).json({
      message: "User registered successfully. Check email to verify.",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
// user.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     // Get user from DB
//     const [rows] = await connection.promise().query(
//       "SELECT * FROM users WHERE u_email = ?",
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const user = rows[0];

//     // Check if user is verified
//     if (user.is_verified === 0) {
//       return res.status(403).json({ message: "Email not verified" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.u_password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // TODO: Implement 2FA here (email, SMS, DUO push)
//     // Send login email
//     const code = Math.floor(100000 + Math.random() * 900000);
//     twoFACodes[email] = code;
//     const subject = "Login Notification - 2FA";
//     const htmlBody = `
//       <p>Hi ${user.u_first_name},</p>
//       <p>You have successfully logged in to your account.</p>
//       <p>Your verification Code is: ${code}</p>
//       <p>If this wasn't you, please reset your password immediately.</p>
//       <br/>
//       <p>Regards,<br/>Your Advisor</p>
//     `;

//     console.log(user.u_email, subject, htmlBody);
//     sendEmail(user.u_email, subject, htmlBody);

//     // Successful login
//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         firstName: user.u_first_name,
//         lastName: user.u_last_name,
//         email: user.u_email,
//         isAdmin: user.is_admin
//       } 
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Verify 2FA code
user.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  const storedCode = twoFACodes[email];
  if (!storedCode) {
    return res.status(400).json({ message: "No 2FA code found for this email" });
  }

  if (parseInt(code) !== storedCode) {
    return res.status(400).json({ message: "Invalid 2FA code" });
  }

  // Code is correct, remove it from memory
  delete twoFACodes[email];

  try {
    // check if user is authenticated. authenticate if not done yet
    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE u_email = ?",
      [email]
    );

      const user = rows[0];
      if (user.is_verified == 0) {
        await connection.promise().query(
        "UPDATE `users` SET `is_verified`= 1 WHERE u_email = ?",
        [email]
      );
      }

    res.status(200).json({ message: "2FA verification successful" });
    }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default user;