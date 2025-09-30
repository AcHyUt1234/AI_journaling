// server.js - Express backend for Stripe integration
// Install: npm install express stripe dotenv cors

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create Stripe Checkout Session with 3-day trial
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { customerId, email } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your price ID from Stripe
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3, // 3-day trial
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel', // Cancel if no payment method
          },
        },
      },
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancelled`,
      metadata: {
        username: req.body.username,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify subscription status
app.post('/verify-subscription', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    res.json({
      status: subscription.status,
      trialEnd: subscription.trial_end,
      currentPeriodEnd: subscription.current_period_end,
      customerId: subscription.customer,
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has active subscription
app.post('/check-subscription-status', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });
    
    if (subscriptions.data.length === 0) {
      return res.json({ hasActiveSubscription: false });
    }
    
    const subscription = subscriptions.data[0];
    const isActive = ['active', 'trialing'].includes(subscription.status);
    
    res.json({
      hasActiveSubscription: isActive,
      status: subscription.status,
      trialEnd: subscription.trial_end,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session for managing subscription
app.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object);
      // Save subscription details to your database
      break;
    
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object);
      // Update subscription status in your database
      break;
    
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled:', event.data.object);
      // Mark subscription as cancelled in your database
      break;
    
    case 'customer.subscription.trial_will_end':
      console.log('Trial ending soon:', event.data.object);
      // Send reminder email to user
      break;
    
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded:', event.data.object);
      // Confirm payment in your database
      break;
    
    case 'invoice.payment_failed':
      console.log('Payment failed:', event.data.object);
      // Handle payment failure (send email, pause access)
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
