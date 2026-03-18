"use strict";
const express = require("express");
const multer = require("multer");
const path = require("path");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter(_req, file, cb) {
    const allowed = /jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|pdf/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) ||
               allowed.test(file.mimetype);
    cb(null, ok);
  },
});

// POST /api/upload — admin only
router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const publicUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: publicUrl });
});

module.exports = router;
