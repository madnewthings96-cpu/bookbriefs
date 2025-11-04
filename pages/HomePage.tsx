
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import Testimonials from '../components/Testimonials';
import Categories from '../components/Categories';
import SparklesText from '../components/SparklesText';
import { Magnetic } from '../components/Magnetic';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';

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
      <section className="relative py-6 md:py-10 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Content */}
        <div className="container mx-auto text-center relative z-10 max-w-6xl">{/* removed px-4 */}
          {/* User Avatars and Rating */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center -space-x-3 mb-3">
              <img 
                src="https://i.pravatar.cc/150?img=12" 
                alt="User 1" 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
              />
              <img 
                src="https://i.pravatar.cc/150?img=33" 
                alt="User 2" 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
              />
              <img 
                src="https://i.pravatar.cc/150?img=45" 
                alt="User 3" 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
              />
              <img 
                src="https://i.pravatar.cc/150?img=56" 
                alt="User 4" 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
              />
              <img 
                src="https://i.pravatar.cc/150?img=68" 
                alt="User 5" 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
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
            <SparklesText
              text="book"
              className="inline-block"
              colors={{ first: '#FF6B6B', second: '#4ECDC4' }}
              sparklesCount={8}
            />
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
            <Magnetic intensity={0.4} range={150}>
              <Link
                to="/summaries"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white font-bold py-4 px-10 rounded-full hover:from-orange-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 text-lg shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Discover
              </Link>
            </Magnetic>
          </div>

          {/* Book Carousel */}
          <div className="relative">
            <div className="flex justify-center items-end gap-3 md:gap-4 overflow-hidden">
              {/* Row 1 - Top */}
              <div className="flex gap-3 md:gap-4 animate-scroll-slow">
                <img src="/images/the alchemist.jpg" alt="The Alchemist" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/atomic-habits.jpg" alt="Atomic Habits" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/becoming.jpg" alt="Becoming" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/rich dad poor dad.jpg" alt="Rich Dad Poor Dad" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/one good trade.jpg" alt="One Good Trade" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/sapiens.jpg" alt="Sapiens" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/educated.jpg" alt="Educated" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the subtle art.jpg" alt="The Subtle Art" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/fast and slow.jpg" alt="Thinking Fast and Slow" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the four agreements.jpg" alt="The Four Agreements" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/hail mary.jpg" alt="Project Hail Mary" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/dune.jpg" alt="Dune" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the alchemist.jpg" alt="The Alchemist" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            
            {/* Second Row */}
            <div className="flex justify-center items-end gap-3 md:gap-4 mt-3 md:mt-4 overflow-hidden">
              <div className="flex gap-3 md:gap-4 animate-scroll-reverse">
                <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/trading-in-the-zone.jpg" alt="Trading in the Zone" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/best loser wins.jpg" alt="Best Loser Wins" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/can't hurt me.jpg" alt="Can't Hurt Me" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the alchemy of finance.jpg" alt="The Alchemy of Finance" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/competition demystified.jpg" alt="Competition Demystified" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/law of human nature.jpg" alt="The Laws of Human Nature" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/broken money.jpg" alt="Broken Money" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/the intelligent investor.jpg" alt="The Intelligent Investor" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/one up on wall street.jpg" alt="One Up on Wall Street" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/relentless.jpg" alt="Relentless" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/americas bank.jpg" alt="America's Bank" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
                <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg shadow-lg object-cover hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-gray-50">
        <Categories />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Top Row - Single Card */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Card - Faster than light */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
                    Download
                  </span>
                  <span className="font-semibold">14.34 mbps</span>
                </div>
                <div className="h-16">
                  <svg viewBox="0 0 200 60" className="w-full h-full">
                    <polyline
                      points="0,40 20,35 40,42 60,30 80,38 100,25 120,32 140,28 160,35 180,20 200,30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-900"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Faster than light</h3>
              <p className="text-gray-600 leading-relaxed">
                Instant access to summaries. No waiting, no loading. Pure reading experience.
              </p>
            </div>
          </div>

          {/* Bottom Row - 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 4 - Faster than light (with chart) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-full border-2 border-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Faster than light</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Get key insights from any book in minutes. Learn faster, remember longer.
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="h-20 flex items-end gap-1">
                      {[40, 65, 45, 70, 55, 80, 60, 75, 50, 85, 70, 60, 90, 75, 65].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gray-200 rounded-t transition-all hover:bg-gray-900"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 - Keep your loved ones safe */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-full border-2 border-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Share & Learn Together</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Share your favorite summaries with friends and build a community of readers.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">L</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Likeur</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">MI</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">M. Irung</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">BN</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">B. Ng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white">
        <Testimonials testimonials={TESTIMONIALS} />
      </section>
    </div>
    </>
  );
};

export default HomePage;
