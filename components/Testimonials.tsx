
import React, { useState } from 'react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }
  
  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="w-full mx-auto">
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl italic text-gray-800 px-4 md:px-8 text-center leading-relaxed">
               "{activeTestimonial.quote}"
            </p>
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-8xl text-orange-200 opacity-50" style={{color: 'rgba(255, 127, 80, 0.2)'}}>
                “
            </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-center items-center space-x-4 md:space-x-8 relative border-t pt-8">
          <div 
             className="absolute top-0 h-1 bg-slate-800 transition-all duration-500 ease-in-out"
             style={{
                backgroundColor: '#2F4F4F',
                width: `${100 / testimonials.length}%`,
                left: `${(activeIndex * 100) / testimonials.length}%`,
             }}
          />
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-col items-center space-y-2 transition-opacity duration-300 ${activeIndex === index ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              aria-label={`View testimonial from ${testimonial.name}`}
            >
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.name}
                  className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${activeIndex === index ? 'border-orange-500 scale-110' : 'border-transparent'}`}
                  style={{borderColor: activeIndex === index ? '#FF7F50' : 'transparent'}}
                />
                <span className={`font-semibold text-sm text-center ${activeIndex === index ? 'text-slate-800' : 'text-gray-500'}`} style={{color: activeIndex === index ? '#2F4F4F' : ''}}>
                  {testimonial.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
