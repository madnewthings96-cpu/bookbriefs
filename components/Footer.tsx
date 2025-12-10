import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-white">
      <div className="relative overflow-hidden py-16 sm:py-20">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(135deg, rgba(17,24,39,0.9), rgba(3,7,18,0.9))'
          }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-[36px] border border-white/10 bg-white/5 px-8 py-12 sm:px-12 sm:py-14 md:px-16 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <div>
                  <span className="inline-flex items-center justify-center rounded-xl bg-white text-gray-900 px-3 py-1 text-xs font-semibold tracking-wide uppercase">BookBriefs</span>
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Transform your reading list into actionable insights.</h2>
                  <p className="mt-3 text-base text-white/70 leading-relaxed">Curated book summaries, tailored learning paths, and productivity tools that help you retain more in less time.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">Product</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li><Link to="/summaries" className="transition hover:text-white">Summaries</Link></li>
                    <li><Link to="/calculators" className="transition hover:text-white">Tools</Link></li>
                    <li><Link to="/downloads" className="transition hover:text-white">Downloads</Link></li>
                    {/* <li><Link to="/merch" className="transition hover:text-white">Merch</Link></li> */}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">Company</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li><Link to="/login" className="transition hover:text-white">Login</Link></li>
                    <li><Link to="/blog" className="transition hover:text-white">Blog</Link></li>
                    <li><Link to="/news" className="transition hover:text-white">Updates</Link></li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">Legal</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li><Link to="/privacy-policy" className="transition hover:text-white">سياسة الخصوصية</Link></li>
                    <li><Link to="/terms-of-use" className="transition hover:text-white">شروط الاستخدام</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/60">© {currentYear} BookBriefs. All rights reserved.</p>
              <div className="flex items-center gap-3 text-white/70">
                <a
                  href="https://t.me/MadMarkets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                  aria-label="Telegram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/Ta7leel007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                  aria-label="X"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.226 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@Ta7leeel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
                  </svg>
                </a>
                <a
                  href="https://ko-fi.com/ta7leel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                  aria-label="Ko-fi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;