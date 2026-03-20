/**
 * Seed Script for Monday + Partners Client Portal
 *
 * Creates the first project (LGM/PPP) with:
 * - Client record
 * - Stripe products/prices
 * - Project record
 * - Default milestones
 * - Initial note
 *
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import "dotenv/config";

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// Project configuration
const PROJECT_CONFIG = {
  client: {
    email: "kevi@pecanpieproductions.com",
    name: "Kevin",
    company: "Looking Glass Media / Pecan Pie Productions",
  },
  project: {
    slug: "lgm-ppp",
    title: "LGM + PPP Website Rebuild",
    depositAmount: 500000, // $5,000 in cents
    finalAmount: 500000, // $5,000 in cents
  },
  milestones: [
    { title: "Research & wireframes", completed: true, sort_order: 0 },
    { title: "Proposal delivered", completed: true, sort_order: 1 },
    { title: "Deposit received", completed: false, sort_order: 2 },
    { title: "Design direction", completed: false, sort_order: 3 },
    { title: "Design + development", completed: false, sort_order: 4 },
    { title: "Review & approval", completed: false, sort_order: 5 },
    { title: "Final payment", completed: false, sort_order: 6 },
    { title: "Launch", completed: false, sort_order: 7 },
  ],
  initialNote: `Proposal delivered. Take your time reviewing — I'm available to discuss any questions. Call or text anytime.

This proposal page IS the first deliverable — a demonstration of the design direction and quality of work. The same care goes into every aspect of the project.

— Dylan`,
};

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    // Step 1: Create or get client
    console.log("1. Creating client record...");
    const { data: existingClient } = await supabase
      .from("clients")
      .select()
      .eq("email", PROJECT_CONFIG.client.email)
      .single();

    let clientId: string;

    if (existingClient) {
      console.log("   → Client already exists, using existing record");
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert(PROJECT_CONFIG.client)
        .select()
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log("   → Client created:", PROJECT_CONFIG.client.email);
    }

    // Step 2: Create Stripe products and prices
    console.log("\n2. Creating Stripe products and prices...");

    // Deposit product
    const depositProduct = await stripe.products.create({
      name: `${PROJECT_CONFIG.project.title} — Deposit`,
      description: `50% deposit to begin the ${PROJECT_CONFIG.project.title} project`,
      metadata: {
        project_slug: PROJECT_CONFIG.project.slug,
        payment_type: "deposit",
      },
    });

    const depositPrice = await stripe.prices.create({
      product: depositProduct.id,
      unit_amount: PROJECT_CONFIG.project.depositAmount,
      currency: "usd",
    });
    console.log("   → Deposit price created:", depositPrice.id);

    // Final payment product
    const finalProduct = await stripe.products.create({
      name: `${PROJECT_CONFIG.project.title} — Final Payment`,
      description: `Final payment upon completion and approval of ${PROJECT_CONFIG.project.title}`,
      metadata: {
        project_slug: PROJECT_CONFIG.project.slug,
        payment_type: "final",
      },
    });

    const finalPrice = await stripe.prices.create({
      product: finalProduct.id,
      unit_amount: PROJECT_CONFIG.project.finalAmount,
      currency: "usd",
    });
    console.log("   → Final price created:", finalPrice.id);

    // Step 3: Create or update project
    console.log("\n3. Creating project record...");
    const { data: existingProject } = await supabase
      .from("projects")
      .select()
      .eq("slug", PROJECT_CONFIG.project.slug)
      .single();

    let projectId: string;

    if (existingProject) {
      console.log("   → Project exists, updating Stripe IDs...");
      const { data: updatedProject, error: updateError } = await supabase
        .from("projects")
        .update({
          deposit_stripe_price_id: depositPrice.id,
          final_stripe_price_id: finalPrice.id,
        })
        .eq("id", existingProject.id)
        .select()
        .single();

      if (updateError) throw updateError;
      projectId = updatedProject.id;
    } else {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          slug: PROJECT_CONFIG.project.slug,
          title: PROJECT_CONFIG.project.title,
          client_id: clientId,
          status: "proposal",
          deposit_amount: PROJECT_CONFIG.project.depositAmount,
          deposit_stripe_price_id: depositPrice.id,
          final_amount: PROJECT_CONFIG.project.finalAmount,
          final_stripe_price_id: finalPrice.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      projectId = newProject.id;
      console.log("   → Project created:", PROJECT_CONFIG.project.slug);
    }

    // Step 4: Create milestones
    console.log("\n4. Creating milestones...");

    // Delete existing milestones for this project
    await supabase.from("milestones").delete().eq("project_id", projectId);

    const milestones = PROJECT_CONFIG.milestones.map((m) => ({
      ...m,
      project_id: projectId,
      completed_at: m.completed ? new Date().toISOString() : null,
    }));

    const { error: milestoneError } = await supabase
      .from("milestones")
      .insert(milestones);

    if (milestoneError) throw milestoneError;
    console.log("   → Created", milestones.length, "milestones");

    // Step 5: Create initial note
    console.log("\n5. Creating initial note...");

    // Check if note already exists
    const { data: existingNotes } = await supabase
      .from("notes")
      .select()
      .eq("project_id", projectId);

    if (!existingNotes || existingNotes.length === 0) {
      const { error: noteError } = await supabase.from("notes").insert({
        project_id: projectId,
        content: PROJECT_CONFIG.initialNote,
        author: "Dylan",
      });

      if (noteError) throw noteError;
      console.log("   → Initial note created");
    } else {
      console.log("   → Notes already exist, skipping");
    }

    // Summary
    console.log("\n✅ Seed complete!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Project URL: projects.mondayandpartners.com/" + PROJECT_CONFIG.project.slug);
    console.log("Client email:", PROJECT_CONFIG.client.email);
    console.log("Deposit:", "$" + (PROJECT_CONFIG.project.depositAmount / 100).toLocaleString());
    console.log("Final:", "$" + (PROJECT_CONFIG.project.finalAmount / 100).toLocaleString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 Next steps:");
    console.log("1. Run the schema.sql in Supabase SQL Editor");
    console.log("2. Configure Supabase Auth (magic links, redirect URLs)");
    console.log("3. Create Storage bucket 'project-files'");
    console.log("4. Deploy and register Stripe webhook endpoint");

  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
