const https = require('https');

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_API_URL = 'https://api.printful.com';

// Helper function to make HTTPS requests
function makeRequest(endpoint, method = 'GET', data = null) {
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
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
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
            data: responseData
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
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

    const { variantId, recipient, paypalOrderId } = JSON.parse(event.body);

    // Validate required fields
    if (!variantId || !recipient || !paypalOrderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['variantId', 'recipient', 'paypalOrderId']
        }),
      };
    }

    // Validate recipient fields
    const requiredRecipientFields = ['name', 'email', 'address1', 'city', 'state_code', 'country_code', 'zip'];
    const missingFields = requiredRecipientFields.filter(field => !recipient[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing recipient information',
          missing: missingFields
        }),
      };
    }

    // Create order in Printful
    const orderData = {
      recipient: {
        name: recipient.name,
        address1: recipient.address1,
        city: recipient.city,
        state_code: recipient.state_code,
        country_code: recipient.country_code,
        zip: recipient.zip,
        email: recipient.email,
      },
      items: [
        {
          sync_variant_id: parseInt(variantId),
          quantity: 1,
        },
      ],
      retail_costs: {
        currency: 'USD',
        shipping: '0',
      },
      external_id: paypalOrderId, // Link to PayPal order ID
    };

    console.log('Creating Printful order:', orderData);

    // Make request to Printful API
    const data = await makeRequest('/orders', 'POST', orderData);

    console.log('Printful order created successfully:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        printfulOrder: data.result || data,
      }),
    };
  } catch (error) {
    console.error('Error creating Printful order:', error);
    
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to create Printful order',
        details: error.data || null,
      }),
    };
  }
};
