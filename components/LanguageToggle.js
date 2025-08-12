import { useLanguage } from '../lib/languageContext';

export default function LanguageToggle() {
  const { currentLocale, changeLanguage, isEnglish, isJapanese } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => changeLanguage(isEnglish ? 'ja' : 'en')}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-700 rounded-xl transition-colors duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label={`Switch to ${isEnglish ? 'Japanese' : 'English'}`}
      >
        <span className="text-lg">
          {isEnglish ? '🇯🇵' : '🇺🇸'}
        </span>
        <span className="hidden sm:inline">
          {isEnglish ? '日本語' : 'English'}
        </span>
        <svg 
          className="w-4 h-4 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
} 