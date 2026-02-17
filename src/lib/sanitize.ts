/**
 * Input validation and sanitization utilities
 *
 * Used to prevent SVG injection, XSS, and validate user inputs
 * before they reach the render server or database.
 */

/**
 * Sanitize text input by removing dangerous characters and enforcing length limits
 *
 * Allows: letters (unicode), numbers, spaces, periods, commas, hyphens,
 * apostrophes, degree symbols (°), and forward slashes
 */
export function sanitizeText(input: unknown, maxLength: number = 100): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove HTML/XML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove control characters (except newlines and tabs which we'll strip separately)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Remove any remaining newlines and tabs
  sanitized = sanitized.replace(/[\n\r\t]/g, " ");

  // Only allow safe characters: letters (unicode), numbers, spaces, and specific punctuation
  // This regex allows unicode letters (\p{L}), numbers, and specific safe characters
  sanitized = sanitized.replace(/[^\p{L}\p{N}\s.,\-'°/]/gu, "");

  // Collapse multiple spaces into one
  sanitized = sanitized.replace(/\s+/g, " ");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Validate that center is a valid [longitude, latitude] tuple
 */
export function validateCoordinates(center: unknown): center is [number, number] {
  if (!Array.isArray(center) || center.length !== 2) {
    return false;
  }

  const [lng, lat] = center;

  if (typeof lng !== "number" || typeof lat !== "number") {
    return false;
  }

  // Check for NaN or Infinity
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return false;
  }

  // Validate ranges: longitude -180 to 180, latitude -90 to 90
  if (lng < -180 || lng > 180) {
    return false;
  }

  if (lat < -90 || lat > 90) {
    return false;
  }

  return true;
}

/**
 * Validate that zoom is a valid map zoom level (0-22)
 */
export function validateZoom(zoom: unknown): zoom is number {
  if (typeof zoom !== "number") {
    return false;
  }

  if (!Number.isFinite(zoom)) {
    return false;
  }

  return zoom >= 0 && zoom <= 22;
}

/**
 * Validate that themeId is one of the known theme IDs
 */
export function sanitizeThemeId(themeId: unknown, validThemes: string[]): string | null {
  if (typeof themeId !== "string") {
    return null;
  }

  // Normalize to lowercase for comparison
  const normalizedId = themeId.toLowerCase().trim();

  if (validThemes.includes(normalizedId)) {
    return normalizedId;
  }

  return null;
}

/**
 * Validate that detailLineType is one of the valid options
 */
export function validateDetailLineType(
  value: unknown
): value is "coordinates" | "address" | "none" {
  return value === "coordinates" || value === "address" || value === "none";
}

/**
 * Validate that priceType is one of the valid options
 */
export function validatePriceType(value: unknown): value is "single" | "subscription" {
  return value === "single" || value === "subscription";
}

/**
 * Validate string input with max length
 */
export function validateStringLength(
  value: unknown,
  maxLength: number
): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

/**
 * Validate optional focus point
 */
export function validateFocusPoint(
  focusPoint: unknown
): focusPoint is { lat: number; lng: number; address?: string } | undefined {
  if (focusPoint === undefined || focusPoint === null) {
    return true;
  }

  if (typeof focusPoint !== "object") {
    return false;
  }

  const fp = focusPoint as Record<string, unknown>;

  if (typeof fp.lat !== "number" || typeof fp.lng !== "number") {
    return false;
  }

  if (!Number.isFinite(fp.lat) || !Number.isFinite(fp.lng)) {
    return false;
  }

  if (fp.lat < -90 || fp.lat > 90 || fp.lng < -180 || fp.lng > 180) {
    return false;
  }

  if (fp.address !== undefined && typeof fp.address !== "string") {
    return false;
  }

  return true;
}