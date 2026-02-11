/**
 * Simple in-memory storage for order data between checkout and webhook.
 * In production, use Redis or a database.
 */

interface OrderData {
  imageDataUrl: string;
  cityName: string;
  stateName: string;
  themeName: string;
  createdAt: number;
}

interface MockupData {
  mockupUrl: string;
  printfulOrderId: number;
  createdAt: number;
}

// In-memory storage (cleared on server restart)
// For production, use Redis or database
const pendingOrders = new Map<string, OrderData>();
const completedOrders = new Map<string, MockupData>();

// Clean up old entries (older than 1 hour)
const CLEANUP_THRESHOLD = 60 * 60 * 1000; // 1 hour

function cleanup() {
  const now = Date.now();
  for (const [key, value] of pendingOrders.entries()) {
    if (now - value.createdAt > CLEANUP_THRESHOLD) {
      pendingOrders.delete(key);
    }
  }
  for (const [key, value] of completedOrders.entries()) {
    if (now - value.createdAt > CLEANUP_THRESHOLD * 24) { // Keep mockups for 24 hours
      completedOrders.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000);

export function storePendingOrder(sessionId: string, data: OrderData): void {
  pendingOrders.set(sessionId, { ...data, createdAt: Date.now() });
}

export function getPendingOrder(sessionId: string): OrderData | undefined {
  return pendingOrders.get(sessionId);
}

export function deletePendingOrder(sessionId: string): void {
  pendingOrders.delete(sessionId);
}

export function storeCompletedOrder(sessionId: string, data: Omit<MockupData, "createdAt">): void {
  completedOrders.set(sessionId, { ...data, createdAt: Date.now() });
}

export function getCompletedOrder(sessionId: string): MockupData | undefined {
  return completedOrders.get(sessionId);
}