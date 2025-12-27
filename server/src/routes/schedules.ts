import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

/**
 * POST /api/admin/schedules
 */
router.post("/admin/schedules", requireAdmin, async (req, res) => {
  const {
    route_id,
    departure_date,
    departure_time,
    total_seats,
    available_seats,
  } = req.body;

  if (!departure_time) {
    return res.status(400).json({
      error: "departure_time is required",
    });
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert([
      {
        route_id,
        departure_date,
        departure_time,
        total_seats,
        available_seats,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ schedule: data });
});

/**
 * PUT /api/admin/schedules/:id
 */
router.put("/admin/schedules/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    route_id,
    departure_date,
    departure_time,
    total_seats,
    available_seats,
  } = req.body;

  const { error } = await supabase
    .from("schedules")
    .update({
      route_id,
      departure_date,
      departure_time,
      total_seats,
      available_seats,
    })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

/**
 * DELETE /api/admin/schedules/:id
 */
router.delete("/admin/schedules/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

export default router;
