import '../styles/globals.css'
import Link from 'next/link';
import 'rsuite/dist/rsuite-no-reset.min.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <nav className="sticky top-0 z-30 bg-white/90 shadow-sm border-b border-gray-100 px-8 py-3 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-8">
          <Link href="/" passHref legacyBehavior>
            <a className="flex items-center gap-2 text-2xl font-extrabold text-white bg-gradient-to-r from-red-600 to-pink-500 px-4 py-2 rounded-2xl shadow-sm tracking-tight hover:from-red-700 hover:to-pink-600 transition-colors duration-200" style={{ textDecoration: 'none', letterSpacing: '-0.03em' }}>
              <span className="text-3xl">🧾</span>
              <span>Receipt OCR</span>
            </a>
          </Link>
          <div className="flex gap-2 ml-4">
            <Link href="/" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Home</a>
            </Link>
            <Link href="/invoices" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Invoices</a>
            </Link>
            <Link href="/jobs" passHref legacyBehavior>
              <a className="text-gray-700 hover:text-red-700 font-medium px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-red-50">Jobs</a>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Placeholder for future user avatar, notifications, etc. */}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}