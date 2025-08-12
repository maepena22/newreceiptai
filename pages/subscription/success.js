import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from '../../lib/useTranslation';

export default function SubscriptionSuccessPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      // Fetch subscription details
      fetch('/api/subscriptions/get-subscription')
        .then(res => res.json())
        .then(data => {
          setSubscription(data.subscription);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.subscriptionSuccess.processing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pages.subscriptionSuccess.paymentSuccessful')}
          </h1>
          <p className="text-gray-600">
            {t('pages.subscriptionSuccess.thankYou')}
          </p>
        </div>

        {subscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">
              {t('pages.subscriptionSuccess.subscriptionDetails')}
            </h3>
            <p className="text-green-700">
              {t('pages.subscriptionSuccess.plan')} <span className="font-medium">{subscription.plan_type}</span>
            </p>
            <p className="text-green-700">
              {t('pages.subscriptionSuccess.status')} <span className="font-medium capitalize">{subscription.status}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/upload"
            className="block w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            {t('pages.subscriptionSuccess.startProcessing')}
          </Link>
          
          <Link
            href="/profile"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {t('pages.subscriptionSuccess.goToProfile')}
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            {t('pages.subscriptionSuccess.confirmationEmail')}
          </p>
        </div>
      </div>
    </div>
  );
} 