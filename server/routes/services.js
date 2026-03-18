"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    sub_services: JSON.parse(row.sub_services || "[]"),
    is_active: !!row.is_active,
  };
}

// GET /api/services — public
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC").all();
  return res.json(rows.map(mapRow));
});

// GET /api/services/all — admin (all including inactive)
router.get("/all", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM services ORDER BY sort_order ASC").all();
  return res.json(rows.map(mapRow));
});

// POST /api/services — admin only
router.post("/", requireAuth, (req, res) => {
  const { title, short_title, description, icon, price, sub_services, category, sort_order, is_active } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO services (id, title, short_title, description, icon, price, sub_services, category, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, short_title ?? null, description ?? null, icon ?? "Mic", price ?? 0,
    JSON.stringify(sub_services ?? []), category ?? null, sort_order ?? 0, is_active !== false ? 1 : 0, now, now);
  return res.status(201).json(mapRow(db.prepare("SELECT * FROM services WHERE id = ?").get(id)));
});

// PATCH /api/services/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const f = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE services SET title=?, short_title=?, description=?, icon=?, price=?, sub_services=?, category=?, sort_order=?, is_active=?, updated_at=? WHERE id=?
  `).run(f.title ?? existing.title, f.short_title ?? existing.short_title, f.description ?? existing.description,
    f.icon ?? existing.icon, f.price ?? existing.price,
    f.sub_services !== undefined ? JSON.stringify(f.sub_services) : existing.sub_services,
    f.category ?? existing.category, f.sort_order ?? existing.sort_order,
    f.is_active !== undefined ? (f.is_active ? 1 : 0) : existing.is_active, now, req.params.id);
  return res.json(mapRow(db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id)));
});

// DELETE /api/services/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const info = db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true });
});

module.exports = router;
