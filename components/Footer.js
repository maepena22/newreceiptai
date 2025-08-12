import Link from 'next/link';
import { MdEmail, MdPhone, MdLocationOn, MdBusiness, MdCheckCircle } from 'react-icons/md';
import { useTranslation } from '../lib/useTranslation';

export default function Footer() {
    const { t } = useTranslation();
    
    return(
        <>
    {/* Footer */}
    <footer className="w-full border-t border-gray-200 pt-12 mt-auto animate-fade-in-up bg-transparent">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between px-4 gap-8 pb-8">
    {/* Branding (left) */}
    <div className="flex flex-col items-center md:items-start w-full md:w-1/3 mb-8 md:mb-0">
        <span className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-500 to-blue-500 font-sans mb-2 select-none" style={{letterSpacing: '-0.05em'}}>Apex Ai</span>
        <span className="text-gray-400 text-base md:text-lg font-medium tracking-wide uppercase mt-1 mb-2">{t('footer.brand')}</span>
    </div>
    {/* Centered Links: two columns */}
    <div className="flex flex-col items-start w-full md:w-1/3">
        <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Main links */}
        <div className="flex flex-col items-start gap-2">
            <Link href="/" passHref legacyBehavior>
            <a className="relative group text-gray-700 hover:text-red-600 text-lg font-semibold tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-blue-500 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.home')}</a>
            </Link>
            <Link href="/upload" passHref legacyBehavior>
            <a className="relative group text-gray-700 hover:text-red-600 text-lg font-semibold tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-blue-500 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.demo')}</a>
            </Link>
            <Link href="/register" passHref legacyBehavior>
            <a className="relative group text-gray-700 hover:text-red-600 text-lg font-semibold tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-blue-500 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.signUp')}</a>
            </Link>
            <a href="mailto:support@yourdomain.com" className="relative group text-gray-700 hover:text-red-600 text-lg font-semibold tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-blue-500 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.support')}</a>
        </div>
        {/* Legal/secondary links */}
        <div className="flex flex-col items-start gap-2">
            <Link href="/about" passHref legacyBehavior>
            <a className="relative group text-gray-400 hover:text-red-500 text-sm font-medium tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-200 after:to-blue-200 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.aboutUs')}</a>
            </Link>
            <Link href="/privacy-policy" passHref legacyBehavior>
            <a className="relative group text-gray-400 hover:text-red-500 text-sm font-medium tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-200 after:to-blue-200 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.privacyPolicy')}</a>
            </Link>
            <Link href="/terms-of-service" passHref legacyBehavior>
            <a className="relative group text-gray-400 hover:text-red-500 text-sm font-medium tracking-wide transition-colors duration-200 after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-red-200 after:to-blue-200 after:scale-x-0 after:group-hover:scale-x-100 after:transition-transform after:duration-300 after:origin-left">{t('footer.termsOfService')}</a>
            </Link>
        </div>
        </div>
    </div>
    {/* Contact Info (right) */}
    <div className="flex flex-col items-start md:items-start w-full md:w-1/3 text-gray-500 text-sm gap-2 mt-8 md:mt-0">
        <span className="text-base md:text-lg font-bold text-gray-700 mb-2">{t('footer.contact')}</span>
        <div className="flex items-center gap-2"><MdBusiness className="text-lg" /><span className="font-semibold">{t('footer.company')}</span></div>
        <div className="flex items-center gap-2"><MdLocationOn className="text-lg" /><span>{t('footer.address')}</span></div>
        <div className="flex items-center gap-2 mt-2"><MdEmail className="text-lg" /><span>{t('footer.email')}</span></div>
        <div className="flex items-center gap-2"><MdPhone className="text-lg" /><span>{t('footer.phone')}</span></div>
    </div>
    </div>
    <div className="w-full text-center text-xs text-gray-400 mt-8 pt-4 pb-4 border-t border-gray-100">{t('footer.copyright')}</div>
    </footer>
    </>
    );
}
