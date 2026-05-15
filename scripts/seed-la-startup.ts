/**
 * Seed Script for the Louisiana Startup Report 2026 project.
 *
 * Creates:
 *   - Client record for Madeline Kawanaka (LA.IO)
 *   - Project record with slug "la-startup-2026"
 *
 * Skips Stripe entirely (this engagement is procured through
 * government channels, not portal-driven deposit/final payments).
 *
 * Run with: npx tsx scripts/seed-la-startup.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROJECT_CONFIG = {
  client: {
    email: "madeline.kawanaka@la.gov",
    name: "Madeline Kawanaka",
    company: "Louisiana Innovation",
  },
  project: {
    slug: "la-startup-2026",
    title: "Louisiana Startup Report 2026",
    depositAmount: 0, // not collected through portal
    finalAmount: 0,   // not collected through portal
  },
};

async function seed() {
  console.log("Seeding LA Startup Report 2026...\n");

  try {
    // Client (insert or get)
    const { data: existingClient } = await supabase
      .from("clients")
      .select()
      .eq("email", PROJECT_CONFIG.client.email)
      .maybeSingle();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
      console.log("  Client exists:", PROJECT_CONFIG.client.email);
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert(PROJECT_CONFIG.client)
        .select()
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log("  Client created:", PROJECT_CONFIG.client.email);
    }

    // Project (insert or get)
    const { data: existingProject } = await supabase
      .from("projects")
      .select()
      .eq("slug", PROJECT_CONFIG.project.slug)
      .maybeSingle();

    if (existingProject) {
      console.log("  Project exists:", PROJECT_CONFIG.project.slug);
    } else {
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          slug: PROJECT_CONFIG.project.slug,
          title: PROJECT_CONFIG.project.title,
          client_id: clientId,
          status: "proposal",
          deposit_amount: PROJECT_CONFIG.project.depositAmount,
          final_amount: PROJECT_CONFIG.project.finalAmount,
        });

      if (projectError) throw projectError;
      console.log("  Project created:", PROJECT_CONFIG.project.slug);
    }

    console.log("\nSeed complete.");
    console.log("Once auth is wired up, Madeline can log in at /login");
    console.log("and access the proposal at /protected/p/la-startup-2026/");
  } catch (error) {
    console.error("\nSeed failed:", error);
    process.exit(1);
  }
}

seed();
