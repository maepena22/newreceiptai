import Link from 'next/link';
import { MdEmail, MdPhone, MdLocationOn, MdBusiness, MdCheckCircle } from 'react-icons/md';
import { useState, useEffect } from 'react';


export default function Home() {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);
  const [user, setUser] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  
  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => setUser(data.user)).catch(() => setUser(null));
  }, []);
  const faqData = [
    {
      q: 'How accurate is the OCR?',
      a: 'Our AI-powered OCR is trained on thousands of Japanese receipts and achieves industry-leading accuracy, even on complex layouts.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes! All data is encrypted in transit and at rest. We never share your data with third parties.'
    },
    {
      q: 'Can I try before I buy?',
      a: 'Absolutely! Our Free plan lets you try all core features, and you can upgrade anytime.'
    },
    {
      q: 'How do I get support?',
      a: 'We offer email and priority support for all plans. Pro and Enterprise users get dedicated help.'
    },
  ];

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in overflow-hidden">

        <h1 className="text-5xl md:text-6xl font-extrabold text-red-700 mb-6 tracking-tight leading-tight">
          Effortless Japanese Receipt Ai
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">
          Instantly extract, organize, and manage your Japanese receipts with AI. Upload in bulk, track progress, and export results—all in a beautiful SaaS dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!user && 
          <Link href="/register" passHref legacyBehavior>
            <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
              Get Started Free
            </a>
          </Link>
        }
          <Link href="/upload" passHref legacyBehavior>
            <a className="bg-white border border-red-200 text-red-700 font-bold py-4 px-10 rounded-2xl text-lg shadow hover:bg-red-50 transition-all duration-200">
              Try Upload Demo
            </a>
          </Link>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">Why Choose Our Receipt AI SaaS?</h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">Experience the power of AI-driven receipt management with our cutting-edge features</p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feature Buttons */}
          <div className="w-full lg:w-1/3 space-y-4">
            {[
              {
                id: 'ai-powered',
                icon: '🤖',
                title: 'AI-Powered Solution',
                description: 'State-of-the-art Japanese OCR and GPT AI for accurate, fast extraction of receipt data.',
                video: '/videos/ai-demo.mp4',
                features: [
                  'Advanced Japanese text recognition',
                  'Smart data extraction',
                  'AI-powered categorization',
                  'Multi-language support'
                ]
              },
              {
                id: 'bulk-upload',
                icon: '📂',
                title: 'Bulk Upload & Processing',
                description: 'Upload multiple receipts at once and track processing jobs in real time.',
                video: '/videos/upload-demo.mp4',
                features: [
                  'Drag & drop interface',
                  'Batch processing',
                  'Real-time progress tracking',
                  'Background processing'
                ]
              },
              {
                id: 'dashboard',
                icon: '📊',
                title: 'Beautiful Dashboard',
                description: 'View, search, and manage your receipts in a modern, responsive SaaS dashboard.',
                video: '/videos/dashboard-demo.mp4',
                features: [
                  'Interactive data visualization',
                  'Advanced search & filters',
                  'Custom reports',
                  'Export to multiple formats'
                ]
              },
              {
                id: 'security',
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your data is encrypted, stored securely, and never shared. Enterprise-grade privacy.',
                video: '/videos/security-demo.mp4',
                features: [
                  'End-to-end encryption',
                  'GDPR & JP Act compliance',
                  'Regular security audits',
                  'Role-based access control'
                ]
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
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-14">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Testimonial 1 */}
          <div className="relative bg-gradient-to-br from-white via-red-50 to-blue-50 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar1.jpg" alt="Satoshi" className="object-cover w-full h-full scale-100" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">This is the best receipt ai tool I've ever used. The accuracy is amazing and the dashboard is beautiful!</p>
            <span className="font-semibold text-red-700">Satoshi</span>
            <span className="text-xs text-gray-400 mt-1">Tokyo</span>
          </div>
          {/* Testimonial 2 */}
          <div className="relative bg-gradient-to-br from-white via-pink-50 to-red-100 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar2.avif" alt="Yuki" className="object-cover w-full h-full scale-110" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">Bulk upload saved me hours. I love the real-time job tracking and export features.</p>
            <span className="font-semibold text-red-700">Yuki</span>
            <span className="text-xs text-gray-400 mt-1">Osaka</span>
          </div>
          {/* Testimonial 3 */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-pink-100 rounded-3xl shadow-xl p-10 flex flex-col items-center text-center group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-pink-300 opacity-30 select-none">“</span>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src="/avatar3.avif" alt="Kenji" className="object-cover w-full h-full scale-110" style={{transition: 'transform 0.3s'}} />
            </div>
            <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">Finally, a secure and private way to manage my receipts. Highly recommended!</p>
            <span className="font-semibold text-red-700">Kenji</span>
            <span className="text-xs text-gray-400 mt-1">Fukuoka</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-2 border-red-200">
            <h3 className="text-xl font-bold mb-2 text-red-700">Free</h3>
            <p className="text-3xl font-extrabold mb-4">$0</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>10 receipts/month</li>
              <li>Basic dashboard</li>
              <li>Email support</li>
            </ul>
           
            <Link href="/register" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">Get Started</a>
            </Link>
          
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-4 border-red-500 scale-105">
            <h3 className="text-xl font-bold mb-2 text-red-700">Pro</h3>
            <p className="text-3xl font-extrabold mb-4">$19<span className="text-base font-normal">/mo</span></p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>Unlimited receipts</li>
              <li>Advanced dashboard</li>
              <li>Priority support</li>
              <li>Export to CSV/Excel</li>
            </ul>
            <Link href="/register" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">Start Pro</a>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center border-2 border-red-200">
            <h3 className="text-xl font-bold mb-2 text-red-700">Enterprise</h3>
            <p className="text-3xl font-extrabold mb-4">Contact</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>Custom volume</li>
              <li>Team dashboard</li>
              <li>Dedicated support</li>
              <li>API access</li>
            </ul>
            <a href="mailto:sales@yourdomain.com" className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow hover:from-red-700 hover:to-pink-600 transition-all duration-200">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ready to transform your receipt workflow?</h2>
            <p className="text-lg text-gray-700 mb-4">Sign up now and start extracting value from your receipts in seconds.</p>
            <ul className="mb-8 space-y-3 w-full max-w-xs md:max-w-none mx-auto">
              <li className="flex items-center gap-2 text-gray-700 text-base"><MdCheckCircle className="text-green-500 text-xl" /> AI-powered Solution</li>
              <li className="flex items-center gap-2 text-gray-700 text-base"><MdCheckCircle className="text-green-500 text-xl" /> Bulk upload & instant results</li>
              <li className="flex items-center gap-2 text-gray-700 text-base"><MdCheckCircle className="text-green-500 text-xl" /> Export to CSV/Excel</li>
              <li className="flex items-center gap-2 text-gray-700 text-base"><MdCheckCircle className="text-green-500 text-xl" /> Secure, private, and easy to use</li>
            </ul>
            {!user && 
            <Link href="/register" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
                Get Started Free
              </a>
            </Link>
            }
            {user && 
            <Link href="/upload" passHref legacyBehavior>
              <a className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg transition-all duration-200">
                Try Uploading   
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