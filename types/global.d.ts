declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void
        exit: (callback: () => void) => void
      }
    }
  }

  // Stripe module declarations
  namespace Stripe {
    interface PaymentRequestPaymentMethodEvent {
      complete: (status: string) => void
      paymentMethod: {
        id: string
        type: string
        billing_details: {
          name: string
          email: string
        }
      }
    }
  }

  // Import the Stripe modules
  declare module '@stripe/react-stripe-js';
  declare module '@stripe/stripe-js';
}

export {}
