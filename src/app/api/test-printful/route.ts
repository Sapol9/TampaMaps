import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      error: "PRINTFUL_API_KEY not configured",
      hasKey: false,
    });
  }

  console.log("🔑 Testing Printful API with key:", apiKey.slice(0, 10) + "...");

  try {
    // Test 1: Get store info
    const storeResponse = await fetch("https://api.printful.com/store", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const storeData = await storeResponse.json();

    // Test 2: Get available products for canvas (product_id: 3)
    const productsResponse = await fetch("https://api.printful.com/products/3", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const productsData = await productsResponse.json();

    // Find variant 7 (18x24 canvas)
    const variant7 = productsData.result?.variants?.find(
      (v: { id: number }) => v.id === 7
    );

    return NextResponse.json({
      success: storeResponse.ok,
      hasKey: true,
      keyPrefix: apiKey.slice(0, 10) + "...",
      store: {
        status: storeResponse.status,
        data: storeData,
      },
      product: {
        status: productsResponse.status,
        name: productsData.result?.product?.title,
        variant7: variant7
          ? {
              id: variant7.id,
              name: variant7.name,
              size: variant7.size,
              price: variant7.price,
            }
          : "Not found",
      },
    });
  } catch (error) {
    console.error("❌ Printful API test failed:", error);
    return NextResponse.json({
      error: "API request failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hasKey: true,
      keyPrefix: apiKey.slice(0, 10) + "...",
    });
  }
}