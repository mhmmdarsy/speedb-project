// middleware/auth.ts
import { createClient } from "@supabase/supabase-js";
import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.user = data.user;
  next();
}
