import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

/**
 * GET /api/admin/bookings
 */
router.get("/admin/bookings", requireAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ bookings: data });
});

/**
 * POST /api/admin/register
 * Hanya admin yang boleh membuat admin baru
 */
router.post("/admin/register", requireAdmin, async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib" });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      name,
      role: "admin",
    },
    email_confirm: true,
  });

  if (error) {
    console.error("CREATE ADMIN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({
    admin: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

router.post("/admin/routes", requireAdmin, async (req, res) => {
  const { origin, destination, price, duration, isActive } = req.body;

  const { data, error } = await supabase
    .from("routes")
    .insert({
      origin,
      destination,
      price,
      duration,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ route: data });
});

router.put("/admin/routes/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { origin, destination, price, duration, isActive } = req.body;

  const { data, error } = await supabase
    .from("routes")
    .update({
      origin,
      destination,
      price,
      duration,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ route: data });
});

router.delete("/admin/routes/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("routes").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

export default router;
