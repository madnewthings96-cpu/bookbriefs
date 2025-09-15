
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <img
          className="h-64 w-full object-cover"
          src={book.coverImageUrl}
          alt={`Cover of ${translatedTitle}`}
        />
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-1 truncate group-hover:text-orange-500 transition-colors duration-300" style={{ color: '#2F4F4F' }}>
            {translatedTitle}
          </h3>
          <p className="text-gray-600 text-sm">{translatedAuthor}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
