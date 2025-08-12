import stripe from '../../../lib/stripe.mjs';
import { PLANS } from '../../../lib/stripe.mjs';
import db from '../../../lib/db.mjs';
import { verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment processing is not configured. Please contact support.' 
    });
  }

  try {
    // Verify user authentication
    const token = req.cookies.token;
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId } = req.body;
    const plan = Object.values(PLANS).find(p => p.id === planId);
    
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription/cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 