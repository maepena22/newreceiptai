import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => {
      setUser(data.user);
      setForm({
        name: data.user.name || '',
        mobile: data.user.mobile || '',
        address: data.user.address || '',
      });
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
      router.replace('/login');
    });
  }, []);

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
      setUser(data.user);
      setSuccess('Profile updated successfully.');
      setEdit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
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

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 animate-fade-in">
      <h2 className="text-3xl font-extrabold text-red-700 mb-6">Profile</h2>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
      {!edit ? (
        <>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">Email:</span>
        <span className="ml-2 text-gray-900">{user.email}</span>
      </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{user.name || '-'}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Mobile:</span>
            <span className="ml-2 text-gray-900">{user.mobile || '-'}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Address:</span>
            <span className="ml-2 text-gray-900">{user.address || '-'}</span>
          </div>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">Account Created:</span>
        <span className="ml-2 text-gray-900">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</span>
      </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => setEdit(true)} className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">Edit</button>
            <button onClick={handleDelete} disabled={deleting} className="bg-white border border-red-200 text-red-700 font-bold py-2 px-6 rounded-xl shadow hover:bg-red-50 transition-all duration-200 disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete Account'}
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
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setEdit(false)} className="bg-white border border-red-200 text-red-700 font-bold py-2 px-6 rounded-xl shadow hover:bg-red-50 transition-all duration-200">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
} 