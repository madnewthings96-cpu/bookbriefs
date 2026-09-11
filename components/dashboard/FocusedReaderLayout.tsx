import { Link, Outlet } from 'react-router-dom';
import './FocusedReaderLayout.css';

export default function FocusedReaderLayout() {
  return (
    <div className="focused-reader-frame min-h-screen bg-[#f4f0e7] text-[#10291f]">
      <a
        className="fixed start-3 top-3 z-[200] -translate-y-40 rounded-lg bg-white px-3.5 py-2.5 font-bold text-[#09251c] shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#c49552]"
        href="#focused-reader-content"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-[#304529]/10 bg-[#fffdf8]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-serif text-lg font-bold text-[#10291f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c49552]">
            <img className="h-8 w-8 object-contain" src="/images/ta7leel-navbar-logo-mind-leaf.png" alt="" />
            <span>Ta7leel</span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#5f7067]">Focused reading</span>
        </div>
      </header>
      <main id="focused-reader-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
