export const paypalConfig = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
};
