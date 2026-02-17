import { NextRequest, NextResponse } from "next/server";

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY!;
const PRINTFUL_PRODUCT_ID = 3; // Canvas (in)
const PRINTFUL_VARIANT_ID = 7; // 18x24 canvas

interface PrintfulFileResponse {
  code: number;
  result: {
    id: number;
    type: string;
    hash: string;
    url: string | null;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi: number | null;
    status: string;
    created: number;
    thumbnail_url: string | null;
    preview_url: string | null;
    visible: boolean;
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

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, filename } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json({ error: "Missing imageDataUrl" }, { status: 400 });
    }

    // Check data URL size
    const sizeInMB = (imageDataUrl.length * 0.75) / (1024 * 1024);
    console.log(`📤 Uploading image to Printful (~${sizeInMB.toFixed(1)} MB)...`);

    // Extract base64 content from data URL
    const base64Match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      console.error("Invalid data URL format");
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const base64Content = base64Match[2];

    // 1. Upload file to Printful
    const fileResponse = await fetch("https://api.printful.com/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "default",
        data: base64Content,
        filename: filename || `mockup-${Date.now()}.jpg`,
      }),
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error("Printful file upload failed:", errorText);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    const fileResult: PrintfulFileResponse = await fileResponse.json();
    const fileId = fileResult.result.id;
    console.log("✅ File uploaded, ID:", fileId);

    // 2. Start mockup generation using file_id (not image_url)
    console.log("🖼️ Starting mockup generation with file ID:", fileId);
    const createResponse = await fetch(
      `https://api.printful.com/mockup-generator/create-task/${PRINTFUL_PRODUCT_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_ids: [PRINTFUL_VARIANT_ID],
          format: "jpg",
          files: [
            {
              placement: "default",
              file_id: fileId, // Use file_id instead of image_url
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
      return NextResponse.json({ error: "Mockup generation failed" }, { status: 500 });
    }

    const createResult: PrintfulMockupResponse = await createResponse.json();
    const taskKey = createResult.result.task_key;
    console.log("🔄 Mockup task started:", taskKey);

    // 3. Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // Up to 60 seconds

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const taskResponse = await fetch(
        `https://api.printful.com/mockup-generator/task?task_key=${taskKey}`,
        {
          headers: {
            Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          },
        }
      );

      if (!taskResponse.ok) {
        attempts++;
        continue;
      }

      const taskResult: PrintfulMockupTaskResponse = await taskResponse.json();

      if (attempts % 5 === 0) {
        console.log("🔍 Mockup status:", taskResult.result.status);
      }

      if (taskResult.result.status === "completed" && taskResult.result.mockups) {
        const mockup = taskResult.result.mockups[0];

        console.log("🖼️ Mockup completed:", JSON.stringify({
          mockup_url: mockup?.mockup_url,
          extra_count: mockup?.extra?.length || 0,
          extra_titles: mockup?.extra?.map(e => e.title) || [],
        }, null, 2));

        // Look for lifestyle/room mockup
        if (mockup?.extra && mockup.extra.length > 0) {
          const lifestyleMockup = mockup.extra.find(
            (e) => /room|lifestyle|wall|interior/i.test(e.title)
          );
          if (lifestyleMockup) {
            console.log("✅ Found lifestyle mockup:", lifestyleMockup.title);
            return NextResponse.json({ mockupUrl: lifestyleMockup.url });
          }
          console.log("✅ Using first extra mockup:", mockup.extra[0].title);
          return NextResponse.json({ mockupUrl: mockup.extra[0].url });
        }

        // Fallback to main mockup
        console.log("⚠️ No extras, using main mockup_url");
        return NextResponse.json({ mockupUrl: mockup?.mockup_url || "" });
      }

      if (taskResult.result.status === "failed") {
        console.error("Mockup generation failed:", taskResult.result.error);
        return NextResponse.json({ error: "Mockup generation failed" }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: "Mockup generation timed out" }, { status: 500 });
  } catch (error) {
    console.error("Error generating mockup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}