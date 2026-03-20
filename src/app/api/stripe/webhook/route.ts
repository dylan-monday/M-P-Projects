import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/stripe";
import type Stripe from "stripe";

// Use service role for webhook handler (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const projectId = session.metadata?.project_id;
      const paymentType = session.metadata?.payment_type as "deposit" | "final";

      if (!projectId || !paymentType) {
        console.error("Missing metadata in checkout session:", session.id);
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      console.log(`Processing ${paymentType} payment for project ${projectId}`);

      // Update project based on payment type
      const updateData: Record<string, unknown> = {};

      if (paymentType === "deposit") {
        updateData.deposit_paid = true;
        updateData.deposit_paid_at = new Date().toISOString();
        updateData.deposit_stripe_session_id = session.id;
        updateData.status = "in_progress";
      } else if (paymentType === "final") {
        updateData.final_paid = true;
        updateData.final_paid_at = new Date().toISOString();
        updateData.final_stripe_session_id = session.id;
        updateData.status = "complete";
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", projectId);

      if (updateError) {
        console.error("Failed to update project:", updateError);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }

      // Update milestone if applicable
      if (paymentType === "deposit") {
        // Mark "Deposit received" milestone as complete
        await supabase
          .from("milestones")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("project_id", projectId)
          .ilike("title", "%deposit%");
      } else if (paymentType === "final") {
        // Mark "Final payment" milestone as complete
        await supabase
          .from("milestones")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("project_id", projectId)
          .ilike("title", "%final%");
      }

      // Add a note about the payment
      await supabase.from("notes").insert({
        project_id: projectId,
        content:
          paymentType === "deposit"
            ? "Deposit received. Project is now in progress. I'll be in touch within 24 hours with next steps."
            : "Final payment received. Thank you! The project will be launched within 24 hours.",
        author: "System",
      });

      console.log(`Successfully processed ${paymentType} payment for project ${projectId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
