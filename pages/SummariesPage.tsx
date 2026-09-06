import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, BookOpen, ChevronDown, Clock3, Search, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react';
import FavoriteButton from '../components/FavoriteButton';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { Book } from '../types';
import { SITE_URL, canonicalRoutePath } from '../utils/seoConfig';
import './SummariesPage.css';

const starterBookIds = ['atomic-habits', 'the-psychology-of-money', 'rich-dad-poor-dad', 'thinking-fast-and-slow', 'trading-in-the-zone'];
const priorityTopics = ['Personal Development', 'Finance', 'Business', 'Trading', 'Psychology', 'Self-Help'];
const bookUrl = (book: Book) => '/summary/' + (book.arabicSlug || book.id);

const LibraryBook: React.FC<{ book: Book; title: string; author: string }> = ({ book, title, author }) => (
  <article className="library-book">
    <Link to={bookUrl(book)} className="library-book-link" aria-label={'Read ' + title + ' by ' + author}>
      <div className="library-book-stage">
        <img src={book.coverImageUrl} alt={'Cover of ' + title} loading="lazy" decoding="async" />
      </div>
      <div className="library-book-info">
        <p className="library-book-category">{book.category || 'Book summary'}</p>
        <h3>{title}</h3>
        <p className="library-book-author">{author}</p>
        <div className="library-book-meta">
          <span><Clock3 aria-hidden="true" />10 min</span>
          {Boolean(book.rating) && <span className="library-rating"><Star aria-hidden="true" />{book.rating!.toFixed(1)}</span>}
          <ArrowRight className="library-book-arrow" aria-hidden="true" />
        </div>
      </div>
    </Link>
    <div className="library-book-save"><FavoriteButton bookId={book.id} size="md" /></div>
  </article>
);

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const location = useLocation();
  const { books, loading, error, refreshBooks } = useBooks();
  const { getBookTitle, getBookAuthor } = useLanguage();
  const isArabicRoute = location.pathname.startsWith('/ar/');
  useSEO({
    title: isArabicRoute
      ? 'ملخصات كتب عربية وعالمية | تحليل'
      : 'Book Summaries - Business, Trading, Finance & Self-Development | Ta7leel',
    description: isArabicRoute
      ? 'تصفح مكتبة تحليل لملخصات الكتب العربية والعالمية في الأعمال والتداول والاستثمار وتطوير الذات.'
      : 'Browse practical book summaries from top business, trading, finance, psychology, and self-development books.',
    keywords: isArabicRoute
      ? 'ملخصات كتب, ملخصات كتب عربية, كتب تطوير الذات, كتب الاستثمار, كتب التداول'
      : 'book summaries, business book summaries, trading book summaries, finance book summaries, self-help books',
    type: 'website',
    canonical: `${SITE_URL}${canonicalRoutePath(location.pathname)}`,
  });

  const library = useMemo(() => books.map(book => ({
    book,
    title: getBookTitle(book.id) === book.id ? book.title : getBookTitle(book.id),
    author: getBookAuthor(book.id) === book.id ? book.author : getBookAuthor(book.id),
  })), [books, getBookTitle, getBookAuthor]);

  const genres = useMemo(() => [...new Set(books.map(book => book.category).filter(Boolean))].sort((a, b) => {
    const aIndex = priorityTopics.indexOf(a);
    const bIndex = priorityTopics.indexOf(b);
    return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex) || a.localeCompare(b);
  }), [books]);
  const authors = useMemo(() => [...new Set(books.map(book => book.author).filter(Boolean))].sort(), [books]);
  const featured = library.find(({ book }) => book.id === 'atomic-habits') || library[0];
  const isAtomicHabits = featured?.book.id === 'atomic-habits';
  const activeFilterCount = [selectedGenre, selectedAuthor, selectedRating].filter(Boolean).length;
  const hasActiveFilters = Boolean(searchQuery.trim() || activeFilterCount);
  const visibleTopics = showAllTopics ? genres : genres.slice(0, 6);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return library.filter(({ book, title, author }) => {
      const matchesSearch = !query || [title, author, book.title, book.author, book.category].some(value => value?.toLowerCase().includes(query));
      return matchesSearch && (!selectedGenre || book.category === selectedGenre) &&
        (!selectedAuthor || book.author === selectedAuthor) && (!selectedRating || (book.rating || 0) >= Number(selectedRating));
    }).sort((a, b) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      if (sortOrder === 'rating') return (b.book.rating || 0) - (a.book.rating || 0) || a.title.localeCompare(b.title);
      const aIndex = starterBookIds.indexOf(a.book.id);
      const bIndex = starterBookIds.indexOf(b.book.id);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex) ||
        (b.book.rating || 0) - (a.book.rating || 0) || a.title.localeCompare(b.title);
    });
  }, [library, searchQuery, selectedGenre, selectedAuthor, selectedRating, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedAuthor('');
    setSelectedRating('');
  };

  return (
    <>
      <StructuredData type="website" />
      <div className="summaries-library">
        <div className="library-shell">
          <section className="library-hero" aria-labelledby="library-title">
            <div className="library-intro">
              <p className="library-eyebrow"><span />THE TA7LEEL LIBRARY</p>
              <h1 id="library-title">A little reading.<br /><span>A bigger perspective.</span></h1>
              <p className="library-intro-copy">Great books, distilled into ideas you can use. Find your next perspective on money, work, and the way you think.</p>
              <a href="#summaries-library" className="library-primary">Find your next read<ArrowDown aria-hidden="true" /></a>
              <div className="library-facts">
                <span><BookOpen aria-hidden="true" />{loading ? 'Explore the collection' : books.length + ' book summaries'}</span>
                <span><Clock3 aria-hidden="true" />About 10 minutes each</span>
              </div>
            </div>
            {featured ? (
              <Link to={bookUrl(featured.book)} className="library-feature" aria-label={'Read featured summary: ' + featured.title}>
                <div className="library-feature-top"><span><Sparkles aria-hidden="true" />A GOOD PLACE TO START</span><span className="library-feature-ribbon" aria-hidden="true" /></div>
                <div className="library-feature-body">
                  <div className="library-feature-cover"><img src={featured.book.coverImageUrl} alt={'Cover of ' + featured.title} decoding="async" loading="eager" /></div>
                  <div className="library-feature-copy">
                    <p className="library-feature-category">{featured.book.category}</p>
                    <h2>{featured.title}</h2>
                    <p className="library-feature-author">{featured.author}</p>
                    <p className="library-feature-insight">{isAtomicHabits ? 'Small habits. Remarkable change. Discover why getting 1% better makes all the difference.' : 'Make room for a new perspective. Start with the key ideas from this book.'}</p>
                  </div>
                </div>
                <div className="library-feature-bottom"><span><Clock3 aria-hidden="true" />10-minute brief</span><strong>Read summary<ArrowRight aria-hidden="true" /></strong></div>
              </Link>
            ) : <div className="library-feature-placeholder"><BookOpen aria-hidden="true" /><p>{loading ? 'Finding your next good read…' : 'A new perspective is a book away.'}</p></div>}
          </section>

          <section id="summaries-library" className="library-browse" aria-labelledby="browse-heading">
            <div className="library-section-heading">
              <div><p className="library-eyebrow">FOLLOW YOUR CURIOSITY</p><h2 id="browse-heading">Explore the collection<span>.</span></h2></div>
              <p>One book. A few minutes. Something that stays.</p>
            </div>
            <div className="library-search-row">
              <div className="library-search">
                <Search aria-hidden="true" />
                <label htmlFor="summary-search" className="sr-only">Search book summaries</label>
                <input id="summary-search" type="search" placeholder="Search by title, author, or idea…" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
                {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search"><X aria-hidden="true" /></button>}
              </div>
              <button type="button" className={'library-filter-toggle' + (showFilters ? ' is-active' : '')} aria-expanded={showFilters} aria-controls="library-advanced-filters" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal aria-hidden="true" />Filters{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
            </div>
            <div className="library-topics" role="group" aria-label="Filter by topic">
              <button type="button" aria-pressed={!selectedGenre} onClick={() => setSelectedGenre('')}>All books<span>{books.length}</span></button>
              {visibleTopics.map(genre => <button key={genre} type="button" aria-pressed={selectedGenre === genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>)}
              {genres.length > 6 && <button className="library-more-topics" type="button" aria-expanded={showAllTopics} onClick={() => setShowAllTopics(!showAllTopics)}>{showAllTopics ? 'Fewer topics' : 'More topics'}<ChevronDown className={showAllTopics ? 'is-expanded' : ''} aria-hidden="true" /></button>}
            </div>
            <div id="library-advanced-filters" className="library-advanced-filters" hidden={!showFilters}>
              <label htmlFor="library-category">Category<select id="library-category" value={selectedGenre} onChange={event => setSelectedGenre(event.target.value)}><option value="">All categories</option>{genres.map(genre => <option key={genre}>{genre}</option>)}</select></label>
              <label htmlFor="library-author">Author<select id="library-author" value={selectedAuthor} onChange={event => setSelectedAuthor(event.target.value)}><option value="">All authors</option>{authors.map(author => <option key={author}>{author}</option>)}</select></label>
              <label htmlFor="library-rating">Minimum rating<select id="library-rating" value={selectedRating} onChange={event => setSelectedRating(event.target.value)}><option value="">Any rating</option><option value="4.5">4.5 and up</option><option value="4">4 and up</option><option value="3.5">3.5 and up</option><option value="3">3 and up</option></select></label>
            </div>
            <div className="library-results-toolbar">
              <div className="library-results-count" role="status" aria-live="polite">{loading ? 'Loading the collection…' : <><strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'summary' : 'summaries'}{hasActiveFilters ? ' found' : ' to explore'}</>}</div>
              <label className="library-sort" htmlFor="library-sort">Sort by<select id="library-sort" value={sortOrder} onChange={event => setSortOrder(event.target.value)}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="title">Title: A–Z</option></select><ChevronDown aria-hidden="true" /></label>
            </div>
            {hasActiveFilters && <div className="library-active-filters">
              {searchQuery.trim() && <button type="button" onClick={() => setSearchQuery('')} aria-label={'Remove search: ' + searchQuery}>“{searchQuery}”<X aria-hidden="true" /></button>}
              {selectedGenre && <button type="button" onClick={() => setSelectedGenre('')} aria-label={'Remove category: ' + selectedGenre}>{selectedGenre}<X aria-hidden="true" /></button>}
              {selectedAuthor && <button type="button" onClick={() => setSelectedAuthor('')} aria-label={'Remove author: ' + selectedAuthor}>{selectedAuthor}<X aria-hidden="true" /></button>}
              {selectedRating && <button type="button" onClick={() => setSelectedRating('')} aria-label="Remove minimum rating">{selectedRating}+ stars<X aria-hidden="true" /></button>}
              <button type="button" className="library-clear" onClick={clearFilters}>Clear all</button>
            </div>}
            {error && <div className="library-error" role="alert"><p>{books.length ? 'The library could not refresh. Showing your last loaded collection.' : 'The library could not load. Try again to see the collection.'}</p><button type="button" onClick={() => void refreshBooks()} disabled={loading}>{loading ? 'Retrying…' : 'Try again'}</button></div>}
            {loading ? <div className="library-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div className="library-skeleton" key={index}><div /><span /><span /></div>)}</div> : filteredBooks.length ? (
              <div className="library-grid">{filteredBooks.map(({ book, title, author }) => <LibraryBook key={book.id} book={book} title={title} author={author} />)}</div>
            ) : !error && <div className="library-empty"><Search aria-hidden="true" /><h3>{hasActiveFilters ? 'A different search might open a new chapter.' : 'The collection is on its way.'}</h3><p>{hasActiveFilters ? 'Try another title or author, or clear your filters to explore all books.' : 'Check back soon for new book summaries.'}</p>{hasActiveFilters && <button type="button" className="library-primary" onClick={clearFilters}>Explore all books<ArrowRight aria-hidden="true" /></button>}</div>}
            {!loading && filteredBooks.length > 0 && <p className="library-endnote"><BookOpen aria-hidden="true" />{hasActiveFilters ? 'A new perspective is waiting in every book.' : 'You’ve reached the end of the shelf. Your next chapter is above.'}</p>}
          </section>
        </div>
      </div>
    </>
  );
};

export default SummariesPage;
