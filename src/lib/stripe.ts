import Stripe from "stripe";

/**
 * Server-side Stripe client
 * Use for creating checkout sessions, products, prices, etc.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/{slug}?payment=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/{slug}?payment=cancelled`,
} as const;

/**
 * Create a Stripe Checkout Session for a project payment
 */
export async function createCheckoutSession({
  projectId,
  projectSlug,
  priceId,
  paymentType,
  clientEmail,
}: {
  projectId: string;
  projectSlug: string;
  priceId: string;
  paymentType: "deposit" | "final";
  clientEmail: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: STRIPE_CONFIG.successUrl.replace("{slug}", projectSlug),
    cancel_url: STRIPE_CONFIG.cancelUrl.replace("{slug}", projectSlug),
    customer_email: clientEmail,
    metadata: {
      project_id: projectId,
      payment_type: paymentType,
      client_email: clientEmail,
    },
  });

  return session;
}

/**
 * Create Stripe products and prices for a new project
 */
export async function createProjectPayments({
  projectTitle,
  depositAmount,
  finalAmount,
}: {
  projectTitle: string;
  depositAmount: number; // in cents
  finalAmount: number; // in cents
}) {
  // Create deposit product and price
  const depositProduct = await stripe.products.create({
    name: `${projectTitle} — Deposit`,
    description: `50% deposit for ${projectTitle}`,
  });

  const depositPrice = await stripe.prices.create({
    product: depositProduct.id,
    unit_amount: depositAmount,
    currency: "usd",
  });

  // Create final payment product and price
  const finalProduct = await stripe.products.create({
    name: `${projectTitle} — Final Payment`,
    description: `Final payment for ${projectTitle}`,
  });

  const finalPrice = await stripe.prices.create({
    product: finalProduct.id,
    unit_amount: finalAmount,
    currency: "usd",
  });

  return {
    deposit: {
      productId: depositProduct.id,
      priceId: depositPrice.id,
    },
    final: {
      productId: finalProduct.id,
      priceId: finalPrice.id,
    },
  };
}

/**
 * Verify a Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
