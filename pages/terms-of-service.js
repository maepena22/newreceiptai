import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiShield, FiUser, FiAlertTriangle, FiCreditCard, FiX, FiAlertCircle, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useTranslation } from '../lib/useTranslation';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

export default function TermsAndConditions() {
  const { t, tArray } = useTranslation();
  
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Head>
        <title>{t('pages.terms.title')} - Receipt OCR</title>
        <meta name="description" content="Terms and conditions for using Receipt OCR service" />
      </Head>

      <motion.main 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="relative z-10 max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16 relative z-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-600 mb-6">
              <FiFileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {t('pages.terms.title')}
            </h1>
            <div className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              {t('pages.terms.lastUpdated')} {t('pages.terms.date')}
            </div>
          </motion.div>

          <div className="space-y-16">
            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-lg mr-4">1</span>
                {t('pages.terms.sections.acceptance.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <p>
                  {t('pages.terms.sections.acceptance.content')}
                </p>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg mr-4">2</span>
                {t('pages.terms.sections.description.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <p>
                  {t('pages.terms.sections.description.content')}
                </p>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-lg mr-4">3</span>
                {t('pages.terms.sections.userAccounts.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 text-sm font-medium mt-1 mr-3">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.userAccounts.register')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 text-sm font-medium mt-1 mr-3">
                      <FiShield className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.userAccounts.credentials')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 text-sm font-medium mt-1 mr-3">
                      <FiAlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.userAccounts.age')}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg mr-4">4</span>
                {t('pages.terms.sections.userContent.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mt-1 mr-3">
                      <span>4.1</span>
                    </div>
                    <p>{t('pages.terms.sections.userContent.ownership')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mt-1 mr-3">
                      <span>4.2</span>
                    </div>
                    <p>{t('pages.terms.sections.userContent.license')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mt-1 mr-3">
                      <span>4.3</span>
                    </div>
                    <p>{t('pages.terms.sections.userContent.responsibility')}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-lg mr-4">5</span>
                {t('pages.terms.sections.prohibitedActivities.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <p className="mb-4">{t('pages.terms.sections.prohibitedActivities.intro')}</p>
                <ul className="space-y-3">
                  {tArray('pages.terms.sections.prohibitedActivities.activities').map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 mr-3 mt-1">
                        <FiX className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg mr-4">6</span>
                {t('pages.terms.sections.subscriptionPayments.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mt-1 mr-3">
                      <FiCreditCard className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.subscriptionPayments.plans')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mt-1 mr-3">
                      <FiCreditCard className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.subscriptionPayments.billing')}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mt-1 mr-3">
                      <FiAlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.subscriptionPayments.refunds')}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg mr-4">7</span>
                {t('pages.terms.sections.termination.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <p>
                  {t('pages.terms.sections.termination.content')}
                </p>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg mr-4">8</span>
                {t('pages.terms.sections.disclaimer.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                  <p className="text-orange-700 font-medium">
                    {t('pages.terms.sections.disclaimer.content')}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg mr-4">9</span>
                {t('pages.terms.sections.limitation.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-amber-700 font-medium">
                    {t('pages.terms.sections.limitation.content')}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg mr-4">10</span>
                {t('pages.terms.sections.governingLaw.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mt-1 mr-3">
                    <FiMapPin className="w-3.5 h-3.5" />
                  </div>
                  <p>{t('pages.terms.sections.governingLaw.content')}</p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg mr-4">11</span>
                {t('pages.terms.sections.changes.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mt-1 mr-3">
                    <FiAlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <p>{t('pages.terms.sections.changes.content')}</p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group relative p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -left-3 top-6 w-1.5 h-16 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg mr-4">12</span>
                {t('pages.terms.sections.contact.title')}
              </h2>
              <div className="prose prose-lg text-gray-600 pl-14">
                <p className="mb-6">
                  {t('pages.terms.sections.contact.intro')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mt-1 mr-3">
                      <FiMail className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.contact.email')} <a href="mailto:legal@receiptocr.example.com" className="text-indigo-600 hover:text-indigo-800">legal@receiptocr.example.com</a></p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mt-1 mr-3">
                      <FiMapPin className="w-3.5 h-3.5" />
                    </div>
                    <p>{t('pages.terms.sections.contact.address')} 〒150-0001 東京都渋谷区神宮前6丁目23番4号 桑野ビル2F</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.div 
              variants={fadeInUp}
              className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center"
            >
              <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium group transition-colors">
                <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('pages.terms.sections.contact.backToHome')}
              </Link>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
              >
                {t('pages.terms.sections.contact.backToTop')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
