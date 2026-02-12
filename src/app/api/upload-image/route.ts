import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, filename } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json({ error: "Missing imageDataUrl" }, { status: 400 });
    }

    // Extract base64 content from data URL
    const base64Match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeType = base64Match[1];
    const base64Content = base64Match[2];

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Generate filename
    const blobFilename = filename || `mapmarked-${Date.now()}.jpg`;

    console.log(`📤 Uploading image to Vercel Blob (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`);

    // Upload to Vercel Blob
    const blob = await put(blobFilename, buffer, {
      access: "public",
      contentType: mimeType,
    });

    console.log("✅ Image uploaded to Vercel Blob:", blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("❌ Image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload image", details: errorMessage },
      { status: 500 }
    );
  }
}