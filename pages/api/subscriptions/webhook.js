import stripe from '../../../lib/stripe.mjs';
import db from '../../../lib/db.mjs';

// Credit limits for each plan
const PLAN_CREDITS = {
  'basic': 50,
  'pro': 10000, // 10,000 receipts as requested
  'enterprise': 100000 // 100,000 receipts for enterprise
};

// Configure Next.js to not parse the body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured, webhook processing disabled');
    return res.status(503).json({ error: 'Payment processing not configured' });
  }

  // Get the raw body for webhook verification
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks);

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Signature:', sig);
    console.error('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Processing webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        console.log('Session metadata:', session.metadata);
        console.log('Session mode:', session.mode);
        
        if (session.mode === 'subscription') {
          console.log('Processing subscription checkout session');
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          console.log('Retrieved subscription:', subscription.id);
          console.log('Subscription status:', subscription.status);
          
          // Update or create subscription record
          const result = db.prepare(`
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
          console.log('Subscription record created/updated:', result);

          // Add credits for new subscription
          const creditsToAdd = PLAN_CREDITS[session.metadata.planId] || 0;
          console.log('Adding credits:', creditsToAdd, 'for plan:', session.metadata.planId);
          
          if (creditsToAdd > 0) {
            const creditResult = db.prepare(`
              INSERT OR REPLACE INTO user_credits 
              (user_id, credits_remaining, credits_total, last_reset_date, updated_at)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).run(
              session.metadata.userId,
              creditsToAdd,
              creditsToAdd,
              new Date().toISOString()
            );
            console.log('Credits added successfully:', creditResult);
          }
        } else {
          console.log('Not a subscription checkout session');
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        
        const subscriptionRecord = db.prepare('SELECT user_id, plan_type FROM subscriptions WHERE stripe_subscription_id = ?').get(updatedSubscription.id);
        
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
        console.log('Subscription deleted:', deletedSubscription.id);
        
        db.prepare(`
          UPDATE subscriptions SET 
            status = 'canceled',
            updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = ?
        `).run(deletedSubscription.id);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        
        if (invoice.subscription) {
          // Update subscription status
          db.prepare(`
            UPDATE subscriptions SET 
              status = 'active',
              updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run(invoice.subscription);

          // Add monthly credits for renewal
          const subRecord = db.prepare('SELECT user_id, plan_type FROM subscriptions WHERE stripe_subscription_id = ?').get(invoice.subscription);
          if (subRecord) {
            const creditsToAdd = PLAN_CREDITS[subRecord.plan_type] || 0;
            console.log('Adding renewal credits:', creditsToAdd, 'for plan:', subRecord.plan_type);
            
            if (creditsToAdd > 0) {
              db.prepare(`
                UPDATE user_credits SET 
                  credits_remaining = credits_remaining + ?,
                  credits_total = credits_total + ?,
                  last_reset_date = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
              `).run(creditsToAdd, creditsToAdd, subRecord.user_id);
              console.log('Renewal credits added successfully');
            }
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
} 