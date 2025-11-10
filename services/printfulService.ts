// Secure Printful Service - Uses Netlify Functions to keep API key server-side
// The API key is NEVER exposed to the browser

const NETLIFY_FUNCTION_URL = '/.netlify/functions/printful';

export interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string;
  currency: string;
  is_ignored: boolean;
  sku: string;
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
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
  }>;
}

export interface PrintfulProductDetails {
  sync_product: PrintfulProduct;
  sync_variants: PrintfulVariant[];
}

/**
 * Fetch store products from Printful via secure serverless function
 * These are YOUR actual products in your Printful store
 */
export const getStoreProducts = async () => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTION_URL}?action=products`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching Printful store products:', error);
    throw error;
  }
};

/**
 * Get product details from your store via secure serverless function
 */
export const getStoreProductById = async (productId: string | number) => {
  try {
    const response = await fetch(
      `${NETLIFY_FUNCTION_URL}?action=product&productId=${productId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch product details');
    }

    return result.data || null;
  } catch (error) {
    console.error(`Error fetching store product details for ${productId}:`, error);
    throw error;
  }
};

export default {
  getStoreProducts,
  getStoreProductById,
};

