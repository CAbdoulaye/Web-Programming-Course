// const express = require("express");
import express from "express";
import cors from 'cors';
import user from "./route/user.js";
import profile from "./route/profile.js";
import advising from "./route/advising.js";
// import user from "./route/user.js";



const app = express();

// ✅ Middleware
app.use(express.json());

app.use(cors()); 


app.use("/user", user);
app.use("/profile", profile);
app.use("/advising", advising);



// Simple test route
app.get("/", (req, res) => { 
  res.send("Backend is running successfully!");
});


// Start server
// const PORT = 5000;
const PORT = 8080;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
