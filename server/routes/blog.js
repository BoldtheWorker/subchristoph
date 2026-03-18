"use strict";
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Helper — parse boolean-like SQLite integers
function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    is_published: !!row.is_published,
  };
}

// GET /api/blog — public, published posts only (admins see all)
router.get("/", (req, res) => {
  const isAdmin = req.headers.authorization?.startsWith("Bearer ");
  const rows = isAdmin
    ? db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all()
    : db.prepare("SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC").all();
  return res.json(rows.map(mapRow));
});

// GET /api/blog/:slug
router.get("/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(mapRow(row));
});

// POST /api/blog — admin only
router.post("/", requireAuth, (req, res) => {
  const { title, slug, content, excerpt, category, cover_image_url, is_published } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "title and slug required" });

  const id = uuidv4();
  const now = new Date().toISOString();
  const published = is_published ? 1 : 0;
  const published_at = published ? now : null;

  db.prepare(`
    INSERT INTO blog_posts (id, title, slug, content, excerpt, category, cover_image_url, is_published, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, slug, content ?? "", excerpt ?? null, category ?? null, cover_image_url ?? null, published, published_at, now, now);

  return res.status(201).json(mapRow(db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(id)));
});

// PATCH /api/blog/:id — admin only
router.patch("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const fields = req.body;
  const now = new Date().toISOString();
  const published = fields.is_published !== undefined ? (fields.is_published ? 1 : 0) : existing.is_published;
  const published_at = published && !existing.published_at ? now : existing.published_at;

  db.prepare(`
    UPDATE blog_posts SET
      title = ?, slug = ?, content = ?, excerpt = ?, category = ?,
      cover_image_url = ?, is_published = ?, published_at = ?, updated_at = ?
    WHERE id = ?
  `).run(
    fields.title ?? existing.title,
    fields.slug ?? existing.slug,
    fields.content ?? existing.content,
    fields.excerpt ?? existing.excerpt,
    fields.category ?? existing.category,
    fields.cover_image_url ?? existing.cover_image_url,
    published,
    published_at,
    now,
    req.params.id
  );

  return res.json(mapRow(db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(req.params.id)));
});

// DELETE /api/blog/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const info = db.prepare("DELETE FROM blog_posts WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true });
});

module.exports = router;
