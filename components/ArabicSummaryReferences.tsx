import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock3 } from 'lucide-react';
import { arabicBookSummaries } from '../translations/arabicBookSummaries';
import { arabicReaderLabels } from '../translations/arabicReaderLabels';
import { getSummaryPath } from '../utils/bookLocales';
import { getArabicRecommendations } from '../utils/arabicRecommendations';

const ArabicSummaryReferences: React.FC<{ bookId: string }> = ({ bookId }) => {
  const translation = arabicBookSummaries[bookId];
  if (!translation) return null;
  const recommendations = getArabicRecommendations(bookId);
  return (
    <div className="summary-references space-y-8" dir="rtl" lang="ar">
      <section aria-labelledby="summary-sources" className="rounded-[26px] border border-[#304529]/10 bg-[#FFFDF8] p-5 sm:p-8">
        <h2 id="summary-sources" className="text-xl font-bold text-[#10291F]">{arabicReaderLabels.sources}</h2>
        <p className="mt-3 leading-8 text-[#40544B]">{arabicReaderLabels.editorialNote}</p>
        <ul className="mt-3 list-disc space-y-2 ps-6">
          {translation.sources.map(source => <li key={source.url}><a href={source.url} className="text-[#304529] underline underline-offset-4">{source.label}</a></li>)}
        </ul>
      </section>
      {recommendations.length > 0 && <nav aria-labelledby="related-arabic-summaries" className="arabic-recommendations rounded-[26px] border border-[#304529]/10 bg-[#F3F1E8] p-4 sm:p-6">
        <header className="mb-5 flex items-start gap-3 px-1">
          <BookOpen aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[#99713D]" />
          <div>
            <h2 id="related-arabic-summaries" className="scroll-mt-28 text-xl text-[#10291F] sm:text-2xl">كتابك القادم يبدأ هنا</h2>
            <p className="mt-2 text-sm leading-7 text-[#66776E]">ملخصات مرتبطة بالأفكار التي قرأتها</p>
          </div>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2">
          {recommendations.map(({ book, translation: item, reason, minutes }) => (
            <li key={book.id} className="min-w-0">
              <Link to={getSummaryPath(book, 'ar')} className="arabic-recommendation-card group flex h-full flex-col rounded-[18px] border border-[#304529]/10 bg-[#FFFDF8] p-4 text-[#10291F] shadow-[0_3px_12px_rgba(16,41,31,0.03)] transition-[border-color,box-shadow] hover:border-[#C49552]/60 hover:shadow-[0_8px_24px_rgba(16,41,31,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99713D] focus-visible:ring-offset-2">
                <div className="flex items-start gap-3">
                  <img src={book.arabicCoverImageUrl || book.coverImageUrl} alt={`غلاف كتاب ${item.title}`} width="64" height="96" loading="lazy" decoding="async" className="h-24 w-16 shrink-0 rounded-[4px] bg-[#E9E5DA] object-contain shadow-[2px_3px_7px_rgba(16,41,31,0.16)]" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] transition-colors group-hover:text-[#6D512B]">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-[#66776E]">{item.author}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#66776E]"><Clock3 aria-hidden="true" className="h-3 w-3" />{minutes} دقائق قراءة</span>
                  </div>
                </div>
                <p className="mb-3 mt-4 text-xs leading-6 text-[#56684E]">{reason}</p>
                <span className="mt-auto flex items-center justify-between border-t border-[#304529]/8 pt-3 text-xs font-bold text-[#304529]">اقرأ الملخص<ArrowLeft aria-hidden="true" className="h-4 w-4" /></span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/summaries/" className="mt-5 flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#304529]/20 px-4 py-3 text-sm font-bold text-[#304529] transition-colors hover:bg-[#E6EBDD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99713D]">استكشف جميع الملخصات<ArrowLeft aria-hidden="true" className="h-4 w-4" /></Link>
      </nav>}
    </div>
  );
};

export default ArabicSummaryReferences;
