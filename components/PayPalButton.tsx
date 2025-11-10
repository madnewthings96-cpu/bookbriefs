import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalConfig } from '../config/paypal';

interface PayPalButtonProps {
  amount: string;
  productName: string;
  variantId: number;
  onSuccess: (orderId: string) => void;
  onError: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  productName,
  variantId,
  onSuccess,
  onError,
}) => {
  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalConfig.clientId,
        currency: paypalConfig.currency,
        intent: paypalConfig.intent,
      }}
    >
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                description: productName,
                amount: {
                  value: amount,
                  currency_code: paypalConfig.currency,
                },
                custom_id: variantId.toString(),
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const order = await actions.order?.capture();
            console.log('PayPal order captured:', order);
            onSuccess(order?.id || '');
          } catch (error) {
            console.error('PayPal capture error:', error);
            onError(error);
          }
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
