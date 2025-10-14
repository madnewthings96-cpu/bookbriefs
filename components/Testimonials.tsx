

import React from 'react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Floating emoji decorations
  const emojis = [
    { icon: '😴', color: 'bg-blue-400', position: 'top-8 left-[10%]', size: 'w-16 h-16', delay: '0s' },
    { icon: '😊', color: 'bg-orange-400', position: 'top-32 left-[20%]', size: 'w-20 h-20', delay: '1s' },
    { icon: '💜', color: 'bg-purple-400', position: 'top-8 right-[15%]', size: 'w-14 h-14', delay: '0.5s' },
    { icon: '💚', color: 'bg-green-400', position: 'top-32 right-[25%]', size: 'w-18 h-18', delay: '1.5s' },
    { icon: '✨', color: 'bg-yellow-300', position: 'top-16 left-[45%]', size: 'w-8 h-8', delay: '2s' },
    { icon: '💎', color: 'bg-pink-300', position: 'top-24 right-[40%]', size: 'w-10 h-10', delay: '2.5s' },
  ];

  return (
    <div className="w-full mx-auto relative">
      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {emojis.map((emoji, index) => (
          <div
            key={index}
            className={`absolute ${emoji.position} ${emoji.size} rounded-full flex items-center justify-center shadow-lg animate-float opacity-80`}
            style={{
              background: `linear-gradient(135deg, ${emoji.color === 'bg-blue-400' ? '#60A5FA' : emoji.color === 'bg-orange-400' ? '#FB923C' : emoji.color === 'bg-purple-400' ? '#C084FC' : emoji.color === 'bg-green-400' ? '#4ADE80' : emoji.color === 'bg-yellow-300' ? '#FDE047' : '#F9A8D4'} 0%, rgba(255,255,255,0.3) 100%)`,
              animationDelay: emoji.delay,
              animationDuration: '4s'
            }}
          >
            <span className="text-2xl">{emoji.icon}</span>
          </div>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Quote */}
            <div className="mb-6">
              <p className="text-gray-800 leading-relaxed text-base">
                "{testimonial.quote}"
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-600">
                  {index === 0 ? 'Member on forming more helpful habits' : 
                   index === 1 ? 'Member on learning to think in more helpful ways' : 
                   'Member on working through their feelings'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;

