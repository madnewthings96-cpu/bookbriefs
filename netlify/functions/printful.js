const https = require('https');

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_API_URL = 'https://api.printful.com';

// Helper function to make HTTPS requests
function makeRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, PRINTFUL_API_URL);
    
    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({
              statusCode: res.statusCode,
              message: parsed.error || 'Request failed',
              data: parsed
            });
          }
        } catch (error) {
          reject({
            statusCode: res.statusCode,
            message: 'Failed to parse response',
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        statusCode: 500,
        message: error.message
      });
    });

    req.end();
  });
}

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
    // Check if API key is configured
    if (!PRINTFUL_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Printful API key not configured' }),
      };
    }

    // Get query parameters
    const { action = 'products', productId } = event.queryStringParameters || {};

    let endpoint;

    // Handle different actions
    switch (action) {
      case 'products':
        // Fetch store products (your actual synced products)
        endpoint = '/store/products';
        break;

      case 'product':
        if (!productId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'productId is required' }),
          };
        }
        endpoint = `/store/products/${productId}`;
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action parameter' }),
        };
    }

    // Make request to Printful API
    const data = await makeRequest(endpoint);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data.result || data,
      }),
    };
  } catch (error) {
    console.error('Printful API error:', error);
    
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch from Printful',
        details: error.data || null,
      }),
    };
  }
};
