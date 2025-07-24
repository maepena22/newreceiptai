import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => {
      setUser(data.user);
      router.replace('/');
    }).catch(() => setUser(null));
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword }),
    });
    if (res.ok) {
      setUser({ email: authEmail });
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
      router.replace('/');
    } else {
      const data = await res.json();
      setAuthError(data.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-50 via-white to-blue-50">
      <div className="bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 mx-auto max-w-2xl w-[30%]">
        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-2">{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={e => setAuthEmail(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-200 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={e => setAuthPassword(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-200 focus:outline-none"
            required
          />
          {authError && <div className="text-red-600 text-sm">{authError}</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition disabled:opacity-50 text-lg cursor-pointer border-2 border-transparent hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            className="text-blue-600 underline text-base mt-2 cursor-pointer hover:text-blue-800 focus:outline-none"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? 'No account? Register' : 'Already have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 