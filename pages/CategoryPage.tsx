import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Spinner from '../components/Spinner';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import useSEO from '../hooks/useSEO';
import { CATEGORY_HUBS, SITE_URL, canonicalRoutePath } from '../utils/seoConfig';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const location = useLocation();
  const { books, loading } = useBooks();
  const isArabic = location.pathname.startsWith('/ar/');

  const category = CATEGORY_HUBS.find((hub) => hub.slug === categorySlug) || CATEGORY_HUBS[0];
  const categoryBooks = useMemo(
    () => books.filter((book) => book.category === category.category),
    [books, category.category]
  );

  const title = isArabic ? `${category.arabicTitle} | تحليل` : `${category.englishTitle} | Ta7leel`;
  const description = isArabic ? category.arabicDescription : category.englishDescription;
  const keywords = isArabic ? category.arabicKeywords : category.englishKeywords;

  useSEO({
    title,
    description,
    keywords,
    type: 'website',
    canonical: `${SITE_URL}${canonicalRoutePath(location.pathname)}`,
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? 'rtl' : 'ltr'}>
      <StructuredData
        type="breadcrumb"
        items={[
          { name: isArabic ? 'الرئيسية' : 'Home', url: '/' },
          { name: isArabic ? 'ملخصات الكتب' : 'Book Summaries', url: isArabic ? '/ar/book-summaries' : '/book-summaries' },
          { name: isArabic ? category.arabicTitle : category.englishTitle, url: location.pathname },
        ]}
      />

      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            {category.category}
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl md:text-5xl font-bold text-gray-950 text-balance">
            {isArabic ? category.arabicTitle : category.englishTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg leading-8 text-gray-700">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/summaries"
              className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              {isArabic ? 'تصفح كل الملخصات' : 'Browse all summaries'}
            </Link>
            <Link
              to="/calculators"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              {isArabic ? 'الأدوات والحاسبات' : 'Tools and calculators'}
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'أفضل الملخصات في هذا التصنيف' : 'Top summaries in this category'}
            </h2>
            <p className="mt-1 text-gray-600">
              {isArabic
                ? `${categoryBooks.length} ملخصاً مختاراً`
                : `${categoryBooks.length} curated summaries`}
            </p>
          </div>
        </div>

        {categoryBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categoryBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
            {isArabic ? 'لا توجد ملخصات في هذا التصنيف حالياً.' : 'No summaries are available in this category yet.'}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
