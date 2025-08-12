import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { PLANS, formatPrice } from '../lib/stripe.mjs';
import { useTranslation } from '../lib/useTranslation';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionPage() {
  const { t, tArray } = useTranslation();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        setUser(data.user);
        return fetch('/api/subscriptions/get-subscription');
      })
      .then(res => res.json())
      .then(data => {
        setSubscription(data.subscription);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.replace('/login');
      });
  }, []);

  const handleSubscribe = async (planId) => {
    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          setStripeConfigured(false);
          throw new Error('Payment processing is not configured. Please contact support.');
        }
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.subscription.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.subscription.paymentNotAvailable')}</h1>
            <p className="text-gray-600 mb-6">
              {t('pages.subscription.stripeNotConfigured')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              {t('pages.subscription.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-red-700 mb-4">
            {t('pages.subscription.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pages.subscription.subtitle')}
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {subscription && (
          <div className="max-w-md mx-auto mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-medium">
              You currently have an active {subscription.plan_type} subscription.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-red-300 transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('home.pricing.free.title')}
              </h3>
              <div className="text-4xl font-extrabold text-red-600 mb-2">
                {t('home.pricing.free.price')}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tArray('home.pricing.free.features').map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-red-600 text-white hover:bg-red-700 transform hover:scale-105 block text-center"
            >
              {t('home.pricing.free.cta')}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${
            subscription?.plan_type === 'pro'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-red-300'
          }`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('home.pricing.pro.title')}
              </h3>
              <div className="text-4xl font-extrabold text-red-600 mb-2">
                {t('home.pricing.pro.price')}<span className="text-base font-normal">{t('home.pricing.pro.period')}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tArray('home.pricing.pro.features').map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('pro')}
              disabled={processing || subscription?.plan_type === 'pro'}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                subscription?.plan_type === 'pro'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : processing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
              }`}
            >
              {subscription?.plan_type === 'pro'
                ? t('pages.subscription.currentPlan')
                : processing
                ? t('pages.subscription.processing')
                : t('pages.subscription.subscribeNow')}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${
            subscription?.plan_type === 'enterprise'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-red-300'
          }`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('home.pricing.enterprise.title')}
              </h3>
              <div className="text-4xl font-extrabold text-red-600 mb-2">
                {t('home.pricing.enterprise.price')}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tArray('home.pricing.enterprise.features').map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('enterprise')}
              disabled={processing || subscription?.plan_type === 'enterprise'}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                subscription?.plan_type === 'enterprise'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : processing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
              }`}
            >
              {subscription?.plan_type === 'enterprise'
                ? t('pages.subscription.currentPlan')
                : processing
                ? t('pages.subscription.processing')
                : t('pages.subscription.subscribeNow')}
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('pages.subscription.moneyBackGuarantee')}
          </p>
          <p className="text-sm text-gray-500">
            {t('pages.subscription.cancelAnytime')}
          </p>
        </div>
      </div>
    </div>
  );
} 