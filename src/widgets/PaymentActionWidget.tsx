import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentActionWidgetProps {
  config: {
    actionConfigId?: string;
    actionName?: string;
    amount?: number;
    currency?: string;
    buttonLabel?: string;
    description?: string;
    buttonVariant?: 'default' | 'outline' | 'secondary';
    paymentSuccessEventName?: string;
    paymentFailureEventName?: string;
    paymentSuccessMessage?: string;
    paymentFailureMessage?: string;
    // Design customization options
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardPadding?: number;
    cardShadow?: string;
    // Icon customization
    iconColor?: string;
    iconSize?: number;
    hideIcon?: boolean;
    // Title customization
    titleColor?: string;
    titleSize?: number;
    titleWeight?: string;
    titleAlign?: 'left' | 'center' | 'right';
    // Description customization
    descriptionColor?: string;
    descriptionSize?: number;
    // Amount customization
    amountColor?: string;
    amountSize?: number;
    amountWeight?: string;
    currencyPosition?: 'before' | 'after';
    showCurrencyCode?: boolean;
    // Button customization
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    buttonBorderColor?: string;
    buttonBorderWidth?: number;
    buttonBorderRadius?: number;
    buttonPadding?: string;
    buttonFontSize?: number;
    buttonFontWeight?: string;
    buttonWidth?: 'full' | 'auto';
    buttonIconSize?: number;
    buttonIconPosition?: 'left' | 'right';
    hideButtonIcon?: boolean;
    // Success/Error state customization
    successIconColor?: string;
    successIconSize?: number;
    successTitleColor?: string;
    successTitleSize?: number;
    successMessageColor?: string;
    errorIconColor?: string;
    errorIconSize?: number;
    errorTitleColor?: string;
    errorTitleSize?: number;
    errorMessageColor?: string;
    // Layout customization
    layoutDirection?: 'vertical' | 'horizontal';
    contentAlignment?: 'start' | 'center' | 'end';
    spacing?: number;
  };
  onPaymentSuccess?: (data: any) => void;
  onPaymentFailure?: (error: any) => void;
  websocket?: WebSocket | null;
  widgetId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentActionWidget: React.FC<PaymentActionWidgetProps> = ({ 
  config,
  onPaymentSuccess,
  onPaymentFailure,
  websocket,
  widgetId
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!config.amount || config.amount <= 0) {
      toast.error('Please configure payment amount');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to make payment');
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      // Create payment order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'process-payment-action',
        {
          body: {
            actionConfigId: config.actionConfigId,
            userId: user.id,
            amount: config.amount || 0,
            currency: config.currency || 'INR',
            actionName: config.actionName || 'Payment Action',
            manufacturerId: user.id,
            metadata: {
              widget_type: 'payment_action',
              description: config.description
            }
          }
        }
      );

      if (orderError || !orderData?.success) {
        console.error('Payment order creation failed:', orderError);
        toast.error('Failed to create payment order');
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: config.actionName || 'Payment',
        description: config.description || 'Pay to execute action',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment and execute action
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'execute-payment-action',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              }
            );

            if (verifyError || !verifyData?.success) {
              console.error('Payment verification failed:', verifyError);
              toast.error('Payment verification failed');
              setPaymentStatus('error');
              return;
            }

            setPaymentStatus('success');
            toast.success(config.paymentSuccessMessage || 'Payment successful! Action executed.');
            
            // Send WebSocket event for payment success
            if (websocket && websocket.readyState === WebSocket.OPEN) {
              const eventName = config.paymentSuccessEventName || 'payment.success';
              websocket.send(JSON.stringify({
                event: eventName,
                widgetId: widgetId,
                data: verifyData
              }));
              console.log(`Payment success event sent: ${eventName}`);
            }
            
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData);
            }

          } catch (error) {
            console.error('Payment processing error:', error);
            toast.error(config.paymentFailureMessage || 'Payment processing failed');
            setPaymentStatus('error');
            
            // Send WebSocket event for payment failure
            if (websocket && websocket.readyState === WebSocket.OPEN) {
              const eventName = config.paymentFailureEventName || 'payment.failure';
              websocket.send(JSON.stringify({
                event: eventName,
                widgetId: widgetId,
                data: {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  timestamp: new Date().toISOString(),
                  actionExecuted: false
                }
              }));
              console.log(`Payment failure event sent: ${eventName}`);
            }
            
            if (onPaymentFailure) {
              onPaymentFailure(error);
            }
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            setLoading(false);
            
            // Send WebSocket event for payment dismissal
            if (websocket && websocket.readyState === WebSocket.OPEN) {
              const eventName = config.paymentFailureEventName || 'payment.failure';
              websocket.send(JSON.stringify({
                event: eventName,
                widgetId: widgetId,
                data: {
                  error: 'Payment dismissed by user',
                  timestamp: new Date().toISOString(),
                  actionExecuted: false
                }
              }));
              console.log(`Payment dismissed event sent: ${eventName}`);
            }
          }
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(config.paymentFailureMessage || 'Failed to initiate payment');
      setPaymentStatus('error');
      setLoading(false);
      
      // Send WebSocket event for payment initiation failure
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        const eventName = config.paymentFailureEventName || 'payment.failure';
        websocket.send(JSON.stringify({
          event: eventName,
          widgetId: widgetId,
          data: {
            error: error instanceof Error ? error.message : 'Failed to initiate payment',
            timestamp: new Date().toISOString(),
            actionExecuted: false
          }
        }));
        console.log(`Payment initiation failure event sent: ${eventName}`);
      }
      
      if (onPaymentFailure) {
        onPaymentFailure(error);
      }
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card 
        className="p-6 text-center"
        style={{
          backgroundColor: config.cardBackgroundColor,
          borderColor: config.cardBorderColor,
          borderWidth: config.cardBorderWidth !== undefined ? `${config.cardBorderWidth}px` : undefined,
          borderRadius: config.cardBorderRadius !== undefined ? `${config.cardBorderRadius}px` : undefined,
          padding: config.cardPadding !== undefined ? `${config.cardPadding}px` : undefined,
          boxShadow: config.cardShadow,
        }}
      >
        <CheckCircle 
          className="mx-auto mb-4" 
          style={{
            width: `${config.successIconSize || 48}px`,
            height: `${config.successIconSize || 48}px`,
            color: config.successIconColor || '#22c55e'
          }}
        />
        <h3 
          className="font-semibold mb-2"
          style={{
            fontSize: `${config.successTitleSize || 18}px`,
            color: config.successTitleColor
          }}
        >
          {config.paymentSuccessMessage || 'Payment Successful!'}
        </h3>
        <p 
          className="text-sm mb-4"
          style={{
            color: config.successMessageColor || '#6b7280'
          }}
        >
          Your payment has been processed and the action has been executed.
        </p>
        <Button onClick={() => setPaymentStatus('idle')} variant="outline">
          Make Another Payment
        </Button>
      </Card>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Card 
        className="p-6 text-center"
        style={{
          backgroundColor: config.cardBackgroundColor,
          borderColor: config.cardBorderColor,
          borderWidth: config.cardBorderWidth !== undefined ? `${config.cardBorderWidth}px` : undefined,
          borderRadius: config.cardBorderRadius !== undefined ? `${config.cardBorderRadius}px` : undefined,
          padding: config.cardPadding !== undefined ? `${config.cardPadding}px` : undefined,
          boxShadow: config.cardShadow,
        }}
      >
        <XCircle 
          className="mx-auto mb-4" 
          style={{
            width: `${config.errorIconSize || 48}px`,
            height: `${config.errorIconSize || 48}px`,
            color: config.errorIconColor || '#ef4444'
          }}
        />
        <h3 
          className="font-semibold mb-2"
          style={{
            fontSize: `${config.errorTitleSize || 18}px`,
            color: config.errorTitleColor
          }}
        >
          {config.paymentFailureMessage || 'Payment Failed'}
        </h3>
        <p 
          className="text-sm mb-4"
          style={{
            color: config.errorMessageColor || '#6b7280'
          }}
        >
          Something went wrong with your payment. Please try again.
        </p>
        <Button onClick={() => setPaymentStatus('idle')} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Card 
      className="p-6"
      style={{
        backgroundColor: config.cardBackgroundColor,
        borderColor: config.cardBorderColor,
        borderWidth: config.cardBorderWidth !== undefined ? `${config.cardBorderWidth}px` : undefined,
        borderRadius: config.cardBorderRadius !== undefined ? `${config.cardBorderRadius}px` : undefined,
        padding: config.cardPadding !== undefined ? `${config.cardPadding}px` : undefined,
        boxShadow: config.cardShadow,
      }}
    >
      <div 
        className="flex gap-4 mb-4"
        style={{
          flexDirection: config.layoutDirection === 'horizontal' ? 'row' : 'column',
          alignItems: config.contentAlignment || 'start',
          gap: config.spacing !== undefined ? `${config.spacing}px` : undefined,
        }}
      >
        {!config.hideIcon && (
          <CreditCard 
            style={{
              width: `${config.iconSize || 32}px`,
              height: `${config.iconSize || 32}px`,
              color: config.iconColor || 'hsl(var(--primary))'
            }}
          />
        )}
        <div className="flex-1">
          <h3 
            className="font-semibold mb-1"
            style={{
              color: config.titleColor,
              fontSize: config.titleSize !== undefined ? `${config.titleSize}px` : undefined,
              fontWeight: config.titleWeight,
              textAlign: config.titleAlign
            }}
          >
            {config.actionName || 'Payment Action'}
          </h3>
          {config.description && (
            <p 
              className="text-sm"
              style={{
                color: config.descriptionColor || '#6b7280',
                fontSize: config.descriptionSize !== undefined ? `${config.descriptionSize}px` : undefined,
              }}
            >
              {config.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div 
          className="font-bold"
          style={{
            fontSize: config.amountSize !== undefined ? `${config.amountSize}px` : '30px',
            color: config.amountColor,
            fontWeight: config.amountWeight || '700',
          }}
        >
          {config.currencyPosition === 'after' ? (
            <>
              {config.amount || 0}
              {config.currency === 'USD' ? '$' : '₹'}
            </>
          ) : (
            <>
              {config.currency === 'USD' ? '$' : '₹'}
              {config.amount || 0}
            </>
          )}
        </div>
        {(config.showCurrencyCode !== false) && (
          <p 
            className="text-sm"
            style={{
              color: config.descriptionColor || '#6b7280'
            }}
          >
            {config.currency || 'INR'}
          </p>
        )}
      </div>

      <Button 
        onClick={handlePayment}
        disabled={loading || !config.amount || config.amount <= 0}
        variant={config.buttonVariant || 'default'}
        className={config.buttonWidth === 'auto' ? '' : 'w-full'}
        style={{
          backgroundColor: config.buttonBackgroundColor,
          color: config.buttonTextColor,
          borderColor: config.buttonBorderColor,
          borderWidth: config.buttonBorderWidth !== undefined ? `${config.buttonBorderWidth}px` : undefined,
          borderRadius: config.buttonBorderRadius !== undefined ? `${config.buttonBorderRadius}px` : undefined,
          padding: config.buttonPadding,
          fontSize: config.buttonFontSize !== undefined ? `${config.buttonFontSize}px` : undefined,
          fontWeight: config.buttonFontWeight,
          width: config.buttonWidth === 'auto' ? 'auto' : '100%',
        }}
      >
        {loading ? (
          <>
            <Loader2 
              className="mr-2 animate-spin" 
              style={{
                width: `${config.buttonIconSize || 16}px`,
                height: `${config.buttonIconSize || 16}px`,
              }}
            />
            Processing...
          </>
        ) : (
          <>
            {!config.hideButtonIcon && config.buttonIconPosition !== 'right' && (
              <CreditCard 
                className="mr-2" 
                style={{
                  width: `${config.buttonIconSize || 16}px`,
                  height: `${config.buttonIconSize || 16}px`,
                }}
              />
            )}
            {config.buttonLabel || 'Pay Now'}
            {!config.hideButtonIcon && config.buttonIconPosition === 'right' && (
              <CreditCard 
                className="ml-2" 
                style={{
                  width: `${config.buttonIconSize || 16}px`,
                  height: `${config.buttonIconSize || 16}px`,
                }}
              />
            )}
          </>
        )}
      </Button>
    </Card>
  );
};

export default PaymentActionWidget;
