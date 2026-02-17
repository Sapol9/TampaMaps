import { NextRequest, NextResponse } from "next/server";
import { getCompletedOrder } from "@/lib/orderStorage";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const orderData = getCompletedOrder(sessionId);

  if (!orderData) {
    // Order not yet processed or not found
    return NextResponse.json({
      status: "pending",
      mockupUrl: null,
      printfulOrderId: null,
    });
  }

  return NextResponse.json({
    status: "completed",
    mockupUrl: orderData.mockupUrl,
    printfulOrderId: orderData.printfulOrderId,
  });
}