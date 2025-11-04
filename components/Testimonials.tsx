import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  text: string;
  name: string;
  role: string;
  image: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const TestimonialsColumn: React.FC<{
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}> = ({ className, testimonials, duration = 10 }) => {
  return (
    <div className={className}>
      <motion.div
        animate={{
          translateY: '-50%',
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-10 rounded-3xl border border-gray-200 shadow-lg shadow-coral-500/10 max-w-xs w-full bg-white"
                key={i}
              >
                <div className="text-gray-700 leading-relaxed">{text}</div>
                <div className="flex items-center gap-2 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-5 text-gray-900">
                      {name}
                    </div>
                    <div className="leading-5 opacity-60 tracking-tight text-gray-600">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(0, 2);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What our readers say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join thousands of readers who are transforming their reading experience with BookBriefs.
          </p>
        </div>
        
        <div className="flex justify-center gap-6 max-h-[738px] overflow-hidden mask-gradient [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

