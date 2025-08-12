import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import Link from 'next/link';
import { useTranslation } from '../lib/useTranslation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    mobile: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, register } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    // Mobile validation (optional but if provided, should be valid)
    if (formData.mobile && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await register(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.mobile, 
        formData.address
      );
      
      if (result.success) {
        router.replace('/');
      } else {
        setErrors({ general: result.error || t('auth.validation.registrationFailed') });
      }
    } catch (error) {
      setErrors({ general: t('auth.validation.registrationFailed') });
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
        <span className="font-medium">{t('auth.register.backToHome')}</span>
      </Link>

      <div className="bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 mx-auto max-w-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.register.title')}</h1>
          <p className="text-gray-600">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('auth.register.emailPlaceholder')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.name')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('auth.register.namePlaceholder')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.mobile')}
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors ${
                errors.mobile ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('auth.register.mobilePlaceholder')}
            />
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.address')}
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors"
              placeholder={t('auth.register.addressPlaceholder')}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.password')} *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('auth.register.passwordPlaceholder')}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.confirmPassword')} *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition disabled:opacity-50 text-lg cursor-pointer border-2 border-transparent hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {isSubmitting ? t('auth.register.loading') : t('auth.register.submit')}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              {t('auth.register.hasAccount')}{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium underline">
                {t('auth.register.signIn')}
              </Link>
            </p>
          </div>
        </form>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('auth.register.terms')}{' '}
          <Link href="/terms-of-service" className="text-red-600 hover:text-red-700 underline">
            {t('auth.register.termsLink')}
          </Link>{' '}
          {t('auth.register.and')}{' '}
          <Link href="/privacy-policy" className="text-red-600 hover:text-red-700 underline">
            {t('auth.register.privacyLink')}
          </Link>
        </div>
      </div>
    </div>
  );
} 