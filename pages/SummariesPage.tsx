
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from '../components/Spinner';

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const { books, loading } = useBooks();
  const { getBookTitle, getBookAuthor } = useLanguage();

  useSEO({
    title: 'Book Summaries - Discover Insights from Top Business & Self-Help Books | BookBriefs',
    description: 'Browse our collection of expertly curated book summaries. Get key insights from bestselling business, self-help, and productivity books in minutes.',
    keywords: 'book summaries, business book summaries, self-help books, productivity books, book reviews, key takeaways, quick reads',
    type: 'website',
  });

  // Get unique genres and authors for filters
  const genres = useMemo(() => {
    const uniqueGenres = [...new Set(books.map(book => book.category).filter(Boolean))];
    return uniqueGenres.sort();
  }, [books]);

  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(books.map(book => book.author).filter(Boolean))];
    return uniqueAuthors.sort();
  }, [books]);

  // Get the featured book (first book with highest rating, or just first book)
  const featuredBook = useMemo(() => {
    if (books.length === 0) return null;
    const sortedByRating = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sortedByRating[0];
  }, [books]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Show all books from Firestore - trust the database as the source of truth
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || book.category === selectedGenre;
    const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
    const matchesRating = !selectedRating || (book.rating && book.rating >= parseFloat(selectedRating));
    return matchesSearch && matchesGenre && matchesAuthor && matchesRating;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Get featured book translated info
  const featuredTitle = featuredBook ? (getBookTitle(featuredBook.id) === featuredBook.id ? featuredBook.title : getBookTitle(featuredBook.id)) : '';
  const featuredAuthorName = featuredBook ? (getBookAuthor(featuredBook.id) === featuredBook.id ? featuredBook.author : getBookAuthor(featuredBook.id)) : '';
  const featuredBookUrl = featuredBook ? (featuredBook.arabicSlug ? `/summary/${featuredBook.arabicSlug}` : `/summary/${featuredBook.id}`) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Featured Summary Section */}
      {featuredBook && (
        <div className="bg-gradient-to-r from-[#e5d557] to-[#f9e5c2] text-gray-800">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Featured Book Card */}
              <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                <div className="w-24 md:w-32 flex-shrink-0">
                  <img
                    src={featuredBook.coverImageUrl}
                    alt={`Cover of ${featuredTitle}`}
                    className="w-full h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">Featured Summary</span>
                  <h2 className="text-lg md:text-2xl font-bold leading-tight">{featuredTitle}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base text-gray-700">{featuredAuthorName}</span>
                    {featuredBook.rating && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= Math.round(featuredBook.rating!) ? 'text-yellow-400 fill-current' : 'text-teal-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    to={featuredBookUrl}
                    className="inline-flex items-center justify-center px-5 py-2 mt-2 bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-900 hover:shadow-xl transition-all duration-300 text-sm md:text-base w-fit"
                  >
                    Read Summary
                  </Link>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="search"
                      placeholder="Search by title or author..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      aria-label="Search for a book summary"
                      className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Clear search"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Genre Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-700 font-medium">Genre</label>
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-gray-700 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2rem' }}
                      >
                        <option value="">Genre</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Author Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-700 font-medium">Author</label>
                      <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-gray-700 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2rem' }}
                      >
                        <option value="">Author</option>
                        {authors.map((author) => (
                          <option key={author} value={author}>{author}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-teal-200 font-medium">Rating</label>
                      <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-gray-700 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2rem' }}
                      >
                        <option value="">★★★★</option>
                        <option value="4.5">★★★★★ 4.5+</option>
                        <option value="4">★★★★ 4+</option>
                        <option value="3.5">★★★½ 3.5+</option>
                        <option value="3">★★★ 3+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-6 pb-8 md:py-8">
        {/* Trending Now Section Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Trending Now</h2>
          <p className="text-gray-600 text-sm md:text-base mt-1">Discover wisdom from {filteredBooks.length} carefully curated books</p>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 mb-2">No books found</p>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummariesPage;
