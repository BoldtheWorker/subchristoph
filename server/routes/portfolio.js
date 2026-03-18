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

// GET /api/portfolio — public
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM portfolio_items ORDER BY sort_order ASC, created_at DESC").all();
  return res.json(rows.map(mapRow));
});

// POST /api/portfolio — admin only
router.post("/", requireAuth, (req, res) => {
  const { title, description, category, image_url, media_url, is_featured, sort_order } = req.body;
  if (!title || !category) return res.status(400).json({ error: "title and category required" });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO portfolio_items (id, title, description, category, image_url, media_url, is_featured, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description ?? null, category, image_url ?? null, media_url ?? null, is_featured ? 1 : 0, sort_order ?? 0, now, now);
  return res.status(201).json(mapRow(db.prepare("SELECT * FROM portfolio_items WHERE id = ?").get(id)));
});

// PATCH /api/portfolio/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM portfolio_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const f = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE portfolio_items SET title=?, description=?, category=?, image_url=?, media_url=?, is_featured=?, sort_order=?, updated_at=? WHERE id=?
  `).run(f.title ?? existing.title, f.description ?? existing.description, f.category ?? existing.category,
    f.image_url ?? existing.image_url, f.media_url ?? existing.media_url,
    f.is_featured !== undefined ? (f.is_featured ? 1 : 0) : existing.is_featured,
    f.sort_order ?? existing.sort_order, now, req.params.id);
  return res.json(mapRow(db.prepare("SELECT * FROM portfolio_items WHERE id = ?").get(req.params.id)));
});

// DELETE /api/portfolio/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const info = db.prepare("DELETE FROM portfolio_items WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true });
});

module.exports = router;
