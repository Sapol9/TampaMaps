import Stripe from "stripe";

// Cache verified session IDs with timestamp (24 hour TTL)
const verifiedSessions = new Map<string, { verified: boolean; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * Clean up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of verifiedSessions.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      verifiedSessions.delete(key);
    }
  }
}

/**
 * Verify that a Stripe session has been paid
 * Returns true only if payment is confirmed
 */
export async function verifyPayment(sessionId: string): Promise<boolean> {
  if (!sessionId) {
    console.log("[PaymentVerification] No session ID provided");
    return false;
  }

  // Check cache first
  const cached = verifiedSessions.get(sessionId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[PaymentVerification] Cache hit for ${sessionId}: ${cached.verified}`);
    return cached.verified;
  }

  // Clean up old entries periodically
  if (verifiedSessions.size > 100) {
    cleanupCache();
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(`[PaymentVerification] Session ${sessionId}:`);
    console.log(`  - payment_status: ${session.payment_status}`);
    console.log(`  - mode: ${session.mode}`);

    let isPaid = false;

    if (session.mode === "subscription") {
      // For subscriptions, verify the subscription is active
      if (session.subscription) {
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        isPaid = subscription.status === "active" || subscription.status === "trialing";
        console.log(`  - subscription status: ${subscription.status}`);
      }
    } else {
      // For one-time payments, check payment_status
      isPaid = session.payment_status === "paid";
    }

    // Cache the result
    verifiedSessions.set(sessionId, { verified: isPaid, timestamp: Date.now() });
    console.log(`[PaymentVerification] Result: ${isPaid ? "PAID" : "NOT PAID"}`);

    return isPaid;
  } catch (error) {
    console.error("[PaymentVerification] Error verifying payment:", error);
    // Cache failed verifications to prevent repeated API calls
    verifiedSessions.set(sessionId, { verified: false, timestamp: Date.now() });
    return false;
  }
}

/**
 * Clear a session from cache (useful after refunds)
 */
export function clearSessionCache(sessionId: string): void {
  verifiedSessions.delete(sessionId);
}