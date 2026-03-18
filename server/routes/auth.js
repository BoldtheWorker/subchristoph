"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: { id: admin.id, email: admin.email, isAdmin: true },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// POST /api/auth/logout — stateless; client just drops the token
router.post("/logout", (_req, res) => {
  return res.json({ success: true });
});

module.exports = router;
