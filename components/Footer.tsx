import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Instagram, Send, Youtube } from 'lucide-react';

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
    <footer className="bg-forest-950 text-forest-100 border-t border-forest-900/60">
      <div className="mx-auto max-w-7xl">
        <section className="px-5 py-14 text-center sm:px-8 sm:py-18 lg:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
            You don’t have to read it all alone.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-forest-200/80 text-pretty">
            The best ideas are easier to retain when they are clear, concise, and accessible whenever you need them.
          </p>

          <div className="mt-6 flex justify-center -space-x-2" aria-hidden="true">
            {readerStack.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-forest-900 shadow-md transition-transform duration-200 hover:-translate-y-1"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          <Link
            to="/summaries"
            className="pressable mx-auto mt-10 flex min-h-12 w-full max-w-3xl items-center justify-between rounded-full bg-forest-900/90 px-6 py-3.5 text-left text-sm font-bold text-white border border-forest-700/60 shadow-card-rest transition-all duration-200 hover:bg-forest-800 hover:border-forest-600"
          >
            <span className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Start reading smarter with Ta7leel</span>
            </span>
            <ArrowRight className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          </Link>
        </section>

        <section className="grid border-t border-forest-900/80 md:grid-cols-2">
          <div className="flex min-h-[190px] flex-col justify-between px-5 py-8 sm:px-10 md:min-h-[220px]">
            <Link
              to="/"
              className="group inline-flex w-fit flex-col items-start gap-2 rounded-xl text-white outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-4 focus-visible:ring-offset-forest-950"
            >
              <img
                src="/images/ta7leel-navbar-logo-mind-leaf.png"
                alt="Ta7leel"
                className="h-auto w-44 object-contain object-left brightness-0 invert"
                loading="lazy"
                decoding="async"
              />
              <div className="flex flex-col">
                <span className="text-xs text-forest-300/80 font-medium">BookBriefs · High-Signal Reading</span>
              </div>
            </Link>
            <p className="mt-8 text-xs text-forest-400/80">©{currentYear} Ta7leel (BookBriefs). All Rights Reserved.</p>
          </div>

          <div className="grid min-h-[190px] border-t border-forest-900/80 md:min-h-[220px] md:border-l md:border-t-0 md:border-forest-900/80">
            <div className="px-5 py-8 sm:px-16">
              <nav className="grid grid-cols-2 gap-3 text-sm font-semibold text-forest-200" aria-label="Social links">
                <a href="https://x.com/Ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-xs font-bold" aria-hidden="true">𝕏</span>
                  X / Twitter
                </a>
                <a href="https://www.youtube.com/@ta7leeel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <Youtube className="h-4 w-4 text-red-400" aria-hidden="true" />
                  YouTube
                </a>
                <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <Coffee className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  Ko-fi
                </a>
                <a href="https://t.me/MadMarkets" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <Send className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  Telegram
                </a>
                <a href="https://www.instagram.com/ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <Instagram className="h-4 w-4 text-pink-400" aria-hidden="true" />
                  Instagram
                </a>
              </nav>
            </div>

            <div className="self-end px-5 pb-6 sm:px-16">
              <div className="flex items-center gap-4 text-xs font-medium text-forest-400/80">
                <Link to="/privacy-policy" className="transition-colors duration-200 hover:text-white">
                  Privacy Notice
                </Link>
                <span>·</span>
                <Link to="/terms-of-use" className="transition-colors duration-200 hover:text-white">
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
