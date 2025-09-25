
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { getBookTitle, getBookAuthor } = useLanguage();
  
  const translatedTitle = getBookTitle(book.id);
  const translatedAuthor = getBookAuthor(book.id);
  
  return (
    <Link to={`/summary/${book.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={book.coverImageUrl}
            alt={`Cover of ${translatedTitle}`}
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
            {translatedTitle}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-1">{translatedAuthor}</p>
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
