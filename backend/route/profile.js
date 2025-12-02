import { Router } from "express";
import { connection } from "../database/connection.js";
import bcrypt from "bcryptjs";

import { sendEmail } from "../utils/sendmail.js";

const profile = Router();

const twoFACodes = {};

// get user profile
profile.get("/:email", async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT u_first_name, u_last_name, u_email, UIN, is_admin FROM users WHERE u_email = ?",
      [req.params.email]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//change profile information
profile.put("/update", async (req, res) => {
  const { email, firstName, lastName, uin } = req.body;
  console.log(req.body);
  try {
    await connection.promise().query(
      "UPDATE users SET u_first_name=?, u_last_name=?, UIN=? WHERE u_email=?",
      [firstName, lastName, uin, email]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
profile.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get user by email
    const [rows] = await connection.promise().query(
      "SELECT u_password FROM users WHERE u_email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.u_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update DB
    await connection.promise().query(
      "UPDATE users SET u_password = ? WHERE u_email = ?",
      [hashed, email]
    );

    // (optional) Send confirmation email
    await sendEmail(
      email,
      "Password Changed",
      `<p>Your password has been successfully updated.</p>`
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Step 1: verify info and send code
profile.post("/forgot-password/request", async (req, res) => {
  const { email, firstName, lastName, uin } = req.body;

  if (!email || !firstName || !lastName || !uin)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE u_email = ? AND u_first_name = ? AND u_last_name = ? AND UIN = ?",
      [email, firstName, lastName, uin]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found or info incorrect" });

    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    twoFACodes[email] = code;

    await sendEmail(email, "Password Reset Code", `Your 2FA code is: ${code}`);

    res.json({ message: "2FA code sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Step 2: verify code and reset password
profile.post("/forgot-password/reset", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  const storedCode = twoFACodes[email];
  if (!storedCode)
    return res.status(400).json({ message: "No 2FA code found for this email" });

  if (parseInt(code) !== storedCode)
    return res.status(400).json({ message: "Invalid 2FA code" });

  delete twoFACodes[email];

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await connection.promise().query(
      "UPDATE users SET u_password = ? WHERE u_email = ?",
      [hashed, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// For advising portal help
// Get user id (and maybe basic info) by email
profile.get("/id/:email", async (req, res) => { 
  try {
    const [rows] = await connection.promise().query(
      "SELECT u_ID, u_first_name, u_last_name FROM users WHERE u_email = ?",
      [req.params.email]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]); // will return { id: ..., u_first_name: ..., u_last_name: ... }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




export default profile;