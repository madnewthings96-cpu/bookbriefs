# Printful Integration - Security Guide

## 🔒 Secure Implementation

This implementation keeps your Printful API key **100% secure** and hidden from browsers and client-side code.

## Architecture

```
Browser → Netlify Serverless Function → Printful API
         (No API Key Exposed)        (API Key Secure)
```

## How It Works

1. **Client-Side (Browser)**: 
   - Calls `/.netlify/functions/printful` with query parameters
   - No API key is ever exposed in the browser

2. **Server-Side (Netlify Function)**:
   - Receives the request securely
   - Uses server-side environment variable `PRINTFUL_API_KEY`
   - Makes authenticated request to Printful API
   - Returns data to the browser

## Setup Instructions

### Local Development

1. **Environment Variable** (`.env.local`):
   ```bash
   PRINTFUL_API_KEY=u5VBDhOpGt5VObcOoP3rjVCcQvdcne3pMswBHuXB
   ```

2. **Test Locally** with Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```
   This will run your functions locally at `http://localhost:8888`

### Production Deployment (Netlify)

1. **Add Environment Variable in Netlify Dashboard**:
   - Go to: Site Settings → Environment Variables
   - Add key: `PRINTFUL_API_KEY`
   - Add value: `u5VBDhOpGt5VObcOoP3rjVCcQvdcne3pMswBHuXB`
   - ✅ Save

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Add secure Printful integration"
   git push
   ```

## API Endpoints

The serverless function supports multiple actions:

### Get Products
```
GET /.netlify/functions/printful?action=products&limit=20&offset=0
```

### Get Product Details
```
GET /.netlify/functions/printful?action=product&productId=123
```

### Get Product Variants
```
GET /.netlify/functions/printful?action=variants&productId=123
```

## Security Features

✅ **API Key Never Exposed**: Stored server-side only  
✅ **CORS Enabled**: Allows requests from your domain  
✅ **Method Validation**: Only allows GET requests  
✅ **Error Handling**: Doesn't leak sensitive information  
✅ **Environment Variables**: Separate for dev/production  

## Files Modified

- ✅ `netlify/functions/printful.js` - Serverless function
- ✅ `services/printfulService.ts` - Updated to use serverless endpoint
- ✅ `pages/MerchPage.tsx` - Displays products
- ✅ `.env.local` - API key (removed VITE_ prefix for security)
- ✅ `netlify.toml` - Function configuration

## Testing

Test the function locally:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run locally
netlify dev

# Test in browser
# Navigate to: http://localhost:8888/.netlify/functions/printful?action=products
```

## ⚠️ Important Notes

- **NEVER** use `VITE_` prefix for API keys (exposes to browser)
- **NEVER** commit API keys to git
- **ALWAYS** use environment variables in Netlify dashboard for production
- The API key in `.env.local` is only for local development

## Troubleshooting

**Function not working?**
1. Check Netlify Functions deploy log
2. Verify environment variable is set in Netlify dashboard
3. Test locally with `netlify dev`
4. Check browser console for errors

**Products not loading?**
1. Open browser DevTools → Network tab
2. Check request to `/.netlify/functions/printful`
3. Look for error messages in response
4. Verify API key is valid in Printful dashboard
