import React from 'react';
import { Link } from 'react-router-dom';
import { arabicBookSummaries } from '../translations/arabicBookSummaries';
import { arabicReaderLabels } from '../translations/arabicReaderLabels';
import { getSummaryPath } from '../utils/bookLocales';

const ArabicSummaryReferences: React.FC<{ bookId: string }> = ({ bookId }) => {
  const translation = arabicBookSummaries[bookId];
  if (!translation) return null;
  return (
    <div className="summary-references space-y-8 rounded-[26px] border border-[#304529]/10 bg-[#FFFDF8] p-5 sm:p-8" dir="rtl" lang="ar">
      <section aria-labelledby="summary-sources">
        <h2 id="summary-sources" className="text-xl font-bold text-[#10291F]">{arabicReaderLabels.sources}</h2>
        <p className="mt-3 leading-8 text-[#40544B]">{arabicReaderLabels.editorialNote}</p>
        <ul className="mt-3 list-disc space-y-2 ps-6">
          {translation.sources.map(source => <li key={source.url}><a href={source.url} className="text-[#304529] underline underline-offset-4">{source.label}</a></li>)}
        </ul>
      </section>
      <nav aria-labelledby="related-arabic-summaries">
        <h2 id="related-arabic-summaries" className="text-xl font-bold text-[#10291F]">تابع القراءة بالعربية</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {Object.entries(arabicBookSummaries).filter(([id]) => id !== bookId).map(([id, item]) => (
            <li key={id}><Link to={getSummaryPath({ id }, 'ar')} className="inline-flex min-h-11 items-center rounded-xl border border-[#304529]/15 px-3 text-sm font-bold text-[#304529] hover:bg-[#E9EFE6]">{item.title}</Link></li>
          ))}
        </ul>
        <Link to="/summaries/" className="mt-4 inline-block text-[#304529] underline underline-offset-4">كل ملخصات الكتب</Link>
      </nav>
    </div>
  );
};

export default ArabicSummaryReferences;
