import React, { useMemo } from 'react';
import {
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
  Star,
} from 'lucide-react';
import { Book, SummaryData } from '../types';
import { getAffiliateLinksForBook } from '../utils/affiliateLinks';
import FavoriteButton from './FavoriteButton';
import HighlightableText from './HighlightableText';
import MarkdownRenderer from './MarkdownRenderer';
import NotesAndHighlightsPanel from './NotesAndHighlightsPanel';

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

const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');

const stripMarkdown = (text: string) =>
  text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/[-*]\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const getFirstSentence = (text: string) => {
  const leadLine =
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .find((line) => !/^(#{1,6}\s+|\*\*.+\*\*$|\d+\.\s+|[-*]\s+|>\s*)/.test(line)) || text;
  const plain = stripMarkdown(leadLine);
  const match = plain.match(/^(.{80,260}?[.!؟])\s/);
  return match?.[1] || plain.slice(0, 220);
};

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
  const plainSummary = useMemo(() => stripMarkdown(summaryData.summary), [summaryData.summary]);
  const wordCount = useMemo(() => plainSummary.split(/\s+/).filter(Boolean).length, [plainSummary]);
  const readMinutes = Math.max(3, Math.ceil(wordCount / 220));
  const quickBrief = useMemo(() => getFirstSentence(summaryData.summary), [summaryData.summary]);

  const tocItems = useMemo<TocItem[]>(() => {
    const markdownHeadings = summaryData.summary
      .split('\n')
      .map((line) => line.trim())
      .map((line) => {
        const match = /^(#{1,3})\s+(.+)/.exec(line);
        if (!match) return null;
        const label = match[2].replace(/\*\*/g, '').trim();
        return { id: slugifyHeading(label), label };
      })
      .filter((item): item is TocItem => Boolean(item));

    return [
      { id: 'quick-brief', label: 'Quick Brief' },
      { id: 'key-takeaways', label: t('keyTakeaways') || 'Key Takeaways' },
      { id: 'detailed-summary', label: t('detailedSummary') || 'Detailed Summary' },
      ...markdownHeadings.slice(0, 5),
    ];
  }, [summaryData.summary, t]);

  const bookLinks = useMemo(() => getAffiliateLinksForBook(book), [book]);

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
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors transition-transform duration-200 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-[#ff7f50]/30';

  return (
    <div className="summary-redesign -mt-8 bg-[#f7f3ed] text-[#17211f]">
      <section className="border-b border-black/5 bg-[linear-gradient(180deg,#fffaf3_0%,#f7f3ed_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
            <div className="mx-auto w-full max-w-[230px] lg:max-w-none">
              <div className="relative">
                <img
                  src={book.coverImageUrl}
                  alt={`Cover of ${displayTitle}`}
                  className="aspect-[2/3] w-full rounded-lg object-cover shadow-[0_24px_60px_rgba(23,33,31,0.22)] outline outline-1 outline-black/10"
                />
                <div className="absolute right-3 top-3">
                  <FavoriteButton bookId={book.id} size="md" />
                </div>
              </div>
            </div>

            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#46645f]">
                <span className="rounded-full bg-white px-3 py-1 shadow-[0_1px_2px_rgba(23,33,31,0.08)]">
                  {book.category}
                </span>
                <span>{readMinutes} min summary</span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-normal text-[#17211f] sm:text-5xl lg:text-6xl">
                {displayTitle}
              </h1>
              <p className="mt-3 text-lg font-semibold text-[#46645f]">by {displayAuthor}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#596a66]">
                {book.rating && (
                  <div className="flex items-center gap-2 font-bold text-[#17211f]">
                    <div className="flex items-center gap-0.5 text-[#d8a329]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(book.rating || 0) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="tabular-nums">{book.rating.toFixed(2)}</span>
                    {book.ratingsCount && (
                      <span className="font-medium text-[#6d7a76]">
                        ({formatCount(book.ratingsCount)} ratings)
                      </span>
                    )}
                  </div>
                )}
                {book.publicationYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {book.publicationYear}
                  </span>
                )}
                {book.pageCount && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {book.pageCount} pages
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {wordCount.toLocaleString()} words
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className={`summary-pdf-button ${actionButtonClass} bg-[#ff7f50] text-white hover:bg-[#ea6940]`}
                >
                  <Download className="h-4 w-4" />
                  Arabic PDF
                </button>
                <button
                  type="button"
                  onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                  className={`${actionButtonClass} bg-white text-[#17211f] shadow-[0_1px_2px_rgba(23,33,31,0.08)] hover:bg-[#fff7ef]`}
                >
                  <PenLine className="h-4 w-4" />
                  Add note
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className={`${actionButtonClass} bg-white text-[#17211f] shadow-[0_1px_2px_rgba(23,33,31,0.08)] hover:bg-[#fff7ef]`}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              {bookLinks.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-[#596a66]">Get the full book:</span>
                    {bookLinks.map((link) => {
                      const AffiliateIcon = affiliateIcons[link.format] || ShoppingBag;
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          aria-label={`Open ${displayTitle} on ${link.label}`}
                          title={link.label}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#244c47] shadow-[0_1px_2px_rgba(23,33,31,0.08)] transition-colors transition-transform duration-200 hover:bg-[#eef5f3] active:scale-[0.96]"
                        >
                          <AffiliateIcon className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">{link.label}</span>
                        </a>
                      );
                    })}
                  </div>
                  <p className="max-w-xl text-xs font-medium leading-relaxed text-[#7a675d]">
                    Some links may be affiliate links. We may earn a commission at no extra cost to you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <main className="min-w-0 space-y-8">
            <section
              id="quick-brief"
              className="rounded-lg bg-white p-5 shadow-[0_18px_45px_rgba(23,33,31,0.08)] outline outline-1 outline-black/5 sm:p-6"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#ff7f50]">
                <FileText className="h-4 w-4" />
                Quick Brief
              </div>
              <p className="text-xl font-bold leading-relaxed text-[#17211f] sm:text-2xl">
                {quickBrief}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#f7f3ed] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d7a76]">Best for</p>
                  <p className="mt-2 font-bold text-[#17211f]">{book.category} readers</p>
                </div>
                <div className="rounded-lg bg-[#f7f3ed] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d7a76]">Read time</p>
                  <p className="mt-2 font-bold tabular-nums text-[#17211f]">{readMinutes} minutes</p>
                </div>
                <div className="rounded-lg bg-[#f7f3ed] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d7a76]">Core value</p>
                  <p className="mt-2 font-bold text-[#17211f]">Practical ideas you can apply</p>
                </div>
              </div>
            </section>

            <section id="key-takeaways" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#ff7f50]">Read first</p>
                  <h2 className="mt-1 text-3xl font-black text-[#17211f]">
                    {t('keyTakeaways') || 'Key Takeaways'}
                  </h2>
                </div>
                <ListChecks className="hidden h-9 w-9 text-[#244c47] sm:block" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {summaryData.keyTakeaways.map((takeaway, index) => {
                  const cleanTakeaway = takeaway.replace(/\*\*/g, '').replace(/^\*\s*/, '').replace(/\*/g, '');
                  return (
                    <article
                      key={`${cleanTakeaway}-${index}`}
                      className="rounded-lg bg-white p-5 shadow-[0_14px_34px_rgba(23,33,31,0.07)] outline outline-1 outline-black/5 transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#244c47] text-sm font-black tabular-nums text-white">
                        {index + 1}
                      </div>
                      <p className="text-base font-semibold leading-relaxed text-[#293936]">{cleanTakeaway}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <article
              id="detailed-summary"
              className="rounded-lg bg-white shadow-[0_18px_45px_rgba(23,33,31,0.08)] outline outline-1 outline-black/5"
            >
              <div className="border-b border-black/5 px-5 py-5 sm:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-[#ff7f50]">Deep read</p>
                    <h2 className="mt-1 text-3xl font-black text-[#17211f]">
                      {t('detailedSummary') || 'Detailed Summary'}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#fff2ec] px-3 py-2 text-sm font-bold text-[#c7532d] transition-colors transition-transform duration-200 hover:bg-[#ffe3d6] active:scale-[0.96]"
                    >
                      <NotebookPen className="h-4 w-4" />
                      Note
                    </button>
                  </div>
                </div>
              </div>

              <div className="summary-article px-5 py-6 sm:px-7 md:px-9">
                <HighlightableText bookId={bookId}>
                  <MarkdownRenderer content={summaryData.summary} />
                </HighlightableText>
              </div>
            </article>
          </main>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-lg bg-white p-5 shadow-[0_14px_34px_rgba(23,33,31,0.07)] outline outline-1 outline-black/5">
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-[#244c47]" />
                <h2 className="font-black text-[#17211f]">Sections</h2>
              </div>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <a
                    key={`${item.id}-${item.label}`}
                    href={`#${item.id}`}
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-[#596a66] transition-colors hover:bg-[#f7f3ed] hover:text-[#17211f]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </section>

            <section className="rounded-lg bg-[#D3D4C0] p-5 text-[#17211f] shadow-[0_18px_45px_rgba(23,33,31,0.12)]">
              <div className="mb-4 flex items-center gap-2">
                <Highlighter className="h-4 w-4 text-[#244c47]" />
                <h2 className="font-black">Reader tools</h2>
              </div>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={isAuthenticated ? onAddNote : onRequireSignUp}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white/35 px-3 py-2 text-sm font-bold text-[#244c47] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-colors transition-transform duration-200 hover:bg-white/50 active:scale-[0.96]"
                >
                  <NotebookPen className="h-4 w-4" />
                  Add personal note
                </button>
              </div>
            </section>

            {bookLinks.length > 0 && (
              <section className="rounded-lg bg-white p-5 shadow-[0_14px_34px_rgba(23,33,31,0.07)] outline outline-1 outline-black/5">
                <div className="mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#ff7f50]" />
                  <h2 className="font-black text-[#17211f]">Get the book</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {bookLinks.map((link) => {
                    const AffiliateIcon = affiliateIcons[link.format] || ShoppingBag;
                    return (
                      <a
                        key={`sidebar-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        aria-label={`Open ${displayTitle} on ${link.label}`}
                        title={link.label}
                        className="flex min-h-11 items-center justify-center rounded-lg bg-[#f7f3ed] text-[#244c47] transition-colors transition-transform duration-200 hover:bg-[#eef5f3] active:scale-[0.96]"
                      >
                        <AffiliateIcon className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-[#7a675d]">
                  Some links may be affiliate links. We may earn a commission at no extra cost to you.
                </p>
              </section>
            )}

            <section className="summary-notes-panel">
              <NotesAndHighlightsPanel bookId={bookId} />
            </section>

            <section className="summary-support-card rounded-lg bg-[#D3D4C0] p-5 text-[#17211f] shadow-[0_18px_45px_rgba(23,33,31,0.12)] outline outline-1 outline-black/10">
              <div className="relative z-10 mb-4 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/45 text-[#244c47] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#52625d]">Reader supported</p>
                  <h2 className="mt-1 font-serif text-2xl font-black leading-tight text-[#17211f]">Support Ta7leel</h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#52625d]">
                    Help keep concise book insights free for every reader.
                  </p>
                </div>
              </div>
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#244c47] px-3 py-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(36,76,71,0.18)] transition-colors transition-transform duration-200 hover:bg-[#193b37] active:scale-[0.96]"
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

export { slugifyHeading };
export default SummaryReadingExperience;
