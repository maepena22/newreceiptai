import Link from 'next/link';
import { MdEmail, MdPhone, MdLocationOn, MdBusiness, MdCheckCircle } from 'react-icons/md';
import { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useTranslation } from '../lib/useTranslation';


export default function Home() {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const { user } = useAuth();
  const { t, tArray } = useTranslation();
  
  const faqData = tArray('home.faq.questions');

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in overflow-hidden">

        <h1 className="text-5xl md:text-6xl font-extrabold text-red-700 mb-6 tracking-tight leading-tight">
          {t('home.hero.title')}
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">
          {t('home.hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!user && 
          <Link href="/register" passHref legacyBehavior>
            <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
              {t('home.hero.getStarted')}
            </a>
          </Link>
        }
          <Link href="/upload" passHref legacyBehavior>
            <a className="bg-white border border-red-200 text-red-700 font-bold py-4 px-10 rounded-2xl text-lg shadow hover:bg-red-50 transition-all duration-200">
              {t('home.hero.tryDemo')}
            </a>
          </Link>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">{t('home.features.title')}</h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feature Buttons */}
          <div className="w-full lg:w-1/3 space-y-4">
            {[
              {
                id: 'ai-powered',
                icon: '🤖',
                title: t('home.features.aiPowered.title'),
                description: t('home.features.aiPowered.description'),
                video: '/videos/ai-demo.mp4',
                features: tArray('home.features.aiPowered.features')
              },
              {
                id: 'bulk-upload',
                icon: '📂',
                title: t('home.features.bulkUpload.title'),
                description: t('home.features.bulkUpload.description'),
                video: '/videos/upload-demo.mp4',
                features: tArray('home.features.bulkUpload.features')
              },
              {
                id: 'dashboard',
                icon: '📊',
                title: t('home.features.dashboard.title'),
                description: t('home.features.dashboard.description'),
                video: '/videos/dashboard-demo.mp4',
                features: tArray('home.features.dashboard.features')
              },
              {
                id: 'security',
                icon: '🔒',
                title: t('home.features.security.title'),
                description: t('home.features.security.description'),
                video: '/videos/security-demo.mp4',
                features: tArray('home.features.security.features')
              }
            ].map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start space-x-4 hover:shadow-md ${
                  activeFeature?.id === feature.id 
                    ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500' 
                    : 'bg-white border border-gray-100 hover:border-red-100'
                }`}
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Dynamic Content Area */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-lg overflow-hidden">
            {activeFeature ? (
              <div className="h-full flex flex-col">
                <div className="relative pt-[56.25%] bg-black">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                    src={activeFeature.video}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{activeFeature.title}</h3>
                      <p className="text-gray-200">{activeFeature.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {activeFeature.features.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 p-12 text-center">
                <div>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Feature</h3>
                  <p className="text-gray-500">Click on any feature to see it in action</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full max-w-5xl mx-auto py-20 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-14">{t('home.testimonials.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Testimonial 1 */}
          <div className="relative bg-gradient-to-br from-white via-red-50 to-blue-50 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar1.jpg" alt="Satoshi" className="object-cover w-full h-full scale-100" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">{t('home.testimonials.testimonial1.text')}</p>
            <span className="font-semibold text-red-700">{t('home.testimonials.testimonial1.author')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('home.testimonials.testimonial1.location')}</span>
          </div>
          {/* Testimonial 2 */}
          <div className="relative bg-gradient-to-br from-white via-pink-50 to-red-100 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar2.avif" alt="Yuki" className="object-cover w-full h-full scale-110" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">{t('home.testimonials.testimonial2.text')}</p>
            <span className="font-semibold text-red-700">{t('home.testimonials.testimonial2.author')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('home.testimonials.testimonial2.location')}</span>
          </div>
          {/* Testimonial 3 */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-pink-100 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar3.avif" alt="Kenji" className="object-cover w-full h-full scale-110" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">{t('home.testimonials.testimonial3.text')}</p>
            <span className="font-semibold text-red-700">{t('home.testimonials.testimonial3.author')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('home.testimonials.testimonial3.location')}</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">{t('home.pricing.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-2 text-red-700">{t('home.pricing.free.title')}</h3>
            <p className="text-3xl font-extrabold mb-4">{t('home.pricing.free.price')}</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              {tArray('home.pricing.free.features').map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {/* Removed Get Started button - Free plan is always default */}
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-4 border-red-500 scale-105">
            <h3 className="text-xl font-bold mb-2 text-red-700">{t('home.pricing.pro.title')}</h3>
            <p className="text-3xl font-extrabold mb-4">{t('home.pricing.pro.price')}<span className="text-base font-normal">{t('home.pricing.pro.period')}</span></p>
            <ul className="text-gray-600 mb-6 space-y-2">
              {tArray('home.pricing.pro.features').map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <Link href={user ? "/subscription" : "/login"} passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">{t('home.pricing.pro.cta')}</a>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-2 border-red-200">
            <h3 className="text-xl font-bold mb-2 text-red-700">{t('home.pricing.enterprise.title')}</h3>
            <p className="text-3xl font-extrabold mb-4">{t('home.pricing.enterprise.price')}<span className="text-base font-normal">{t('home.pricing.enterprise.period')}</span></p>
            <ul className="text-gray-600 mb-6 space-y-2">
              {tArray('home.pricing.enterprise.features').map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <Link href={user ? "/subscription" : "/login"} passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">{t('home.pricing.enterprise.cta')}</a>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">{t('home.faq.title')}</h2>
        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow">
              <button
                className="w-full flex justify-between items-center p-6 focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
                aria-controls={`faq-panel-${idx}`}
              >
                <span className="font-semibold text-lg text-gray-700 text-left">{item.q}</span>
                <span className={`ml-4 transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : 'rotate-0'}`}>+</span>
              </button>
              {openFaq === idx && (
                <div id={`faq-panel-${idx}`} className="px-6 pb-6 text-gray-700 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left: Image */}
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <img src="/cash_receipt_02.jpg" alt="Receipt workflow illustration" className="w-128 h-128 object-contain rounded-2xl shadow-lg bg-white" />
          </div>
          {/* Right: CTA */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('home.cta.title')}</h2>
            <p className="text-lg text-gray-700 mb-4">{t('home.cta.subtitle')}</p>
            <ul className="mb-8 space-y-3 w-full max-w-xs md:max-w-none mx-auto">
              {tArray('home.cta.features').map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700 text-base">
                  <MdCheckCircle className="text-green-500 text-xl" /> {feature}
                </li>
              ))}
            </ul>
            {!user && 
            <Link href="/register" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
                {t('home.cta.getStarted')}
              </a>
            </Link>
            }
            {user && 
            <Link href="/upload" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
                {t('home.cta.tryUpload')}
              </a>
            </Link>
            }
          </div>
        </div>
      </section>

     

    </div>
    </>
  );
}