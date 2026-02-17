import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPendingOrder,
  deletePendingOrder,
  storeCompletedOrder,
} from "@/lib/orderStorage";

// Lazy-initialize to avoid build-time errors when env vars aren't available
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
function getPrintfulApiKey() {
  return process.env.PRINTFUL_API_KEY!;
}
function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET!;
}

// Printful 18x24 Canvas product variant ID
// Product: Canvas (ID: 3), Variant: 18"×24" (ID: 7)
const PRINTFUL_PRODUCT_ID = 3; // Canvas (in)
const PRINTFUL_VARIANT_ID = 7; // 18x24 canvas

interface PrintfulFileResponse {
  code: number;
  result: {
    id: number;
    type: string;
    hash: string;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi: number;
    status: string;
    created: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
  };
}

interface PrintfulOrderResponse {
  code: number;
  result: {
    id: number;
    external_id: string;
    store: number;
    status: string;
    shipping: string;
    created: number;
    updated: number;
    recipient: {
      name: string;
      address1: string;
      city: string;
      state_code: string;
      country_code: string;
      zip: string;
    };
    items: Array<{
      id: number;
      external_id: string;
      variant_id: number;
      sync_variant_id: number;
      quantity: number;
      price: string;
      retail_price: string;
      name: string;
      product: {
        variant_id: number;
        product_id: number;
        image: string;
        name: string;
      };
      files: Array<{
        id: number;
        type: string;
        hash: string;
        url: string;
        filename: string;
        mime_type: string;
        size: number;
        width: number;
        height: number;
        dpi: number;
        status: string;
        created: number;
      }>;
    }>;
    costs: {
      currency: string;
      subtotal: string;
      discount: string;
      shipping: string;
      digitization: string;
      additional_fee: string;
      fulfillment_fee: string;
      tax: string;
      vat: string;
      total: string;
    };
  };
}

interface PrintfulMockupResponse {
  code: number;
  result: {
    task_key: string;
    status: string;
  };
}

interface PrintfulMockupTaskResponse {
  code: number;
  result: {
    task_key: string;
    status: string;
    mockups?: Array<{
      placement: string;
      variant_ids: number[];
      mockup_url: string;
      extra: Array<{
        title: string;
        url: string;
      }>;
    }>;
    error?: string;
  };
}

async function uploadFileToPrintful(
  imageDataUrl: string,
  filename: string
): Promise<PrintfulFileResponse> {
  // Extract base64 content from data URL
  // Format: data:image/jpeg;base64,BASE64DATA
  const base64Match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) {
    throw new Error("Invalid data URL format");
  }

  const base64Content = base64Match[2];

  const response = await fetch("https://api.printful.com/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPrintfulApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "default",
      data: base64Content, // Use data field for base64
      filename,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Printful file upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function createPrintfulOrder(
  fileUrl: string,
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    email?: string;
  },
  externalId: string,
  productName: string
): Promise<PrintfulOrderResponse> {
  const response = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPrintfulApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      recipient,
      items: [
        {
          variant_id: PRINTFUL_VARIANT_ID,
          quantity: 1,
          name: productName,
          files: [
            {
              type: "default",
              url: fileUrl,
            },
          ],
        },
      ],
      confirm: false, // Manual order approval
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Printful order creation failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function generateMockup(fileUrl: string): Promise<string> {
  // Start mockup generation task
  const createResponse = await fetch(
    `https://api.printful.com/mockup-generator/create-task/${PRINTFUL_PRODUCT_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getPrintfulApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variant_ids: [PRINTFUL_VARIANT_ID],
        format: "jpg",
        files: [
          {
            placement: "default",
            image_url: fileUrl,
            position: {
              area_width: 1800,
              area_height: 2400,
              width: 1800,
              height: 2400,
              top: 0,
              left: 0,
            },
          },
        ],
      }),
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Mockup generation failed:", errorText);
    throw new Error(`Mockup generation failed: ${createResponse.status}`);
  }

  const createResult: PrintfulMockupResponse = await createResponse.json();
  const taskKey = createResult.result.task_key;

  // Poll for task completion
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    const taskResponse = await fetch(
      `https://api.printful.com/mockup-generator/task?task_key=${taskKey}`,
      {
        headers: {
          Authorization: `Bearer ${getPrintfulApiKey()}`,
        },
      }
    );

    if (!taskResponse.ok) {
      attempts++;
      continue;
    }

    const taskResult: PrintfulMockupTaskResponse = await taskResponse.json();

    console.log("🔍 Mockup task status:", taskResult.result.status);

    if (taskResult.result.status === "completed" && taskResult.result.mockups) {
      const mockup = taskResult.result.mockups[0];

      // Log full mockup response for debugging
      console.log("🖼️ Mockup response:", JSON.stringify({
        placement: mockup?.placement,
        variant_ids: mockup?.variant_ids,
        mockup_url: mockup?.mockup_url,
        extra_count: mockup?.extra?.length || 0,
        extra_titles: mockup?.extra?.map(e => e.title) || [],
      }, null, 2));

      // Look for a lifestyle/room mockup in the extras array first
      if (mockup?.extra && mockup.extra.length > 0) {
        // Prefer mockups with "room", "lifestyle", or "wall" in the title
        const lifestyleMockup = mockup.extra.find(
          (e) => /room|lifestyle|wall|interior/i.test(e.title)
        );
        if (lifestyleMockup) {
          console.log("✅ Found lifestyle mockup:", lifestyleMockup.title, lifestyleMockup.url);
          return lifestyleMockup.url;
        }
        // Otherwise return the first extra mockup (usually a better angle)
        console.log("✅ Using extra mockup:", mockup.extra[0].title, mockup.extra[0].url);
        return mockup.extra[0].url;
      }

      // Fallback to main mockup URL
      console.log("⚠️ No extras found, using main mockup_url:", mockup?.mockup_url);
      return mockup?.mockup_url || "";
    }

    if (taskResult.result.status === "failed") {
      throw new Error(`Mockup generation failed: ${taskResult.result.error}`);
    }

    attempts++;
  }

  throw new Error("Mockup generation timed out");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  const isProduction = process.env.VERCEL_ENV === "production";
  const isValidSecret = webhookSecret && webhookSecret !== "whsec_your_webhook_secret_here";
  let event: Stripe.Event;

  // SECURITY: In production, ALWAYS require webhook signature verification
  if (isProduction && !isValidSecret) {
    console.error("🔴 CRITICAL: STRIPE_WEBHOOK_SECRET is not configured in production!");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    if (isValidSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Development mode ONLY - parse without verification
      event = JSON.parse(body) as Stripe.Event;
      console.warn("⚠️ [DEV ONLY] Webhook signature verification skipped - DO NOT USE IN PRODUCTION");
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Early return for unhandled event types
  if (event.type !== "checkout.session.completed") {
    console.log(`[Webhook] Ignoring event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  // Handle checkout.session.completed
  const eventSession = event.data.object as Stripe.Checkout.Session;

  console.log("📦 Processing completed checkout:", eventSession.id);

  try {
    // Get the stored order data
    const orderData = getPendingOrder(eventSession.id);

    if (!orderData) {
      console.error("No pending order found for session:", eventSession.id);
      return NextResponse.json({ error: "No order data found" }, { status: 400 });
    }

    // Retrieve full session with shipping details
    const fullSession = await stripe.checkout.sessions.retrieve(eventSession.id);

    // Get shipping details from session (type assertion needed)
    const shippingDetails = (fullSession as unknown as {
      shipping_details?: {
        name?: string | null;
        address?: Stripe.Address | null;
      } | null
    }).shipping_details;
    const customerDetails = fullSession.customer_details;

    if (!shippingDetails?.address) {
      console.error("No shipping address in session:", eventSession.id);
      return NextResponse.json({ error: "No shipping address" }, { status: 400 });
    }

    const { cityName, stateName, themeName, imageUrl } = orderData;
    const productName = `${cityName}, ${stateName} Map Canvas - ${themeName}`;
    const filename = `mapmarked-${cityName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.jpg`;

    console.log("📤 Uploading file to Printful...");

    // 1. Upload file to Printful
    const fileResponse = await uploadFileToPrintful(imageUrl, filename);
    const fileUrl = fileResponse.result.url;

    console.log("✅ File uploaded:", fileUrl);

    // 2. Create Printful order
    console.log("📝 Creating Printful order...");

    const recipient = {
      name: shippingDetails.name || customerDetails?.name || "Customer",
      address1: shippingDetails.address.line1 || "",
      address2: shippingDetails.address.line2 || undefined,
      city: shippingDetails.address.city || "",
      state_code: shippingDetails.address.state || "",
      country_code: shippingDetails.address.country || "US",
      zip: shippingDetails.address.postal_code || "",
      email: customerDetails?.email || undefined,
    };

    const orderResponse = await createPrintfulOrder(
      fileUrl,
      recipient,
      eventSession.id,
      productName
    );

    console.log("✅ Printful order created:", orderResponse.result.id);

    // 3. Generate mockup
    console.log("🖼️ Generating mockup...");

    let mockupUrl = "";
    try {
      mockupUrl = await generateMockup(fileUrl);
      console.log("✅ Mockup generated:", mockupUrl);
    } catch (mockupError) {
      console.error("Mockup generation failed (non-critical):", mockupError);
      // Continue without mockup - non-critical failure
    }

    // 4. Store completed order data for confirmation page
    storeCompletedOrder(eventSession.id, {
      mockupUrl,
      printfulOrderId: orderResponse.result.id,
    });

    // Clean up pending order
    deletePendingOrder(eventSession.id);

    console.log("✅ Order processing complete for session:", eventSession.id);

  } catch (error) {
    console.error("Error processing order:", error);
    // Don't return error - Stripe will retry if we return non-200
    // Log the error but acknowledge receipt
  }

  return NextResponse.json({ received: true });
}