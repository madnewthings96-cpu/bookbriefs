import React from 'react';
import { Quote, Star } from 'lucide-react';

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
      <div
        style={{
          animation: `scroll-up ${duration}s linear infinite`,
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="w-full max-w-xs rounded-2xl border border-[#d7c7b3] bg-white/86 p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.10)] backdrop-blur"
                key={i}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Quote className="h-5 w-5 text-[#a75d37]" aria-hidden="true" />
                  <div className="flex" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="text-sm leading-7 text-[#4d453a]">{text}</div>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#e5d8c7]"
                    loading="lazy"
                  />
                  <div className="flex flex-col">
                    <div className="font-black tracking-tight leading-5 text-gray-950">
                      {name}
                    </div>
                    <div className="text-sm font-semibold leading-5 tracking-tight text-[#7a6f62]">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(0, 2);

  return (
    <section className="overflow-hidden bg-[#f7f0e6] py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)]">
            Reader notes
          </p>
          <h2 className="text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
            The kind of reading habit people keep.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#675b4d] md:text-lg">
            Shorter sessions, clearer takeaways, and fewer unfinished books sitting in the queue.
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
