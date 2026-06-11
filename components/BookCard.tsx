
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock3, Star } from 'lucide-react';
import { Book } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import FavoriteButton from './FavoriteButton';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { getBookTitle, getBookAuthor } = useLanguage();

  const titleFromContext = getBookTitle(book.id);
  const authorFromContext = getBookAuthor(book.id);

  const translatedTitle = titleFromContext === book.id ? book.title : titleFromContext;
  const translatedAuthor = authorFromContext === book.id ? book.author : authorFromContext;

  // Use Arabic slug if available, otherwise use English ID
  const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;

  return (
    <Link to={bookUrl} className="group block rounded-[18px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#a75d37]/25">
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.05),0_14px_30px_rgba(89,69,45,0.08)] ring-1 ring-[#eadfce] transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_22px_44px_rgba(89,69,45,0.14)] hover:ring-[#d7c7b3]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-[18px] bg-[#f7f0e6] book-cover-outline">
          <img
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            src={book.coverImageUrl}
            alt={`Cover of ${translatedTitle}`}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute left-2 top-2 z-10 inline-flex min-h-7 items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-[#7a4a31] shadow-[0_8px_18px_rgba(17,24,39,0.12)] backdrop-blur">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            10 min
          </div>
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton bookId={book.id} size="sm" />
          </div>
        </div>
        <div className="p-3.5">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#a75d37]">
            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{book.category || 'Summary'}</span>
          </div>
          <h3 className="mb-1 line-clamp-2 min-h-[2.25rem] text-sm font-black leading-tight text-gray-950 transition-colors duration-300 group-hover:text-[#a75d37] text-balance">
            {translatedTitle}
          </h3>
          <p className="mb-3 line-clamp-1 text-xs font-medium text-[#6d6256] text-pretty">{translatedAuthor}</p>

          <div className="flex items-center justify-between gap-2 border-t border-[#f0e6d8] pt-3">
            {book.rating ? (
              <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-[#fff7e8] px-2.5 py-1 text-xs font-black text-[#7a4a31] shadow-[inset_0_0_0_1px_rgba(167,93,55,0.12)] tabular-nums">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                {book.rating.toFixed(1)}
              </span>
            ) : (
              <span className="inline-flex min-h-7 items-center rounded-full bg-[#f7f0e6] px-2.5 py-1 text-xs font-black text-[#7a4a31]">
                Brief
              </span>
            )}
            <span className="text-xs font-black text-[#a75d37] transition-transform duration-300 group-hover:translate-x-0.5">
              Read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
