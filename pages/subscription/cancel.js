import Link from 'next/link';
import { useTranslation } from '../../lib/useTranslation';

export default function SubscriptionCancelPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pages.subscriptionCancel.paymentCancelled')}
          </h1>
          <p className="text-gray-600">
            {t('pages.subscriptionCancel.noCharges')}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/subscription"
            className="block w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            {t('pages.subscriptionCancel.tryAgain')}
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {t('pages.subscriptionCancel.goHome')}
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            {t('pages.subscriptionCancel.contactSupport')}
          </p>
        </div>
      </div>
    </div>
  );
} 