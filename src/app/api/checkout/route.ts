import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { storePendingOrder } from "@/lib/orderStorage";

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityName, stateName, themeName, imageDataUrl } = body;

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
      success_url: `${request.nextUrl.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata: {
        cityName,
        stateName,
        themeName,
      },
    });

    // Store the image data for the webhook to use later
    if (imageDataUrl && session.id) {
      storePendingOrder(session.id, {
        imageDataUrl,
        cityName,
        stateName,
        themeName,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}