const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create a payment intent for a session booking
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a checkout session for session booking
  static async createCheckoutSession(amount, currency = 'usd', metadata = {}) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: metadata.sessionTitle || 'Mentor Session',
                description: metadata.sessionDescription || 'One-on-one mentoring session',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/mentors/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/mentors/booking/cancel`,
        metadata: metadata,
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Stripe checkout session creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retrieve a payment intent
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retrieve a checkout session
  static async retrieveCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        success: true,
        session: session
      };
    } catch (error) {
      console.error('Stripe checkout session retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a refund
  static async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);
      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Stripe refund creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return {
        success: true,
        event: event
      };
    } catch (error) {
      console.error('Stripe webhook verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = StripeService;
