"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/site-content — public
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM site_content").all();
  return res.json(rows);
});

// PATCH /api/site-content — admin only (upsert by section + key)
router.patch("/", requireAuth, (req, res) => {
  const updates = req.body; // expects array: [{section, key, value}]
  if (!Array.isArray(updates)) return res.status(400).json({ error: "Body must be an array" });
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO site_content (id, section, key, value, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(section, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const transaction = db.transaction((items) => {
    for (const item of items) {
      upsert.run(uuidv4(), item.section, item.key, item.value ?? "", now);
    }
  });
  transaction(updates);
  return res.json({ success: true });
});

module.exports = router;
