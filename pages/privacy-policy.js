import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShield, FiLock, FiDatabase, FiUser, FiMail, FiMapPin, FiActivity, FiFileText, FiLayers } from 'react-icons/fi';
import { useTranslation } from '../lib/useTranslation';

export default function PrivacyPolicy() {
  const { t, tArray } = useTranslation();
  
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Head>
        <title>{t('pages.privacy.title')} - Receipt OCR</title>
        <meta name="description" content="Privacy policy for Receipt OCR service" />
      </Head>

      <main className="relative z-10 max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 mb-6">
            <FiShield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
            {t('pages.privacy.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pages.privacy.lastUpdated')} <span className="font-semibold text-gray-800">{t('pages.privacy.date')}</span>
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
            <motion.section 
              variants={fadeInUp}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 text-red-600 mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold">01</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('pages.privacy.sections.introduction.title')}</h2>
              </div>
              <div className="pl-16">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('pages.privacy.sections.introduction.content')}
                </p>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                  <FiDatabase className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('pages.privacy.sections.dataCollection.title')}</h2>
              </div>
              <div className="pl-16">
                <p className="text-lg text-gray-700 mb-4">{t('pages.privacy.sections.dataCollection.subtitle')}</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                      {[
                      { icon: <FiUser className="w-5 h-5 text-red-500" />, title: t('pages.privacy.sections.dataCollection.types.identity.title'), desc: t('pages.privacy.sections.dataCollection.types.identity.description') },
                      { icon: <FiMail className="w-5 h-5 text-blue-500" />, title: t('pages.privacy.sections.dataCollection.types.contact.title'), desc: t('pages.privacy.sections.dataCollection.types.contact.description') },
                      { icon: <FiDatabase className="w-5 h-5 text-purple-500" />, title: t('pages.privacy.sections.dataCollection.types.technical.title'), desc: t('pages.privacy.sections.dataCollection.types.technical.description') },
                    { icon: <FiActivity className="w-5 h-5 text-green-500" />, title: t('pages.privacy.sections.dataCollection.types.usage.title'), desc: t('pages.privacy.sections.dataCollection.types.usage.description') },
                    { icon: <FiFileText className="w-5 h-5 text-yellow-500" />, title: t('pages.privacy.sections.dataCollection.types.receipt.title'), desc: t('pages.privacy.sections.dataCollection.types.receipt.description') },
                    { icon: <FiLayers className="w-5 h-5 text-pink-500" />, title: t('pages.privacy.sections.dataCollection.types.profile.title'), desc: t('pages.privacy.sections.dataCollection.types.profile.description') }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-green-50 text-green-600 mr-4 group-hover:scale-110 transition-transform">
                  <FiLayers className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('pages.privacyExtended.howWeUse.title')}</h2>
              </div>
              <div className="pl-16">
                <p className="text-lg text-gray-700 mb-6">{t('pages.privacyExtended.howWeUse.intro')}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {tArray('pages.privacyExtended.howWeUse.purposes').map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-2xl mr-3 mt-1">{['🔍', '💳', '⚡', '✉️', '📊', '⚖️'][index]}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group bg-gradient-to-br from-red-50 to-blue-50 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden relative"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200 rounded-full opacity-20"></div>
              <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-200 rounded-full opacity-20"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 text-red-600 mr-4 group-hover:scale-110 transition-transform">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('pages.privacyExtended.dataSecurity.title')}</h2>
                </div>
                <div className="pl-16">
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {t('pages.privacyExtended.dataSecurity.intro')}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {tArray('pages.privacyExtended.dataSecurity.measures').map((item, index) => (
                      <div key={index} className="bg-white/70 p-4 rounded-xl backdrop-blur-sm">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                  <FiShield className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('pages.privacyExtended.legalRights.title')}</h2>
              </div>
              <div className="pl-16">
                <p className="text-lg text-gray-700 mb-6">
                  {t('pages.privacyExtended.legalRights.intro')}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {tArray('pages.privacyExtended.legalRights.rights').map((right, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{right.title}</h4>
                        <p className="text-sm text-gray-600">{right.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section 
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 md:p-10 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] bg-repeat"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('pages.privacyExtended.needHelp.title')}</h2>
                <p className="text-gray-300 mb-8 max-w-2xl">
                  {t('pages.privacyExtended.needHelp.intro')}
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-white/20 rounded-lg mr-4">
                        <FiMail className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{t('pages.privacyExtended.needHelp.emailUs')}</h3>
                    </div>
                    <a href="mailto:privacy@receiptocr.example.com" className="text-blue-300 hover:text-white transition-colors">
                      privacy@receiptocr.example.com
                    </a>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-white/20 rounded-lg mr-4">
                        <FiMapPin className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{t('pages.privacyExtended.needHelp.ourOffice')}</h3>
                    </div>
                    <p className="text-gray-300">
                      〒150-0001<br />
                      東京都渋谷区神宮前6丁目23番4号<br />
                      桑野ビル2F
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.div 
              variants={fadeInUp}
              className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center"
            >
              <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group transition-colors">
                <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('pages.privacyExtended.needHelp.backToHomepage')}
              </Link>
              <div className="text-sm text-gray-500">
                Last updated: July 24, 2025
              </div>
            </motion.div>
          </motion.div>
      </main>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
