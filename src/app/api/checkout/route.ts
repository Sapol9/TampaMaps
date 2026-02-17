import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // imageUrl is the Vercel Blob URL (uploaded separately to avoid payload limits)
    const { cityName, stateName, themeName, imageUrl } = body;

    // Get the base URL - use production domain for checkout redirects
    // VERCEL_ENV is 'production' on the main branch, 'preview' on PR branches
    const isProduction = process.env.VERCEL_ENV === "production";
    const baseUrl = isProduction
      ? "https://mapmarked.com"
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);

    console.log("📍 Checkout baseUrl:", baseUrl, "| VERCEL_ENV:", process.env.VERCEL_ENV);

    // Validate Stripe key is present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout session for $94 canvas print
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${cityName}, ${stateName} Map Canvas`,
              description: `18" x 24" Gallery Canvas - ${themeName} Theme`,
            },
            unit_amount: 9400, // $94.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 10,
              },
            },
          },
        },
      ],
      success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        cityName,
        stateName,
        themeName,
        imageUrl, // Store image URL in Stripe metadata for webhook retrieval
      },
    });

    console.log("✅ Checkout session created:", session.id);
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);
    // Return more details in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create checkout session", details: errorMessage },
      { status: 500 }
    );
  }
}