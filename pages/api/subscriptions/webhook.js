import stripe from '../../../lib/stripe.mjs';
import db from '../../../lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured, webhook processing disabled');
    return res.status(503).json({ error: 'Payment processing not configured' });
  }

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

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Update or create subscription record
          db.prepare(`
            INSERT OR REPLACE INTO subscriptions 
            (user_id, stripe_subscription_id, stripe_customer_id, plan_type, status, 
             current_period_start, current_period_end, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(
            session.metadata.userId,
            subscription.id,
            subscription.customer,
            session.metadata.planId,
            subscription.status,
            new Date(subscription.current_period_start * 1000).toISOString(),
            new Date(subscription.current_period_end * 1000).toISOString()
          );
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        const subscriptionRecord = db.prepare('SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?').get(updatedSubscription.id);
        
        if (subscriptionRecord) {
          db.prepare(`
            UPDATE subscriptions SET 
              status = ?,
              current_period_start = ?,
              current_period_end = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run(
            updatedSubscription.status,
            new Date(updatedSubscription.current_period_start * 1000).toISOString(),
            new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            updatedSubscription.id
          );
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        db.prepare(`
          UPDATE subscriptions SET 
            status = 'canceled',
            updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = ?
        `).run(deletedSubscription.id);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        if (invoice.subscription) {
          db.prepare(`
            UPDATE subscriptions SET 
              status = 'active',
              updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run(invoice.subscription);
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        if (failedInvoice.subscription) {
          db.prepare(`
            UPDATE subscriptions SET 
              status = 'past_due',
              updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run(failedInvoice.subscription);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 