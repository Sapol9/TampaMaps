/**
 * Printful Product Configuration
 *
 * To find your variant IDs:
 * 1. Log into Printful Dashboard
 * 2. Go to Product Catalog > Canvas
 * 3. Select "Gallery Wrapped Canvas"
 * 4. Find 18x24" variant
 * 5. Use the Printful API to get exact variant ID:
 *    GET https://api.printful.com/products/{product_id}
 *
 * Documentation: https://www.printful.com/docs
 */

export const PRINTFUL_PRODUCTS = {
  "18x24_gallery_wrap": {
    // Printful product: Gallery Wrapped Canvas
    productId: 1, // Update with actual Printful product ID
    variantId: "YOUR_VARIANT_ID", // Update with actual variant ID for 18x24
    name: '18" × 24" Gallery Wrapped Canvas',
    dimensions: {
      width: 18,
      height: 24,
      depth: 1.25,
      unit: "in",
    },
    printFile: {
      width: 5400,
      height: 7200,
      dpi: 300,
      format: "png",
    },
  },
} as const;

export const PRINTFUL_CONFIG = {
  apiBaseUrl: "https://api.printful.com",
  // API key should be stored in environment variable
  // PRINTFUL_API_KEY in .env.local
} as const;

/**
 * Generate Printful order payload
 */
export function createPrintfulOrderPayload(options: {
  styleId: string;
  cityId: string;
  imageUrl: string;
  recipient: {
    name: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
  };
}) {
  const product = PRINTFUL_PRODUCTS["18x24_gallery_wrap"];

  return {
    recipient: options.recipient,
    items: [
      {
        variant_id: product.variantId,
        quantity: 1,
        files: [
          {
            type: "default",
            url: options.imageUrl,
          },
        ],
        options: [],
      },
    ],
  };
}
