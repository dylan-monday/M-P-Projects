/**
 * Admin tool: generate a magic-link URL for any client email so you can
 * preview their exact view of the portal without needing access to their
 * inbox.
 *
 * Usage:
 *   npx tsx scripts/generate-magic-link.ts <email>
 *
 * Example:
 *   npx tsx scripts/generate-magic-link.ts madeline.kawanaka@la.gov
 *
 * Output: a one-time login URL. Open it in an incognito/private browser
 * window (so it doesn't pollute your admin session). You'll land on
 * /projects authenticated as that user, with exactly the data they'd see.
 *
 * Notes:
 *   - The link is single-use and expires per Supabase's default magic
 *     link TTL (usually 1 hour).
 *   - If the user doesn't have an auth.users record yet (e.g. they haven't
 *     signed in for the first time), this script creates one for them
 *     using admin.createUser with email_confirm: true.
 *   - Treat this script as admin-only. Anyone who can run it can sign in
 *     as anyone.
 *   - This works against whatever environment your .env.local points to.
 *     If you want to test production, point NEXT_PUBLIC_APP_URL at
 *     https://projects.mondayandpartners.com. If you want to test local
 *     dev, point it at http://localhost:3000.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureUserExists(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Failed to list users:", error.message);
    process.exit(1);
  }

  const existing = data.users.find((u) => u.email === email);
  if (existing) {
    return existing;
  }

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

  if (createError || !created.user) {
    console.error(
      "Failed to create auth user:",
      createError?.message || "unknown error"
    );
    process.exit(1);
  }

  console.log(`  (created new auth user for ${email})`);
  return created.user;
}

async function main() {
  const email = process.argv[2];

  if (!email || !email.includes("@")) {
    console.error("Usage: npx tsx scripts/generate-magic-link.ts <email>");
    console.error(
      "  Example: npx tsx scripts/generate-magic-link.ts madeline.kawanaka@la.gov"
    );
    process.exit(1);
  }

  console.log(`Generating magic link for ${email}...`);
  await ensureUserExists(email);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://projects.mondayandpartners.com";
  const redirectTo = `${appUrl}/api/auth/callback?redirect=/projects`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("Failed to generate magic link:", error.message);
    process.exit(1);
  }

  const actionLink = (data as { properties?: { action_link?: string } })
    ?.properties?.action_link;

  if (!actionLink) {
    console.error("No action_link in Supabase response. Got:", data);
    process.exit(1);
  }

  console.log("\n────────────────────────────────────────────────────────");
  console.log("One-time login URL for", email);
  console.log("────────────────────────────────────────────────────────");
  console.log("\n" + actionLink + "\n");
  console.log("Open in an incognito/private browser window.");
  console.log("Expires within ~1 hour. Single use. Do not share.\n");
}

main();
