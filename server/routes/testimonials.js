"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  if (!row) return null;
  return { ...row, is_featured: !!row.is_featured };
}

// GET /api/testimonials — public
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC").all();
  return res.json(rows.map(mapRow));
});

// POST /api/testimonials — admin only
router.post("/", requireAuth, (req, res) => {
  const { client_name, client_role, content, rating, is_featured, sort_order } = req.body;
  if (!client_name || !content) return res.status(400).json({ error: "client_name and content required" });
  const id = uuidv4();
  const now = new Date().toISOString();
  const count = db.prepare("SELECT COUNT(*) as c FROM testimonials").get().c;
  db.prepare(`
    INSERT INTO testimonials (id, client_name, client_role, content, rating, is_featured, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, client_name, client_role ?? null, content, rating ?? 5, is_featured ? 1 : 0, sort_order ?? count, now, now);
  return res.status(201).json(mapRow(db.prepare("SELECT * FROM testimonials WHERE id = ?").get(id)));
});

// PATCH /api/testimonials/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM testimonials WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const f = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE testimonials SET client_name=?, client_role=?, content=?, rating=?, is_featured=?, sort_order=?, updated_at=? WHERE id=?
  `).run(f.client_name ?? existing.client_name, f.client_role ?? existing.client_role,
    f.content ?? existing.content, f.rating ?? existing.rating,
    f.is_featured !== undefined ? (f.is_featured ? 1 : 0) : existing.is_featured,
    f.sort_order ?? existing.sort_order, now, req.params.id);
  return res.json(mapRow(db.prepare("SELECT * FROM testimonials WHERE id = ?").get(req.params.id)));
});

// DELETE /api/testimonials/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const info = db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true });
});

module.exports = router;
