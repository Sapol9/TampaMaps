import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// Stripe Price IDs - these should be created in Stripe Dashboard
// For now, we'll create prices on the fly (not recommended for production)
// TODO: Replace with actual Stripe Price IDs from Dashboard
const PRICES = {
  single: {
    amount: 500, // $5.00 in cents
    name: "Single Download",
    description: "One watermark-free download at 300 DPI",
  },
  subscription: {
    amount: 1000, // $10.00 in cents
    name: "Unlimited Downloads",
    description: "Unlimited watermark-free downloads for 30 days",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceType, returnUrl } = body;

    if (!priceType || !["single", "subscription"].includes(priceType)) {
      return NextResponse.json(
        { error: "Invalid price type" },
        { status: 400 }
      );
    }

    // Validate Stripe key is present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Get the base URL
    const isProduction = process.env.VERCEL_ENV === "production";
    const baseUrl = isProduction
      ? "https://mapmarked.com"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : request.nextUrl.origin;

    const stripe = getStripe();
    const price = PRICES[priceType as keyof typeof PRICES];

    if (priceType === "subscription") {
      // Create subscription checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: price.name,
                description: price.description,
              },
              unit_amount: price.amount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${returnUrl || baseUrl}?paid=true&type=subscription&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || baseUrl}?canceled=true`,
        metadata: {
          type: "subscription",
        },
      });

      return NextResponse.json({ url: session.url });
    } else {
      // Create one-time payment checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: price.name,
                description: price.description,
              },
              unit_amount: price.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${returnUrl || baseUrl}?paid=true&type=single&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || baseUrl}?canceled=true`,
        metadata: {
          type: "single",
        },
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create checkout session", details: errorMessage },
      { status: 500 }
    );
  }
}