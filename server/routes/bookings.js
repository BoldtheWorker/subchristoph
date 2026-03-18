"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings — public
router.post("/", (req, res) => {
  const { service, client_name, client_email, client_phone, preferred_date, message, amount_kobo } = req.body;
  if (!service || !client_name || !client_email || !client_phone || !preferred_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO bookings (id, service, client_name, client_email, client_phone, preferred_date, message, amount_kobo, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', ?, ?)
  `).run(id, service, client_name, client_email, client_phone, preferred_date, message ?? null, amount_kobo ?? null, now, now);

  return res.status(201).json(db.prepare("SELECT * FROM bookings WHERE id = ?").get(id));
});

// GET /api/bookings — admin only
router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
  return res.json(rows);
});

// PATCH /api/bookings/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { status, admin_notes, paystack_reference } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE bookings SET status = ?, admin_notes = ?, paystack_reference = ?, updated_at = ? WHERE id = ?
  `).run(
    status ?? existing.status,
    admin_notes ?? existing.admin_notes,
    paystack_reference ?? existing.paystack_reference,
    now,
    req.params.id
  );

  return res.json(db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id));
});

module.exports = router;
