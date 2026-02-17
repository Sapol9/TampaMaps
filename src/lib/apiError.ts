import { NextResponse } from "next/server";

/**
 * Log full error details server-side and return a generic error to the client
 *
 * SECURITY: Never expose internal error details, stack traces, or
 * third-party service error messages to clients.
 */
export function logAndRespond(
  error: unknown,
  publicMessage: string,
  status: number = 500
): NextResponse {
  // Log full error details server-side for debugging
  console.error("[API Error]", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    error,
  });

  // Return only a generic message to the client
  return NextResponse.json({ error: publicMessage }, { status });
}

/**
 * Create an error response without logging (for expected errors like validation)
 */
export function errorResponse(
  publicMessage: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: publicMessage }, { status });
}