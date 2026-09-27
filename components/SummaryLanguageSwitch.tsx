import React from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { getSummaryPath } from '../utils/bookLocales';
import { arabicBookSummaries, type SummaryLanguage } from '../translations/arabicBookSummaries';

const SummaryLanguageSwitch: React.FC<{ book: Book; language: SummaryLanguage }> = ({ book, language }) => {
  if (!arabicBookSummaries[book.id]) return null;
  return (
    <nav aria-label={language === 'ar' ? 'لغة الملخص' : 'Summary language'} className="summary-language-switch flex flex-wrap items-center gap-2" dir="ltr">
      {(['ar', 'en'] as const).map(locale => (
        <Link key={locale} to={`${getSummaryPath(book, locale)}#quick-brief`} lang={locale} hrefLang={locale}
          aria-current={locale === language ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] ${locale === language ? 'border-[#304529] bg-[#304529] text-white' : 'border-[#304529]/15 bg-white text-[#304529] hover:bg-[#E9EFE6]'}`}>
          {locale === 'ar' ? 'العربية' : 'English'}
        </Link>
      ))}
    </nav>
  );
};

export default SummaryLanguageSwitch;
