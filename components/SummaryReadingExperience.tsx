import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  Headphones,
  Highlighter,
  ListChecks,
  MessageCircle,
  NotebookPen,
  PenLine,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import { Book, SummaryData } from '../types';
import { getAffiliateLinksForBook } from '../utils/affiliateLinks';
import FavoriteButton from './FavoriteButton';
import HighlightableText from './HighlightableText';
import MarkdownRenderer from './MarkdownRenderer';
import NotesAndHighlightsPanel from './NotesAndHighlightsPanel';
import {
  extractSummarySections,
  getSummaryLandmark,
  getSummaryLead,
  pickActiveSummarySection,
  stripSummaryMarkdown,
} from './summaryReadingModel';

interface SummaryReadingExperienceProps {
  book: Book;
  bookId: string;
  summaryData: SummaryData;
  displayTitle: string;
  displayAuthor: string;
  isAuthenticated: boolean;
  onDownloadPdf: () => void;
  onAddNote: () => void;
  onRequireSignUp: () => void;
  t: (key: string) => string;
}

interface TocItem {
  id: string;
  label: string;
}

const formatCount = (value?: string | number) => {
  if (!value) return '';
  return typeof value === 'number' ? value.toLocaleString() : value;
};

const affiliateIcons = {
  amazon: ShoppingBag,
  kindle: BookOpen,
  audible: Headphones,
};

const SummaryReadingExperience: React.FC<SummaryReadingExperienceProps> = ({
  book,
  bookId,
  summaryData,
  displayTitle,
  displayAuthor,
  isAuthenticated,
  onDownloadPdf,
  onAddNote,
  onRequireSignUp,
  t,
}) => {
  const plainSummary = useMemo(() => stripSummaryMarkdown(summaryData.summary), [summaryData.summary]);
  const wordCount = useMemo(() => plainSummary.split(/\s+/).filter(Boolean).length, [plainSummary]);
  const readMinutes = Math.max(3, Math.ceil(wordCount / 220));
  const quickBrief = useMemo(() => getSummaryLead(summaryData.summary), [summaryData.summary]);

  const tocItems = useMemo<TocItem[]>(() => {
    const baseItems = [
      { id: 'quick-brief', label: 'Quick brief' },
      { id: 'key-takeaways', label: t('keyTakeaways') || 'Key takeaways' },
      { id: 'detailed-summary', label: t('detailedSummary') || 'Detailed summary' },
    ];
    const baseIds = new Set(baseItems.map((item) => item.id));
    const articleSections = extractSummarySections(summaryData.summary)
      .filter((item) => !baseIds.has(item.id))
      .slice(0, 6);

    return [...baseItems, ...articleSections];
  }, [summaryData.summary, t]);

  const [activeSectionId, setActiveSectionId] = useState(tocItems[0]?.id || 'quick-brief');
  const bookLinks = useMemo(() => getAffiliateLinksForBook(book), [book]);

  useEffect(() => {
    const updateActiveSection = () => {
      const positions = tocItems
        .map((item) => ({ id: item.id, top: document.getElementById(item.id)?.getBoundingClientRect().top }))
        .filter((item): item is { id: string; top: number } => typeof item.top === 'number');

      setActiveSectionId(pickActiveSummarySection(positions, 150));
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [tocItems]);

  const handleShare = async () => {
    const shareData = {
      title: `${displayTitle} Summary`,
      text: `Read the key ideas from ${displayTitle} by ${displayAuthor}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.error('Unable to share summary:', error);
    }
  };

  const actionButtonClass =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]';

  const renderSectionNav = (compact = false) => (
    <nav aria-label="Summary sections" className={compact ? 'flex min-w-max gap-1.5' : 'space-y-1'}>
      {(compact ? tocItems.slice(0, 3) : tocItems).map((item, index) => {
        const resolvedActiveSection = compact ? getSummaryLandmark(activeSectionId) : activeSectionId;
        const isActive = resolvedActiveSection === item.id;
        return (
          <a
            key={`${item.id}-${item.label}`}
            href={`#${item.id}`}
            aria-current={isActive ? 'location' : undefined}
            onClick={() => setActiveSectionId(item.id)}
            className={
              compact
                ? `inline-flex min-h-10 items-center rounded-full px-3.5 text-xs font-bold transition ${
                    isActive ? 'bg-[#304529] text-white shadow-sm' : 'bg-white text-[#5F7067] ring-1 ring-[#304529]/10'
                  }`
                : `group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold leading-5 transition ${
                    isActive ? 'bg-[#304529] text-white shadow-[0_7px_18px_rgba(48,69,41,0.18)]' : 'text-[#5F7067] hover:bg-[#F1EEE5] hover:text-[#10291F]'
                  }`
            }
          >
            {!compact && (
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-[#E3BE7D]' : 'bg-[#C8D2C8] group-hover:bg-[#C49552]'}`} />
            )}
            <span className={!compact && index > 2 ? 'line-clamp-2' : undefined}>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="summary-redesign -mt-8 bg-[#F4F0E7] text-[#10291F]">
      <section className="relative overflow-hidden border-b border-[#304529]/8 bg-[#FBF8F1] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_16%_8%,rgba(196,149,82,0.14),transparent_27%),radial-gradient(circle_at_82%_44%,rgba(74,103,65,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[26px] border border-[#304529]/10 bg-[#FFFDF8]/88 p-5 shadow-[0_22px_65px_rgba(31,54,43,0.09)] sm:p-7 md:p-8 lg:rounded-[34px] lg:p-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#304529] via-[#C49552] to-[#B7C6B7]" />
          <div className="grid gap-7 md:grid-cols-[210px_minmax(0,1fr)] md:items-center lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
            <div className="mx-auto w-full max-w-[180px] sm:max-w-[205px] md:max-w-none">
              <div className="relative isolate">
                <div aria-hidden="true" className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-[20px] border border-[#C49552]/28 bg-[#E9DEC9]" />
                <img
                  src={book.coverImageUrl}
                  alt={`Cover of ${displayTitle}`}
                  className="aspect-[2/3] w-full rounded-[18px] object-cover shadow-[0_24px_55px_rgba(16,41,31,0.2)] ring-1 ring-[#10291F]/12"
                />
                <div className="absolute right-3 top-3">
                  <FavoriteButton bookId={book.id} size="md" />
                </div>
                <div className="absolute -bottom-3 left-3 rounded-full border border-white/70 bg-[#304529] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-lg">
                  {readMinutes} min read
                </div>
              </div>
            </div>

            <div className="min-w-0 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#456052]">
                <span className="rounded-full border border-[#304529]/10 bg-[#E7EEE6] px-3 py-1.5">
                  {book.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C49552]/18 bg-[#F5EBD9] px-3 py-1.5 text-[#7A5C31]">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                  High-signal brief
                </span>
              </div>

              <h1 className="mt-4 max-w-[850px] text-[38px] font-black leading-[0.98] tracking-[-0.045em] text-[#0C251C] sm:text-5xl lg:text-[64px]">
                {displayTitle}
              </h1>
              <p className="mt-3 text-base font-semibold text-[#4C685B] sm:text-lg">
                <span className="font-medium text-[#7A897F]">by</span> {displayAuthor}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] font-medium text-[#62736A] sm:text-sm">
                {book.rating && (
                  <div className="flex items-center gap-2 font-bold text-[#18372B]">
                    <div className="flex items-center gap-0.5 text-[#C89224]" aria-label={`${book.rating.toFixed(2)} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          aria-hidden="true"
                          className={`h-4 w-4 ${star <= Math.round(book.rating || 0) ? 'fill-current' : 'fill-transparent'}`}
                          strokeWidth={1.8}
                        />
                      ))}
                    </div>
                    <span className="tabular-nums">{book.rating.toFixed(2)}</span>
                    {book.ratingsCount && <span className="font-medium text-[#75847B]">({formatCount(book.ratingsCount)})</span>}
                  </div>
                )}
                {book.publicationYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="h-4 w-4 text-[#4A6741]" />
                    {book.publicationYear}
                  </span>
                )}
                {book.pageCount && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen aria-hidden="true" className="h-4 w-4 text-[#4A6741]" />
                    {book.pageCount} pages
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="h-4 w-4 text-[#4A6741]" />
                  {wordCount.toLocaleString()} words
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className={`${actionButtonClass} bg-gradient-to-r from-[#304529] to-[#4A6741] text-white shadow-[0_12px_26px_rgba(48,69,41,0.23)] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(48,69,41,0.3)]`}
                >
                  <Download aria-hidden="true" className="h-[18px] w-[18px]" />
                  Arabic PDF
                </button>
                <button
                  type="button"
                  onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                  className={`${actionButtonClass} border border-[#304529]/12 bg-white text-[#18372B] shadow-sm hover:-translate-y-0.5 hover:border-[#304529]/22 hover:shadow-md`}
                >
                  <PenLine aria-hidden="true" className="h-[18px] w-[18px]" />
                  Add note
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className={`${actionButtonClass} border border-[#304529]/12 bg-white text-[#18372B] shadow-sm hover:-translate-y-0.5 hover:border-[#304529]/22 hover:shadow-md`}
                >
                  <Share2 aria-hidden="true" className="h-[18px] w-[18px]" />
                  Share
                </button>
              </div>

              {bookLinks.length > 0 && (
                <div className="mt-5 flex flex-col gap-2 border-t border-[#304529]/8 pt-4 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-xs font-bold text-[#66776E]">Get the full book</span>
                  <div className="flex flex-wrap gap-2">
                    {bookLinks.map((link) => {
                      const AffiliateIcon = affiliateIcons[link.format] || ShoppingBag;
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          aria-label={`Open ${displayTitle} on ${link.label}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#304529]/10 bg-[#F7F3EA] px-3 text-xs font-bold text-[#304529] transition hover:-translate-y-0.5 hover:border-[#304529]/20 hover:bg-[#EEF3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
                        >
                          <AffiliateIcon aria-hidden="true" className="h-4 w-4" />
                          {link.label}
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-[#8A9A90]" />
                        </a>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-medium leading-4 text-[#8A786C] sm:ml-auto sm:max-w-[210px]">
                    Affiliate links may earn us a commission at no extra cost to you.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-y border-[#304529]/8 bg-[#F4F0E7]/94 px-4 py-2.5 shadow-[0_8px_20px_rgba(16,41,31,0.06)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto max-w-7xl overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {renderSectionNav(true)}
        </div>
      </div>

      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_310px] xl:gap-10">
          <main className="min-w-0 space-y-9 lg:space-y-11">
            <section
              id="quick-brief"
              className="relative scroll-mt-32 overflow-hidden rounded-[26px] border border-[#304529]/10 bg-[#FFFDF8] px-5 py-6 shadow-[0_18px_48px_rgba(16,41,31,0.08)] sm:px-7 sm:py-8"
            >
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#C49552] via-[#E3BE7D] to-[#4A6741]" />
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.17em] text-[#8A6536]">
                <FileText aria-hidden="true" className="h-4 w-4" />
                Quick brief
              </div>
              <p className="mt-4 max-w-[860px] font-serif text-[25px] font-semibold leading-[1.35] tracking-[-0.025em] text-[#153126] sm:text-[30px]">
                {quickBrief}
              </p>
              <div className="mt-6 grid border-t border-[#304529]/10 pt-5 sm:grid-cols-3 sm:divide-x sm:divide-[#304529]/10">
                <div className="py-2 sm:pr-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7A897F]">Best for</p>
                  <p className="mt-1.5 text-sm font-bold text-[#18372B]">{book.category} readers</p>
                </div>
                <div className="border-t border-[#304529]/8 py-3 sm:border-t-0 sm:px-5 sm:py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7A897F]">Read time</p>
                  <p className="mt-1.5 text-sm font-bold tabular-nums text-[#18372B]">{readMinutes} minutes</p>
                </div>
                <div className="border-t border-[#304529]/8 py-3 sm:border-t-0 sm:pl-5 sm:py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7A897F]">Reading promise</p>
                  <p className="mt-1.5 text-sm font-bold text-[#18372B]">Useful ideas, without the filler</p>
                </div>
              </div>
            </section>

            <section id="key-takeaways" className="scroll-mt-32 overflow-hidden rounded-[28px] bg-[#173A2D] px-5 py-7 shadow-[0_24px_60px_rgba(16,41,31,0.18)] sm:px-7 sm:py-9">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.17em] text-[#E3BE7D]">Read first</p>
                  <h2 className="mt-1.5 text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                    {t('keyTakeaways') || 'Key Takeaways'}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">The ideas worth carrying into the rest of the book.</p>
                </div>
                <ListChecks aria-hidden="true" className="hidden h-9 w-9 text-[#E3BE7D] sm:block" strokeWidth={1.6} />
              </div>

              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {summaryData.keyTakeaways.map((takeaway, index) => {
                  const cleanTakeaway = stripSummaryMarkdown(takeaway);
                  return (
                    <article
                      key={`${cleanTakeaway}-${index}`}
                      className="group flex gap-4 rounded-[20px] border border-white/8 bg-[#FBF8F1] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:p-5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C49552]/28 bg-[#F5EBD9] text-xs font-black tabular-nums text-[#7B5B31]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="pt-1 text-[15px] font-semibold leading-6 text-[#29473A] sm:text-base sm:leading-7">{cleanTakeaway}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <article
              id="detailed-summary"
              className="scroll-mt-32 overflow-hidden rounded-[28px] border border-[#304529]/10 bg-[#FFFDF8] shadow-[0_22px_60px_rgba(16,41,31,0.09)]"
            >
              <header className="border-b border-[#304529]/8 bg-[linear-gradient(135deg,#FFFDF8,#F1F0E7)] px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.17em] text-[#8A6536]">Deep read</p>
                    <h2 className="mt-1.5 text-3xl font-black tracking-[-0.035em] text-[#10291F] sm:text-4xl">
                      {t('detailedSummary') || 'Detailed Summary'}
                    </h2>
                    <p className="mt-2 text-sm text-[#66776E]">A structured walkthrough of the book’s central ideas.</p>
                  </div>
                  <button
                    type="button"
                    onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                    className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#304529]/12 bg-white px-3.5 text-sm font-bold text-[#304529] shadow-sm transition hover:-translate-y-0.5 hover:border-[#304529]/22 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] sm:self-auto"
                  >
                    <NotebookPen aria-hidden="true" className="h-4 w-4" />
                    Add note
                  </button>
                </div>
              </header>

              <div className="summary-article px-5 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12">
                <div className="mx-auto max-w-[760px]">
                  <HighlightableText bookId={bookId}>
                    <MarkdownRenderer content={summaryData.summary} />
                  </HighlightableText>
                </div>
              </div>
            </article>
          </main>

          <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block lg:self-start">
            <section className="rounded-[22px] border border-[#304529]/10 bg-[#FFFDF8] p-4 shadow-[0_14px_36px_rgba(16,41,31,0.07)]">
              <div className="mb-3 flex items-center gap-2 px-2">
                <ListChecks aria-hidden="true" className="h-4 w-4 text-[#4A6741]" />
                <h2 className="text-sm font-black text-[#10291F]">On this page</h2>
              </div>
              {renderSectionNav()}
            </section>

            <section className="rounded-[22px] border border-[#304529]/10 bg-[#E6EBDD] p-5 text-[#10291F] shadow-[0_16px_38px_rgba(16,41,31,0.09)]">
              <div className="flex items-center gap-2">
                <Highlighter aria-hidden="true" className="h-4 w-4 text-[#4A6741]" />
                <h2 className="font-black">Reader toolkit</h2>
              </div>
              <p className="mt-2 text-xs font-medium leading-5 text-[#5A6C62]">Keep useful ideas close while you read.</p>
              <button
                type="button"
                onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#304529] px-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(48,69,41,0.2)] transition hover:-translate-y-0.5 hover:bg-[#253A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
              >
                <NotebookPen aria-hidden="true" className="h-4 w-4" />
                Add personal note
              </button>
            </section>

            {bookLinks.length > 0 && (
              <section className="rounded-[22px] border border-[#304529]/10 bg-[#FFFDF8] p-5 shadow-[0_14px_36px_rgba(16,41,31,0.07)]">
                <div className="mb-4 flex items-center gap-2">
                  <ShoppingBag aria-hidden="true" className="h-4 w-4 text-[#8A6536]" />
                  <h2 className="font-black text-[#10291F]">Get the book</h2>
                </div>
                <div className="grid gap-2">
                  {bookLinks.map((link) => {
                    const AffiliateIcon = affiliateIcons[link.format] || ShoppingBag;
                    return (
                      <a
                        key={`sidebar-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-[#F4F0E7] px-3 text-sm font-bold text-[#304529] transition hover:bg-[#E9EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
                      >
                        <AffiliateIcon aria-hidden="true" className="h-4 w-4" />
                        {link.label}
                        <ArrowUpRight aria-hidden="true" className="ml-auto h-3.5 w-3.5 text-[#809086]" />
                      </a>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] font-medium leading-4 text-[#8A786C]">Affiliate links may earn us a commission at no extra cost to you.</p>
              </section>
            )}

            <section className="summary-notes-panel">
              <NotesAndHighlightsPanel bookId={bookId} />
            </section>

            <section className="relative overflow-hidden rounded-[22px] border border-[#304529]/10 bg-[#D9DFC9] p-5 text-[#10291F] shadow-[0_16px_38px_rgba(16,41,31,0.1)]">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/35" />
              <div className="relative flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/55 text-[#304529]">
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#607064]">Reader supported</p>
                  <h2 className="mt-1 font-serif text-2xl font-bold leading-tight">Keep Ta7leel open</h2>
                  <p className="mt-2 text-xs font-medium leading-5 text-[#5B6B60]">Help keep concise book insights available to every reader.</p>
                </div>
              </div>
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#304529] px-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#253A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
              >
                Support on Ko-fi
              </a>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
};

export { slugifySummaryHeading as slugifyHeading } from './summaryReadingModel';
export default SummaryReadingExperience;
