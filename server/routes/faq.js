"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  if (!row) return null;
  return { ...row, is_published: !!row.is_published };
}

// GET /api/faq — public (published only), admin sees all
router.get("/", (req, res) => {
  const isAdmin = !!req.headers.authorization;
  const rows = isAdmin
    ? db.prepare("SELECT * FROM faq_items ORDER BY sort_order ASC").all()
    : db.prepare("SELECT * FROM faq_items WHERE is_published = 1 ORDER BY sort_order ASC").all();
  return res.json(rows.map(mapRow));
});

// POST /api/faq — admin only
router.post("/", requireAuth, (req, res) => {
  const { question, answer, sort_order, is_published } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "question and answer required" });
  const id = uuidv4();
  const now = new Date().toISOString();
  const existingCount = db.prepare("SELECT COUNT(*) as c FROM faq_items").get().c;
  db.prepare(`
    INSERT INTO faq_items (id, question, answer, sort_order, is_published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, question, answer, sort_order ?? existingCount + 1, is_published !== false ? 1 : 0, now, now);
  return res.status(201).json(mapRow(db.prepare("SELECT * FROM faq_items WHERE id = ?").get(id)));
});

// PATCH /api/faq/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM faq_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const f = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE faq_items SET question=?, answer=?, sort_order=?, is_published=?, updated_at=? WHERE id=?
  `).run(f.question ?? existing.question, f.answer ?? existing.answer, f.sort_order ?? existing.sort_order,
    f.is_published !== undefined ? (f.is_published ? 1 : 0) : existing.is_published, now, req.params.id);
  return res.json(mapRow(db.prepare("SELECT * FROM faq_items WHERE id = ?").get(req.params.id)));
});

// DELETE /api/faq/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const info = db.prepare("DELETE FROM faq_items WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true });
});

module.exports = router;
