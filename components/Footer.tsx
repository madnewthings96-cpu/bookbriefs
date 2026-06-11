import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Coffee, Instagram, Send, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const readerStack = [
    '/images/the alchemist.jpg',
    '/images/atomic-habits.jpg',
    '/images/rich dad poor dad.jpg',
    '/images/the psychology of money.jpg',
    '/images/dune.jpg',
    '/images/educated.jpg',
  ];

  return (
    <footer className="bg-[#e5d8c7] text-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="px-5 py-12 text-center sm:px-8 sm:py-16 lg:py-20">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-[0.95] tracking-tight text-gray-950 text-balance sm:text-5xl md:text-6xl">
            You don’t have to read it all alone.
          </h2>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-5 text-gray-700 text-pretty">
            The best ideas are easier to keep when they are clear, short, and ready when you are.
          </p>

          <div className="mt-5 flex justify-center -space-x-2" aria-hidden="true">
            {readerStack.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-10 w-10 rounded-full object-cover book-cover-outline shadow-[0_1px_2px_rgba(17,24,39,0.08),0_8px_18px_rgba(17,24,39,0.12)]"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          <Link
            to="/summaries"
            className="pressable mx-auto mt-12 flex min-h-12 w-full max-w-5xl items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-sm font-semibold text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_14px_34px_rgba(17,24,39,0.08)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-gray-50"
          >
            <span className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-950" aria-hidden="true" />
              Start reading smarter
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="grid border-t border-gray-950/55 md:grid-cols-2">
          <div className="flex min-h-[190px] flex-col justify-between px-5 py-8 sm:px-10 md:min-h-[220px]">
            <Link to="/" className="inline-flex items-center gap-3 text-gray-950">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent">
                <BookOpen className="h-12 w-12 stroke-[1.6]" aria-hidden="true" />
              </span>
              <span className="text-4xl font-semibold tracking-tight">BookBriefs</span>
            </Link>
            <p className="mt-10 text-xs text-gray-700">©{currentYear} BookBriefs, Inc. All Rights Reserved.</p>
          </div>

          <div className="grid min-h-[190px] border-t border-gray-950/55 md:min-h-[220px] md:border-l md:border-t-0 md:border-gray-950/55">
            <div className="px-5 py-8 sm:px-20">
              <nav className="space-y-4 text-sm font-medium text-gray-800" aria-label="Social links">
                <a href="https://x.com/Ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-xs font-bold" aria-hidden="true">𝕏</span>
                  X
                </a>
                <a href="https://www.youtube.com/@ta7leeel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                  YouTube
                </a>
                <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Coffee className="h-4 w-4" aria-hidden="true" />
                  Ko-fi
                </a>
                <a href="https://t.me/MadMarkets" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Telegram
                </a>
                <a href="https://www.instagram.com/ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  Instagram
                </a>
              </nav>
            </div>

            <div className="self-end px-5 pb-6 sm:px-20">
              <Link to="/privacy-policy" className="text-xs font-medium text-gray-700 transition-colors duration-200 hover:text-gray-950">
                Privacy Notice
              </Link>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
