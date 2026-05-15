/**
 * One-off script to set the admin user's password.
 *
 * The portal uses magic link for clients by default. The admin
 * (Dylan) uses email + password so day-to-day access doesn't
 * require an inbox round-trip.
 *
 * Usage:
 *   npx tsx scripts/set-admin-password.ts "your-password-here"
 *
 * Prerequisites:
 *   - ADMIN_EMAIL set in .env.local (e.g. dylan@mondayandpartners.com)
 *   - SUPABASE_SERVICE_ROLE_KEY set in .env.local
 *   - Admin user record already exists in auth.users
 *     (created on first magic-link sign-in, or via this script)
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setAdminPassword() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const password = process.argv[2];

  if (!adminEmail) {
    console.error("ADMIN_EMAIL not set in .env.local");
    process.exit(1);
  }

  if (!password || password.length < 12) {
    console.error("Pass a password of at least 12 characters as the first arg.");
    console.error('  Example: npx tsx scripts/set-admin-password.ts "MyStrongPw!2026"');
    process.exit(1);
  }

  // Find existing user
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const existing = list.users.find((u) => u.email === adminEmail);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
    });
    if (error) {
      console.error("Failed to update password:", error.message);
      process.exit(1);
    }
    console.log(`Password updated for ${adminEmail}`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create admin user:", error.message);
      process.exit(1);
    }
    console.log(`Admin user created with password for ${adminEmail}`);
  }
}

setAdminPassword();
