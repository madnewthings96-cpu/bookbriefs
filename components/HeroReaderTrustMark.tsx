import React from 'react';
import { Star } from 'lucide-react';

type LaurelProps = {
  mirrored?: boolean;
};

const Laurel: React.FC<LaurelProps> = ({ mirrored = false }) => (
  <svg
    data-laurel="true"
    viewBox="0 0 32 58"
    fill="none"
    aria-hidden="true"
    className={`h-11 w-6 shrink-0 text-forest-900/45 sm:h-12 sm:w-7 ${mirrored ? '-scale-x-100' : ''}`}
  >
    <path
      d="M25.5 4.5C14.8 13.3 9.1 25.7 9.6 38.4c.2 6 2 11 5.3 15.1"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path d="M23.9 5.1c-5.6.7-8.5 3.5-8.7 8.4 5.4-.7 8.3-3.5 8.7-8.4Z" fill="currentColor" />
    <path d="M16.8 13.2c-5.3 1.6-7.6 4.9-6.9 9.8 5.2-1.6 7.5-4.8 6.9-9.8Z" fill="currentColor" />
    <path d="M12.1 22.4c-4.8 2.5-6.4 6.1-4.9 10.8 4.8-2.4 6.4-6 4.9-10.8Z" fill="currentColor" />
    <path d="M9.8 32.9c-4.1 3.4-5 7.2-2.6 11.5 4.2-3.3 5-7.1 2.6-11.5Z" fill="currentColor" />
    <path d="M10.9 42.9c-3 4.2-2.9 8.1.4 11.7 3.1-4.1 3-8-.4-11.7Z" fill="currentColor" />
  </svg>
);

const HeroReaderTrustMark: React.FC = () => (
  <div
    className="mb-7 flex justify-center"
    role="img"
    aria-label="Rated five stars by 5,000+ active readers"
  >
    <div className="inline-flex items-center gap-3 sm:gap-4" aria-hidden="true">
      <Laurel />
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              data-reader-star="true"
              className="h-4 w-4 fill-[#A3AD18] text-[#A3AD18] sm:h-[18px] sm:w-[18px]"
            />
          ))}
        </div>
        <span className="mt-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-forest-900/60 sm:text-[11px]">
          5,000+ Active Readers
        </span>
      </div>
      <Laurel mirrored />
    </div>
  </div>
);

export default HeroReaderTrustMark;
