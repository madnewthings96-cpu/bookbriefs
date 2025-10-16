
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import Testimonials from '../components/Testimonials';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import Categories from '../components/Categories';
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
      <section className="relative py-6 md:py-10 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Content */}
        <div className="container mx-auto text-center relative z-10 max-w-6xl">
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
              <span className="text-gray-700 font-semibold">50,000+ readers</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
            Read any book in{' '}
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
          <Link
            to="/summaries"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white font-bold py-4 px-10 rounded-full hover:from-orange-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg shadow-xl mb-12"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Click to Discover
          </Link>

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

      {/* Personalized Recommendations */}
      <section className="py-8">
        <div className="container mx-auto">
          <PersonalizedRecommendations />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto text-center max-w-7xl px-4">
           <div className="relative inline-block mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 relative z-10 px-8 py-4">
              Readers are enjoying happier and<br />healthier lives
            </h2>
            {/* Neon Green Border Animation */}
            <div className="absolute inset-0 rounded-3xl animate-neon-border"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                backgroundSize: '200% 100%',
                padding: '3px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'neon-border-flow 3s linear infinite',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.3)'
              }}
            />
          </div>
          <Testimonials testimonials={TESTIMONIALS} />
        </div>
      </section>
    </div>
    </>
  );
};

export default HomePage;
