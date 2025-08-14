import Stripe from 'stripe';

// Check if Stripe secret key is configured
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
  console.warn('⚠️  STRIPE_SECRET_KEY is not configured. Stripe functionality will be disabled.');
  console.warn('   Please update your .env.local file with your actual Stripe keys.');
}

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export default stripe;

// Subscription plans configuration
export const PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    price: 999, // $9.99 in cents
    interval: 'month',
    features: [
      'Up to 50 receipts per month',
      'Basic OCR processing',
      'Email support'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 1999, // $19.99 in cents
    interval: 'month',
    features: [
      'Up to 500 receipts per month',
      'Advanced OCR processing',
      'Priority support',
      'Export to multiple formats'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 4999, // $49.99 in cents
    interval: 'month',
    features: [
      'Up to 100,000 receipts per month',
      'Advanced OCR processing',
      'Priority support',
      'API access',
      'Custom integrations'
    ]
  }
};

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
} 