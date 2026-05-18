import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client constructed directly from @supabase/supabase-js
 * with the service role key. Use this for admin operations that need the
 * `.auth.admin.*` API (createUser, listUsers, etc.) — operations that aren't
 * available through the @supabase/ssr server client.
 *
 * For ordinary RLS-bypass queries inside route handlers, prefer
 * `createAdminClient()` from ./server. This file is only for the auth-admin
 * surface.
 */
export function createAuthAdminClient(): SupabaseClient {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
