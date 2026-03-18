"use strict";
const express = require("express");
const db = require("../db");

const router = express.Router();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// POST /api/paystack/initialize
router.post("/initialize", async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(400).json({ error: "Paystack not configured yet" });
  }

  const { email, amount, booking_id, callback_url } = req.body;
  if (!email || !amount || !booking_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        callback_url,
        metadata: {
          booking_id,
          custom_fields: [
            { display_name: "Booking ID", variable_name: "booking_id", value: booking_id },
          ],
        },
      }),
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      throw new Error(`Paystack error: ${JSON.stringify(data)}`);
    }

    // Save reference to booking
    db.prepare("UPDATE bookings SET paystack_reference = ? WHERE id = ?")
      .run(data.data.reference, booking_id);

    return res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/paystack/verify
router.post("/verify", async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(400).json({ error: "Paystack not configured" });
  }

  const { reference } = req.body;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const data = await verifyRes.json();
    if (!verifyRes.ok || !data.status) {
      throw new Error(`Paystack verification failed: ${JSON.stringify(data)}`);
    }

    const transaction = data.data;
    const bookingId = transaction.metadata?.booking_id;

    if (transaction.status === "success" && bookingId) {
      db.prepare("UPDATE bookings SET status = 'paid', paystack_reference = ? WHERE id = ?")
        .run(reference, bookingId);
      return res.json({ status: "success", booking_id: bookingId });
    }

    return res.json({ status: transaction.status, message: "Payment not successful" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
