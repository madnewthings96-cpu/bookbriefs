
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import Testimonials from '../components/Testimonials';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import Newsletter from '../components/Newsletter';

const HomePage: React.FC = () => {

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 px-4 rounded-lg shadow-xl overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/Website banner bookbriefs 3.png" 
            alt="BookBriefs Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-lg">
            Unlock Big Ideas, Faster.
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white drop-shadow-md">
            BookBriefs uses AI to provide you with concise summaries and key takeaways from the world's best books. Spend less time reading and more time learning.
          </p>
          <Link
            to="/summaries"
            className="inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 text-lg"
            style={{ backgroundColor: '#FF7F50' }}
          >
            Explore Summaries
          </Link>
        </div>
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
                to="/summaries"
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
