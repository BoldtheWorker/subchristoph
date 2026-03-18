"use strict";
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const db = new Database(path.join(dataDir, "db.sqlite"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id         TEXT PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id                  TEXT PRIMARY KEY,
    service             TEXT NOT NULL,
    client_name         TEXT NOT NULL,
    client_email        TEXT NOT NULL,
    client_phone        TEXT NOT NULL,
    preferred_date      TEXT NOT NULL,
    message             TEXT,
    status              TEXT NOT NULL DEFAULT 'pending_payment',
    amount_kobo         INTEGER,
    paystack_reference  TEXT,
    admin_notes         TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS portfolio_items (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    category    TEXT NOT NULL,
    image_url   TEXT,
    media_url   TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    content         TEXT NOT NULL DEFAULT '',
    excerpt         TEXT,
    category        TEXT,
    cover_image_url TEXT,
    is_published    INTEGER NOT NULL DEFAULT 0,
    published_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS faq_items (
    id           TEXT PRIMARY KEY,
    question     TEXT NOT NULL,
    answer       TEXT NOT NULL,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    short_title TEXT,
    description TEXT,
    icon        TEXT NOT NULL DEFAULT 'Mic',
    price       INTEGER NOT NULL DEFAULT 0,
    sub_services TEXT NOT NULL DEFAULT '[]',
    category    TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id         TEXT PRIMARY KEY,
    section    TEXT NOT NULL,
    key        TEXT NOT NULL,
    value      TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(section, key)
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id          TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_role TEXT,
    content     TEXT NOT NULL,
    rating      INTEGER NOT NULL DEFAULT 5,
    is_featured INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Seed default admin if none exists ────────────────────────────────────────
const { v4: uuidv4 } = require("uuid");

const adminCount = db.prepare("SELECT COUNT(*) as c FROM admins").get();
if (adminCount.c === 0) {
  const defaultPassword = "admin123";
  const hash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare("INSERT INTO admins (id, email, password) VALUES (?, ?, ?)").run(
    uuidv4(),
    "admin@christophmedia.com",
    hash
  );
  console.log("─────────────────────────────────────────────");
  console.log("Default admin created:");
  console.log("  Email:    admin@christophmedia.com");
  console.log("  Password: admin123");
  console.log("Change this password after first login!");
  console.log("─────────────────────────────────────────────");
}

module.exports = db;
