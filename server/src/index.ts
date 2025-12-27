import "dotenv/config";
import { app } from "./app";

const PORT = process.env.PORT || 4000;

console.log("ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  HAS_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
