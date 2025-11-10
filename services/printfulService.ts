// Secure Printful Service - Uses Netlify Functions to keep API key server-side
// The API key is NEVER exposed to the browser

const NETLIFY_FUNCTION_URL = '/.netlify/functions/printful';

export interface PrintfulProduct {
  id: number;
  name: string;
  description?: string;
  image?: string;
  main_category_id?: number;
  type?: string;
  brand?: string;
  model?: string;
  files?: any[];
}

/**
 * Fetch catalog products from Printful via secure serverless function
 */
export const getCatalogProducts = async (limit = 100, offset = 0) => {
  try {
    const response = await fetch(
      `${NETLIFY_FUNCTION_URL}?action=products&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching Printful catalog products:', error);
    throw error;
  }
};

/**
 * Get product details from catalog via secure serverless function
 */
export const getCatalogProductById = async (productId: number) => {
  try {
    const response = await fetch(
      `${NETLIFY_FUNCTION_URL}?action=product&productId=${productId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch product details');
    }

    return result.data || null;
  } catch (error) {
    console.error(`Error fetching catalog product details for ${productId}:`, error);
    throw error;
  }
};

/**
 * Get catalog variants for a product via secure serverless function
 */
export const getCatalogVariants = async (productId: number) => {
  try {
    const response = await fetch(
      `${NETLIFY_FUNCTION_URL}?action=variants&productId=${productId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch variants');
    }

    return result.data || [];
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    throw error;
  }
};

export default {
  getCatalogProducts,
  getCatalogProductById,
  getCatalogVariants,
};

