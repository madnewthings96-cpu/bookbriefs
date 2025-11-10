import { PrintfulClient } from 'printful-sdk-js-v2';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get API key from environment variable (server-side only)
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Printful API key not configured' }),
      };
    }

    // Initialize Printful client
    const printfulClient = new PrintfulClient({ TOKEN: apiKey });

    // Get query parameters
    const { limit = '20', offset = '0', action = 'products', productId } = event.queryStringParameters || {};

    let response;

    // Handle different actions
    switch (action) {
      case 'products':
        response = await printfulClient.catalogV2.getProducts(
          undefined, // categoryIds
          undefined, // colors
          parseInt(limit),
          undefined, // new
          parseInt(offset)
        );
        break;

      case 'product':
        if (!productId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'productId is required' }),
          };
        }
        response = await printfulClient.catalogV2.getProductById(parseInt(productId));
        break;

      case 'variants':
        if (!productId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'productId is required' }),
          };
        }
        response = await printfulClient.catalogV2.getProductVariantsById(parseInt(productId));
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action parameter' }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: response || [],
      }),
    };
  } catch (error) {
    console.error('Printful API error:', error);
    
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch from Printful',
      }),
    };
  }
};
