import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers, FiGlobe, FiTrendingUp, FiAward, FiCheckCircle, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaRobot, FaShieldAlt, FaChartLine, FaLightbulb } from 'react-icons/fa';

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

export default function AboutUs() {
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden rounded-2xl">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Head>
        <title>About Us - Receipt OCR</title>
        <meta name="description" content="Learn about Receipt OCR and our mission" />
      </Head>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden py-28 md:py-36"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 opacity-95"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
          >
            <span className="text-sm font-medium text-white/90">About Our Company</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Redefining Receipt<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400">Management</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10"
          >
            Empowering businesses and individuals with AI-powered receipt management solutions that save time and reduce errors.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact" className="px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center">
              Get in Touch
              <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="#our-mission" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-300 flex items-center justify-center">
              Our Mission
              <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </motion.div>
        </div>
        
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '5M+', label: 'Receipts Processed' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm font-medium text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Our Story */}
        <motion.section 
          id="our-story"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 w-full bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                        <FaRobot className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Journey</h3>
                      <p className="text-gray-600">From concept to industry leader in receipt digitization</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-100 rounded-2xl -z-10"></div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="lg:pl-10">
              <div className="inline-block px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-full mb-4">
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Revolutionizing Receipt Management <span className="text-red-600">Since 2023</span>
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-6">
                <p>
                  Founded in 2023, Receipt OCR emerged from a simple yet powerful insight: businesses and individuals in Japan were losing countless hours to manual receipt processing, leading to inefficiencies and costly errors in financial management.
                </p>
                <p>
                  Our diverse team of AI visionaries, software engineers, and financial experts united to develop a groundbreaking solution. We combined cutting-edge OCR technology with deep learning algorithms specifically fine-tuned for the unique challenges of Japanese receipts, from intricate kanji characters to complex layouts.
                </p>
                <p>
                  What began as an ambitious startup has rapidly evolved into Japan's most trusted receipt digitization platform, serving thousands of satisfied users across industries. Today, we stand at the forefront of financial technology, continuously pushing the boundaries of what's possible in automated document processing.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Our Mission & Values */}
        <motion.section 
          id="our-mission"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div variants={fadeInUp} className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-4">
              Our Mission & Values
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Driving Innovation in <span className="text-red-600">Financial Technology</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600">
              We're on a mission to transform how businesses handle financial documents through cutting-edge AI and exceptional user experiences.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <FaLightbulb className="w-6 h-6" />,
                title: 'Innovation',
                description: 'We push the boundaries of AI and machine learning to deliver the most accurate and efficient receipt processing solution on the market.',
                color: 'from-purple-500 to-indigo-600',
                bg: 'purple-50',
                text: 'purple-600'
              },
              {
                icon: <FiUsers className="w-6 h-6" />,
                title: 'User-Centric',
                description: 'Our users inspire everything we build. We listen, learn, and adapt to deliver solutions that truly make a difference in their daily workflows.',
                color: 'from-red-500 to-pink-600',
                bg: 'red-50',
                text: 'red-600'
              },
              {
                icon: <FiTrendingUp className="w-6 h-6" />,
                title: 'Efficiency',
                description: 'We help businesses save time and reduce errors through intelligent automation and streamlined processes.',
                color: 'from-blue-500 to-cyan-600',
                bg: 'blue-50',
                text: 'blue-600'
              },
              {
                icon: <FiGlobe className="w-6 h-6" />,
                title: 'Global Vision',
                description: 'While we excel in Japanese receipt processing, our technology is designed with global financial documentation in mind.',
                color: 'from-green-500 to-teal-600',
                bg: 'green-50',
                text: 'green-600'
              },
              {
                icon: <FaShieldAlt className="w-6 h-6" />,
                title: 'Security First',
                description: 'We implement enterprise-grade security measures to protect your sensitive financial data at every step.',
                color: 'from-amber-500 to-orange-600',
                bg: 'amber-50',
                text: 'amber-600'
              },
              {
                icon: <FiAward className="w-6 h-6" />,
                title: 'Excellence',
                description: 'We take pride in delivering exceptional quality and continuously improving our solutions based on user feedback.',
                color: 'from-indigo-500 to-violet-600',
                bg: 'indigo-50',
                text: 'indigo-600'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 transition-all duration-300 border border-gray-100`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Team */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div variants={fadeInUp} className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-4">
              Our Team
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet the <span className="text-red-600">Visionaries</span> Behind Our Success
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600">
              A diverse team of experts united by a passion for innovation and excellence in financial technology.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: 'Yuki Tanaka', 
                role: 'CEO & Founder',
                bio: 'Serial entrepreneur with 15+ years in fintech and AI',
                emoji: '👩‍💼'
              },
              { 
                name: 'Hiroshi Sato', 
                role: 'CTO',
                bio: 'AI/ML expert with a focus on computer vision',
                emoji: '👨‍💻'
              },
              { 
                name: 'Aiko Watanabe', 
                role: 'Head of AI Research',
                bio: 'PhD in Machine Learning, specializing in NLP',
                emoji: '👩‍🔬'
              },
              { 
                name: 'Kenji Yamamoto', 
                role: 'Product Lead',
                bio: 'Product strategist with fintech experience',
                emoji: '👨‍💼'
              }
            ].map((member, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
              >
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-sm">{member.bio}</p>
                  </div>
                  <span className="text-6xl text-gray-300 group-hover:scale-110 transition-transform duration-500">
                    {member.emoji}
                  </span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-red-600 font-medium mb-3">{member.role}</p>
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Join Our Team CTA */}
          <motion.div 
            variants={fadeInUp}
            className="mt-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Want to Join Our Team?</h3>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                We're always looking for talented individuals who are passionate about AI and fintech innovation.
              </p>
              <a 
                href="#" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300"
              >
                View Open Positions
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center mb-20 bg-gradient-to-br from-red-600 to-pink-600 text-white"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-300/20 rounded-full mix-blend-overlay filter blur-2xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
            >
              Ready to Transform Your <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400">Receipt Management?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl mb-10 max-w-2xl mx-auto text-white/90"
            >
              Join thousands of businesses and individuals who trust Receipt OCR for fast, accurate, and secure receipt processing.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href="/register" 
                className="px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center"
              >
                Get Started Free
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-300 flex items-center justify-center"
              >
                Contact Sales
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80"
            >
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-green-300" />
                No credit card required
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-green-300" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Back to Home Link */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-gray-200 text-center"
        >
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </motion.div> */}
      </main>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
