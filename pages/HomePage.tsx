
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import Testimonials from '../components/Testimonials';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import Categories from '../components/Categories';

const HomePage: React.FC = () => {

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2F4F4F 0%, #3A5A5A 50%, #4A6A6A 100%)' }}>
        {/* Floating Books */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Book 1 - Atomic Habits */}
          <div className="absolute top-8 right-16 md:top-12 md:right-20 transform rotate-12 animate-float opacity-90" style={{ animationDelay: '0s' }}>
            <img src="/images/atomic-habits.jpg" alt="Atomic Habits" className="w-20 h-28 md:w-32 md:h-40 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
          
          {/* Book 2 - Rich Dad Poor Dad */}
          <div className="absolute top-24 left-8 md:top-32 md:left-16 transform -rotate-6 animate-float-reverse opacity-85" style={{ animationDelay: '1s' }}>
            <img src="/images/rich dad poor dad.jpg" alt="Rich Dad Poor Dad" className="w-18 h-26 md:w-28 md:h-36 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
          
          {/* Book 3 - The Alchemist */}
          <div className="absolute bottom-12 right-8 md:bottom-20 md:right-12 transform rotate-8 animate-float opacity-80" style={{ animationDelay: '2s' }}>
            <img src="/images/the alchemist.jpg" alt="The Alchemist" className="w-16 h-24 md:w-28 md:h-36 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
          
          {/* Book 4 - Think and Grow Rich */}
          <div className="absolute bottom-20 left-4 md:bottom-32 md:left-12 transform -rotate-12 animate-float-reverse opacity-75" style={{ animationDelay: '0.5s' }}>
            <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" className="w-14 h-20 md:w-24 md:h-32 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
          
          {/* Book 5 - Sapiens */}
          <div className="absolute top-16 left-1/4 md:top-20 md:left-1/3 transform rotate-3 animate-float opacity-70" style={{ animationDelay: '1.5s' }}>
            <img src="/images/sapiens.jpg" alt="Sapiens" className="w-12 h-18 md:w-20 md:h-28 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
          
          {/* Book 6 - The Psychology of Money */}
          <div className="absolute bottom-8 right-1/4 md:bottom-16 md:right-1/3 transform -rotate-8 animate-float-reverse opacity-85" style={{ animationDelay: '2.5s' }}>
            <img src="/images/the psychology of money.jpg" alt="Psychology of Money" className="w-16 h-22 md:w-24 md:h-32 rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>

          {/* Additional smaller books for depth */}
          <div className="absolute top-1/3 right-1/2 transform rotate-45 animate-float opacity-50" style={{ animationDelay: '3s' }}>
            <img src="/images/becoming.jpg" alt="Becoming" className="w-10 h-14 md:w-16 md:h-22 rounded-md shadow-xl" />
          </div>
          
          <div className="absolute bottom-1/3 left-1/2 transform -rotate-30 animate-float-reverse opacity-60" style={{ animationDelay: '4s' }}>
            <img src="/images/educated.jpg" alt="Educated" className="w-8 h-12 md:w-14 md:h-20 rounded-md shadow-xl" />
          </div>

          {/* Subtle floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white bg-opacity-20 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white bg-opacity-30 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white bg-opacity-25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-lg">
            Get your mind expanding
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white drop-shadow-md opacity-90">
            Transform your learning with powerful book summaries. Absorb key insights from the world's greatest minds in minutes, not hours.
          </p>
          <Link
            to="/summaries"
            className="inline-block bg-orange-500 text-white font-bold py-4 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 text-lg shadow-xl"
            style={{ backgroundColor: '#FF7F50' }}
          >
            Explore
          </Link>
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
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center max-w-4xl">
           <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
            Why People Love Using <span style={{ color: '#FF7F50', textDecoration: 'underline', textDecorationThickness: '3px', textUnderlineOffset: '6px' }}>BookBriefs</span>
          </h2>
          <p className="text-gray-600 mb-12">
            Join thousands of readers who learn faster than they ever thought possible.
          </p>
          <Testimonials testimonials={TESTIMONIALS} />
           <div className="mt-12">
             <Link
                to="/signup"
                className="text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 text-lg"
                style={{ backgroundColor: '#FF7F50' }}
            >
                Sign up for free
            </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
