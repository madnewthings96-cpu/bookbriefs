
import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { RainbowButton } from '../components/RainbowButton';

// Lazy load heavy components
const Testimonials = lazy(() => import('../components/Testimonials'));
const Categories = lazy(() => import('../components/Categories'));

const HomePage: React.FC = () => {
  useSEO({
    title: 'BookBriefs - Transform Your Learning with Powerful Book Summaries',
    description: 'Discover key insights from the world\'s greatest business and self-help books. Get comprehensive book summaries in minutes, not hours. Join thousands of learners today.',
    keywords: 'book summaries, business books, self-help books, book insights, learning, personal development, productivity, leadership books',
    type: 'website',
  });

  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
    <div>
      {/* Hero Section */}
      <section className="relative pt-2 pb-6 md:pt-4 md:pb-10 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Content */}
        <div className="container mx-auto text-center relative z-10 max-w-6xl">{/* removed px-4 */}
          {/* Logo and Rating */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4 logo-container">
              <img 
                src="/favicon/logo-white.png" 
                alt="BookBriefs Logo" 
                className="h-24 w-auto logo-image"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-semibold">5,000+ readers</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
            Read any{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              book
            </span>
            {' '}in{' '}
            <span className="relative inline-block">
              <span className="relative z-10">10 minutes</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-300 -skew-y-1"></span>
            </span>
          </h1>

          {/* Subheading */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10 text-gray-600 text-base md:text-lg">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium">New Books Weekly</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-12 flex justify-center">
            <div className="button-wrap relative z-10 rounded-full bg-transparent pointer-events-none">
              <Link
                to="/summaries"
                className="glass-button cursor-pointer relative rounded-full pointer-events-auto z-30 outline-none focus:outline-none inline-flex items-center"
              >
                <span className="button-text relative block select-none font-bold text-neutral-800 tracking-tight px-6 py-3.5 flex items-center gap-2 arabic-btn" style={{ fontSize: '24px' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  إقرأ
                </span>
                {/* Shine Effect */}
                <div className="button-shine"></div>
              </Link>
            </div>
          </div>

          {/* Book Carousel */}
          <div className="relative">
            <div className="flex justify-center items-end gap-3 md:gap-4 overflow-hidden">
              {/* Row 1 - Top */}
              <div className="flex gap-3 md:gap-4 animate-scroll-slow">
                <img src="/images/the alchemist.jpg" alt="The Alchemist" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/atomic-habits.jpg" alt="Atomic Habits" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/becoming.jpg" alt="Becoming" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/rich dad poor dad.jpg" alt="Rich Dad Poor Dad" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/one good trade.jpg" alt="One Good Trade" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/sapiens.jpg" alt="Sapiens" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/educated.jpg" alt="Educated" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the subtle art.jpg" alt="The Subtle Art" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/fast and slow.jpg" alt="Thinking Fast and Slow" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the four agreements.jpg" alt="The Four Agreements" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/hail mary.jpg" alt="Project Hail Mary" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/dune.jpg" alt="Dune" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the alchemist.jpg" alt="The Alchemist" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            
            {/* Second Row */}
            <div className="flex justify-center items-end gap-3 md:gap-4 mt-3 md:mt-4 overflow-hidden">
              <div className="flex gap-3 md:gap-4 animate-scroll-reverse">
                <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/trading-in-the-zone.jpg" alt="Trading in the Zone" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/best loser wins.jpg" alt="Best Loser Wins" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/can't hurt me.jpg" alt="Can't Hurt Me" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the alchemy of finance.jpg" alt="The Alchemy of Finance" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/competition demystified.jpg" alt="Competition Demystified" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/law of human nature.jpg" alt="The Laws of Human Nature" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/broken money.jpg" alt="Broken Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the intelligent investor.jpg" alt="The Intelligent Investor" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/one up on wall street.jpg" alt="One Up on Wall Street" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/relentless.jpg" alt="Relentless" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/americas bank.jpg" alt="America's Bank" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-gray-50">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
          <Categories />
        </Suspense>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Top Row - Single Card */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Card - Faster than light */}
            <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl border border-gray-200 p-8 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-orange-100/0 group-hover:from-orange-50/30 group-hover:via-orange-50/20 group-hover:to-orange-100/30 transition-all duration-700 pointer-events-none"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/0 via-orange-500/0 to-orange-400/0 group-hover:from-orange-400/20 group-hover:via-orange-500/20 group-hover:to-orange-400/20 rounded-2xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600 shadow-lg shadow-orange-500/50"></span>
                      </span>
                      <span className="font-medium text-gray-700">Live Speed</span>
                    </span>
                    <span className="font-bold text-orange-600 text-sm bg-orange-50 px-3 py-1 rounded-full">14.34 mbps</span>
                  </div>
                  
                  {/* Enhanced Chart */}
                  <div className="h-20 bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 border border-gray-100 group-hover:border-orange-200 transition-colors duration-500">
                    <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="15" x2="200" y2="15" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="200" y2="30" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="45" x2="200" y2="45" stroke="#f3f4f6" strokeWidth="0.5" />
                      
                      {/* Gradient fill under the line */}
                      <defs>
                        <linearGradient id="speedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="0,60 0,40 20,35 40,42 60,30 80,38 100,25 120,32 140,28 160,35 180,20 200,30 200,60"
                        fill="url(#speedGradient)"
                        className="transition-all duration-700"
                      />
                      
                      {/* Main line with animation */}
                      <polyline
                        points="0,40 20,35 40,42 60,30 80,38 100,25 120,32 140,28 160,35 180,20 200,30"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500 group-hover:stroke-[3]"
                        style={{
                          strokeDasharray: '500',
                          strokeDashoffset: '500',
                          animation: 'drawLine 2s ease-out forwards'
                        }}
                      />
                      
                      {/* Animated dots at data points */}
                      {[
                        [0, 40], [20, 35], [40, 42], [60, 30], [80, 38], 
                        [100, 25], [120, 32], [140, 28], [160, 35], [180, 20], [200, 30]
                      ].map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="0"
                          fill="#f97316"
                          className="group-hover:animate-pulse"
                          style={{
                            animation: `growDot 0.3s ease-out ${i * 0.1}s forwards`
                          }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-500">
                      Faster than light
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed text-lg pl-15">
                    Instant access to summaries. No waiting, no loading. Pure reading experience at lightning speed.
                  </p>
                  
                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2 pt-2 pl-15">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Instant Load
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Zero Buffering
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Optimized
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card - Key Takeaways (with chart) */}
            <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl border border-gray-200 p-8 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/30 group-hover:via-blue-50/20 group-hover:to-blue-100/30 transition-all duration-700 pointer-events-none"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/0 via-blue-500/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-blue-500/20 group-hover:to-blue-400/20 rounded-2xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>
              
              <div className="relative z-10 flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-500">
                    Key Takeaways
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Get key insights from any book in minutes. Learn faster, remember longer.
                  </p>
                  
                  {/* Enhanced Chart */}
                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-blue-200 transition-colors duration-500">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                      <span>Knowledge Retention</span>
                      <span className="font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500">+90%</span>
                    </div>
                    <div className="h-20 flex items-end gap-1 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-2">
                      {[40, 65, 45, 70, 55, 80, 60, 75, 50, 85, 70, 60, 90, 75, 65].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t transition-all duration-500 hover:from-blue-500 hover:to-blue-400 group-hover:shadow-lg"
                          style={{ 
                            height: `${height}%`,
                            animation: `growBar 0.6s ease-out ${i * 0.05}s both`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Summarized
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Learn Fast
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card - Share & Learn Together */}
            <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl border border-gray-200 p-8 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-100/0 group-hover:from-purple-50/30 group-hover:via-purple-50/20 group-hover:to-purple-100/30 transition-all duration-700 pointer-events-none"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/0 via-purple-500/0 to-purple-400/0 group-hover:from-purple-400/20 group-hover:via-purple-500/20 group-hover:to-purple-400/20 rounded-2xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>
              
              <div className="relative z-10 flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-500">
                    Share & Learn Together
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-5">
                    Share your favorite summaries with friends and build a community of readers.
                  </p>
                  
                  {/* Enhanced User List */}
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Likeur', initials: 'L', color: 'from-purple-400 to-purple-600', delay: '0s' },
                      { name: 'M. Irung', initials: 'MI', color: 'from-blue-400 to-blue-600', delay: '0.1s' },
                      { name: 'B. Ng', initials: 'BN', color: 'from-orange-400 to-orange-600', delay: '0.2s' }
                    ].map((user, i) => (
                      <div 
                        key={i}
                        className="flex items-center gap-3 bg-white/50 group-hover:bg-white rounded-xl p-3 border border-gray-100 group-hover:border-purple-200 transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer"
                        style={{
                          animation: `slideInRight 0.5s ease-out ${user.delay} both`
                        }}
                      >
                        <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                          <span className="text-white text-sm font-bold">{user.initials}</span>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-500">Active reader</span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  
                  {/* Community Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 group-hover:border-purple-200 transition-colors duration-500">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white"></div>
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">+12</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">readers in your network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
          <Testimonials testimonials={TESTIMONIALS} />
        </Suspense>
      </section>

      {/* Join Button Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <Link to="/signup">
            <RainbowButton className="text-lg px-12 text-white">
              Join
            </RainbowButton>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default HomePage;
