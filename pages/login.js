import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import Link from 'next/link';
import { useTranslation } from '../lib/useTranslation';

export default function LoginPage() {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(authEmail, authPassword);
      
      if (result.success) {
        setAuthEmail('');
        setAuthPassword('');
        setAuthError('');
        router.replace('/');
      } else {
        setAuthError(result.error || 'Login failed');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-50 via-white to-blue-50 relative">
      {/* Back Arrow */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200 group">
        <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">{t('auth.login.backToHome')}</span>
      </Link>

      <div className="bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 mx-auto max-w-2xl w-full max-w-md">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h2>
          <p className="text-gray-600">{t('auth.login.subtitle')}</p>
        </div>
          
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {authError}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.login.email')}
            </label>
            <input
              type="email"
              id="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.login.password')}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50 text-lg cursor-pointer border-2 border-transparent hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200 transform hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('auth.login.loading')}
              </div>
            ) : (
              t('auth.login.submit')
            )}
          </button>
          
          <div className="text-center">
            <p className="text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link href="/register" className="text-red-600 hover:text-red-700 font-medium underline transition-colors">
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 