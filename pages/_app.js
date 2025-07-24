import '../styles/globals.css'
import Link from 'next/link';
import 'rsuite/dist/rsuite-no-reset.min.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';

export default function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const router = useRouter();
  const avatarRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => setUser(data.user)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };
  const showNavbar = router.pathname !== '/login';
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {showNavbar && (
        <nav className={`sticky top-0 z-30 bg-white/90 shadow-sm border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between backdrop-blur${navbarOpen ? ' navbar-open' : ''} relative`}>
          <div className="flex-1 flex items-center justify-between">
            <Link href="/" passHref legacyBehavior>
              <a className="flex items-center gap-2 text-2xl font-extrabold text-white bg-gradient-to-r from-red-600 to-pink-500 px-4 py-2 rounded-2xl shadow-sm tracking-tight hover:from-red-700 hover:to-pink-600 transition-colors duration-200" style={{ textDecoration: 'none', letterSpacing: '-0.03em' }}>
                <span className="text-3xl">🧾</span>
                <span className="hidden sm:inline">Receipt OCR</span>
              </a>
            </Link>
            <div className="md:hidden">
              <button
                className="navbar-hamburger"
                aria-label="Open navigation menu"
                onClick={() => setNavbarOpen(open => !open)}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            {/* Desktop nav links */}
            <div className="hidden md:flex gap-2 ml-4">
              <Link href="/" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Home</a>
              </Link>
              {user && (
                <Link href="/upload" passHref legacyBehavior>
                  <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Upload</a>
                </Link>
              )}
              {user && (
                <>
              <Link href="/invoices" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Invoices</a>
              </Link>
              <Link href="/jobs" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Jobs</a>
              </Link>
                </>
              )}
            </div>
          </div>
          {/* Desktop profile icon */}
          <div className="hidden md:flex items-center gap-4 relative">
            {user ? (
              <div ref={avatarRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-red-200 shadow"
                  aria-label="User menu"
                >
                  {user.email ? user.email[0].toUpperCase() : '?'}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
                    <Link href="/profile" passHref legacyBehavior>
                      <a className="block px-4 py-3 text-gray-700 hover:bg-red-50 rounded-t-xl transition-colors duration-200">Profile</a>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Login</a>
              </Link>
            )}
          </div>
          {/* Mobile nav links dropdown, absolutely positioned below navbar */}
          <div
            className={`md:hidden ${navbarOpen ? 'flex flex-col absolute left-0 right-0 top-full bg-white shadow-lg rounded-xl p-4 w-full z-40' : 'hidden'}`}
          >
            <Link href="/" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50" onClick={() => setNavbarOpen(false)}>Home</a>
            </Link>
            {user && (
              <Link href="/upload" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50" onClick={() => setNavbarOpen(false)}>Upload</a>
              </Link>
            )}
            {user && (
              <>
            <Link href="/invoices" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50" onClick={() => setNavbarOpen(false)}>Invoices</a>
            </Link>
            <Link href="/jobs" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50" onClick={() => setNavbarOpen(false)}>Jobs</a>
            </Link>
                <Link href="/profile" passHref legacyBehavior>
                  <a className="block px-4 py-3 text-gray-700 hover:bg-red-50 rounded-xl transition-colors duration-200" onClick={() => setNavbarOpen(false)}>Profile</a>
                </Link>
                <button
                  onClick={() => { setNavbarOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link href="/login" passHref legacyBehavior>
                <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50" onClick={() => setNavbarOpen(false)}>Login</a>
              </Link>
            )}
          </div>
        </nav>
      )}
      <main
        className={
          router.pathname === '/invoices'
            ? 'w-full px-0 pt-8'
            : 'max-w-7xl mx-auto px-4 sm:px-8 pt-8'
        }
      >
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}