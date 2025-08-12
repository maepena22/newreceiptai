import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useTranslation } from '../lib/useTranslation';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
      });
      fetch('/api/subscriptions/get-subscription')
        .then(res => res.json())
        .then(data => {
          setSubscription(data.subscription);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else if (user === null) {
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

  if (loading) return <div className="text-center text-gray-500">{t('pages.profile.loading')}</div>;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 animate-fade-in">
      <h2 className="text-3xl font-extrabold text-red-700 mb-6">{t('pages.profile.title')}</h2>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
      {!edit ? (
        <>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">{t('pages.profile.email')}</span>
        <span className="ml-2 text-gray-900">{user.email}</span>
      </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">{t('pages.profile.name')}</span>
            <span className="ml-2 text-gray-900">{user.name || '-'}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">{t('pages.profile.mobile')}</span>
            <span className="ml-2 text-gray-900">{user.mobile || '-'}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">{t('pages.profile.address')}</span>
            <span className="ml-2 text-gray-900">{user.address || '-'}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Account Created:</span>
            <span className="ml-2 text-gray-900">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</span>
          </div>
          
          {/* Subscription Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Subscription</h3>
            {subscription ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Plan:</span>
                  <span className="ml-2 text-gray-900 capitalize">{subscription.plan_type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 capitalize ${
                    subscription.status === 'active' ? 'text-green-600' : 
                    subscription.status === 'past_due' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <span className="font-medium text-gray-700">Next billing:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600">
                <p className="mb-2">No active subscription</p>
                <Link
                  href="/subscription"
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 mt-8">
            <button onClick={() => setEdit(true)} className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">{t('pages.profile.edit')}</button>
            <button onClick={handleDelete} disabled={deleting} className="bg-white border border-red-200 text-red-700 font-bold py-2 px-6 rounded-xl shadow hover:bg-red-50 transition-all duration-200 disabled:opacity-50">
              {deleting ? t('pages.profile.deleting') : t('pages.profile.deleteAccount')}
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Mobile</label>
            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={saving} className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200 disabled:opacity-50">
              {saving ? t('pages.profile.saving') : t('pages.profile.save')}
            </button>
            <button type="button" onClick={() => setEdit(false)} className="bg-white border border-red-200 text-red-700 font-bold py-2 px-6 rounded-xl shadow hover:bg-red-50 transition-all duration-200">{t('pages.profile.cancel')}</button>
          </div>
        </form>
      )}
    </div>
  );
} 