import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { projectId, paymentType } = await request.json();

    if (!projectId || !paymentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (paymentType !== "deposit" && paymentType !== "final") {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch project with client info
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        client:clients(*)
      `)
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Determine which price ID to use
    const priceId =
      paymentType === "deposit"
        ? project.deposit_stripe_price_id
        : project.final_stripe_price_id;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this project" },
        { status: 400 }
      );
    }

    // Check if payment already made
    if (paymentType === "deposit" && project.deposit_paid) {
      return NextResponse.json(
        { error: "Deposit already paid" },
        { status: 400 }
      );
    }

    if (paymentType === "final" && project.final_paid) {
      return NextResponse.json(
        { error: "Final payment already made" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      projectId: project.id,
      projectSlug: project.slug,
      priceId,
      paymentType,
      clientEmail: project.client?.email || "",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
