import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (data.user.user_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // optional: attach user to request
  (req as any).user = data.user;

  next();
}
