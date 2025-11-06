
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import FavoriteButton from './FavoriteButton';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { getBookTitle, getBookAuthor } = useLanguage();
  
  const translatedTitle = getBookTitle(book.id);
  const translatedAuthor = getBookAuthor(book.id);
  
  // Use Arabic slug if available, otherwise use English ID
  const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;
  
  return (
    <Link to={bookUrl} className="block group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={book.coverImageUrl}
            alt={`Cover of ${translatedTitle}`}
            loading="lazy"
            decoding="async"
          />
          {/* Favorite Button */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton bookId={book.id} size="sm" />
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
            {translatedTitle}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">{translatedAuthor}</p>
          
          {/* Rating */}
          {book.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(book.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">{book.rating.toFixed(1)}</span>
            </div>
          )}
          
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              Summary
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
