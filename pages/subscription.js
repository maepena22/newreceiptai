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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('pages.subscription.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12 px-4">
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
            {t('pages.subscription.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.subscription.subtitle')}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {subscription && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  You currently have an active <span className="font-semibold capitalize">{subscription.plan_type}</span> subscription.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6">
              <h3 className="text-2xl font-bold text-white text-center">
                {t('home.pricing.free.title')}
              </h3>
              <div className="text-center mt-2">
                <span className="text-4xl font-extrabold text-white">
                  {t('home.pricing.free.price')}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {tArray('home.pricing.free.features').map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
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
              
              {/* No button for Free plan - it's always default */}
              <div className="text-center text-gray-500 text-sm">
                Always available
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
            subscription?.plan_type === 'pro'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-100'
          }`}>
            <div className="bg-gradient-to-r from-red-600 to-pink-500 px-8 py-6 relative">
              {subscription?.plan_type === 'pro' && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white text-center">
                {t('home.pricing.pro.title')}
              </h3>
              <div className="text-center mt-2">
                <span className="text-4xl font-extrabold text-white">
                  {t('home.pricing.pro.price')}
                </span>
                <span className="text-white text-lg ml-2">{t('home.pricing.pro.period')}</span>
              </div>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {tArray('home.pricing.pro.features').map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
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
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                  subscription?.plan_type === 'pro'
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : processing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-pink-500 text-white hover:from-red-700 hover:to-pink-600 transform hover:scale-105'
                }`}
              >
                {subscription?.plan_type === 'pro'
                  ? t('pages.subscription.currentPlan')
                  : processing
                  ? t('pages.subscription.processing')
                  : t('pages.subscription.subscribeNow')}
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
            subscription?.plan_type === 'enterprise'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-100'
          }`}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 relative">
              {subscription?.plan_type === 'enterprise' && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white text-center">
                {t('home.pricing.enterprise.title')}
              </h3>
              <div className="text-center mt-2">
                <span className="text-4xl font-extrabold text-white">
                  {t('home.pricing.enterprise.price')}
                </span>
                <span className="text-white text-lg ml-2">{t('home.pricing.enterprise.period')}</span>
              </div>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {tArray('home.pricing.enterprise.features').map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
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
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                  subscription?.plan_type === 'enterprise'
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : processing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transform hover:scale-105'
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
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('pages.subscription.moneyBackGuarantee')}
                </h3>
                <p className="text-gray-600 text-sm">
                  30-day money-back guarantee on all paid plans
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('pages.subscription.cancelAnytime')}
                </h3>
                <p className="text-gray-600 text-sm">
                  Cancel your subscription at any time, no questions asked
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 