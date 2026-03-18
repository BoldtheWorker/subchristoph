"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import DB (runs schema setup + seeding)
require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/bookings",     require("./routes/bookings"));
app.use("/api/blog",         require("./routes/blog"));
app.use("/api/portfolio",    require("./routes/portfolio"));
app.use("/api/services",     require("./routes/services"));
app.use("/api/faq",          require("./routes/faq"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/site-content", require("./routes/site-content"));
app.use("/api/upload",       require("./routes/upload"));
app.use("/api/paystack",     require("./routes/paystack"));

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, "../dist")));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Catch-all for React Router ──────────────────────────────────────────────
app.get("*", (req, res) => {
  // If request is not an API call, serve index.html
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

app.listen(PORT, () => {
  console.log(`\nChristoph API server running on http://localhost:${PORT}`);
});
