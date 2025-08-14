import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useTranslation } from '../lib/useTranslation';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Profile page - User state:', user);
    if (user) {
      setForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
      });
      
      // Fetch subscription and credits with cache-busting
      Promise.all([
        fetch('/api/subscriptions/get-subscription').then(res => res.json()),
        fetch('/api/subscriptions/get-credits?t=' + Date.now(), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }).then(res => res.json())
      ])
      .then(([subData, creditsData]) => {
        console.log('Subscription data:', subData);
        console.log('Credits data:', creditsData);
        setSubscription(subData.subscription);
        setCredits(creditsData.credits);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
    } else if (user === null) {
      console.log('Profile page - User is null, redirecting to login');
      setLoading(false);
      router.replace('/login');
    }
  }, [user, router]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      await fetchUser(); // Refresh user data
      setSuccess(t('pages.profile.profileUpdated'));
      setEdit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('pages.profile.deleteConfirm'))) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      router.replace('/register');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('pages.profile.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">{t('pages.profile.title')}</h1>
          <p className="text-xl text-gray-600">Manage your account and subscription</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-pink-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                <p className="text-red-100 mt-1">Your personal details and preferences</p>
              </div>
              
              <div className="p-8">
                {!edit ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('pages.profile.email')}</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('pages.profile.name')}</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{user.name || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('pages.profile.mobile')}</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{user.mobile || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Created</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('pages.profile.address')}</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{user.address || 'Not set'}</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setEdit(true)} 
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-red-700 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                      >
                        {t('pages.profile.edit')}
                      </button>
                      <button 
                        onClick={handleDelete} 
                        disabled={deleting} 
                        className="flex-1 bg-white border-2 border-red-200 text-red-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                      >
                        {deleting ? t('pages.profile.deleting') : t('pages.profile.deleteAccount')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                        <input 
                          type="text" 
                          name="mobile" 
                          value={form.mobile} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={form.address} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-red-700 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                      >
                        {saving ? t('pages.profile.saving') : t('pages.profile.save')}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEdit(false)} 
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        {t('pages.profile.cancel')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Credits Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Upload Credits</h3>
              </div>
              <div className="p-6">
                {credits ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {credits.credits_remaining.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Credits Remaining</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Used:</span>
                        <span className="font-semibold text-gray-900">
                          {(credits.credits_total - credits.credits_remaining).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Earned:</span>
                        <span className="font-semibold text-gray-900">
                          {credits.credits_total.toLocaleString()}
                        </span>
                      </div>
                      {credits.last_reset_date && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Reset:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(credits.last_reset_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-500 mb-4">No credits available</div>
                    {!subscription && (
                      <Link
                        href="/subscription"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Get Credits
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Subscription</h3>
              </div>
              <div className="p-6">
                {subscription ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1 capitalize">
                        {subscription.plan_type}
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                        subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status}
                      </div>
                    </div>
                    
                    {subscription.current_period_end && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Next billing</div>
                        <div className="font-semibold text-gray-900">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-500 mb-4">No active subscription</div>
                    <Link
                      href="/subscription"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Subscribe Now
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href="/upload"
                    className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Upload Receipts
                  </Link>
                  <Link
                    href="/jobs"
                    className="block w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    View Jobs
                  </Link>
                  <Link
                    href="/invoices"
                    className="block w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    View Invoices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 