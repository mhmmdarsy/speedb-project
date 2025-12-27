import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/routes
 */
router.get("/routes", async (_req, res) => {
  console.log("HIT /api/routes");

  const { data, error } = await supabase.from("routes").select("*");

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ routes: data });
});

/**
 * GET /api/schedules
 */
router.get("/admin/schedules", async (_req, res) => {
  console.log("HIT /api/schedules");

  const { data, error } = await supabase.from("schedules").select("*");

  if (error) {
    console.error("SUPABASE ERROR /schedules:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ schedules: data ?? [] });
});

/**
 * POST /api/bookings
 */
router.post("/bookings", async (req, res) => {
  const payload = req.body;

  if (!payload.passengerName || !payload.passengerPhone) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...payload,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ booking: data });
});

/**
 * GET /api/bookings/:id
 */
router.get("/bookings/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Booking not found" });
  }

  res.json({ booking: data });
});

/**
 * PUT /api/bookings/:id/status
 */
router.put("/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status required" });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

/**
 * POST /api/payment/create
 * (sementara stub)
 */
router.post("/payment/create", async (_req, res) => {
  // nanti isi Midtrans
  res.json({
    token: "dummy-midtrans-token",
  });
});

export default router;
