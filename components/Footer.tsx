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
                <a href="https://www.pinterest.com/Ta7leelPro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                  <svg className="h-4 w-4 text-red-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                  Pinterest
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
