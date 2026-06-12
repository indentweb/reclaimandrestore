import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Supabase renamed "anon key" to "publishable key" in their dashboard (sb_publishable_… prefix)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Singleton so only one GoTrueClient instance exists in the browser
let _browserClient: ReturnType<typeof createClient> | null = null;

/**
 * Browser / client-component client — uses the anon key.
 * Safe to call from client components (AdminDashboard, etc.).
 */
export function browserClient() {
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}

/**
 * Server-side client — uses the service role key.
 * NEVER import this in client components or `NEXT_PUBLIC_` files.
 * Used only in API routes and server actions.
 */
export function serverClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export const GALLERY_BUCKET = "gallery";
