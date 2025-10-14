import React, { useState } from 'react';
import { Review } from '../types';
import { BOOK_REVIEWS } from '../constants';

interface BookReviewsProps {
  bookId: string;
}

const BookReviews: React.FC<BookReviewsProps> = ({ bookId }) => {
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');
  
  // Get reviews for this book
  const bookReviews = BOOK_REVIEWS.filter(review => review.bookId === bookId);
  
  // Sort reviews
  const sortedReviews = [...bookReviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful - a.helpful;
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Calculate average rating
  const averageRating = bookReviews.length > 0
    ? (bookReviews.reduce((sum, review) => sum + review.rating, 0) / bookReviews.length).toFixed(1)
    : '0';

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: bookReviews.filter(r => r.rating === star).length,
    percentage: bookReviews.length > 0 
      ? (bookReviews.filter(r => r.rating === star).length / bookReviews.length * 100).toFixed(0)
      : '0'
  }));

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (bookReviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 bg-white rounded-lg shadow-lg border border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Online Reviews
        </h2>
        
        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Average Rating */}
          <div className="flex-shrink-0">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
                {averageRating}
              </div>
              <div className="mb-2">
                {renderStars(Math.round(parseFloat(averageRating)), 'lg')}
              </div>
              <div className="text-sm text-gray-600">
                Based on {bookReviews.length} {bookReviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-grow">
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium text-gray-700">{star}</span>
                    <svg className="w-3 h-3 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Reader Reviews
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('helpful')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sortBy === 'helpful'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Most Helpful
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Most Recent
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{review.userName}</div>
                  <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                </div>
              </div>
              {renderStars(review.rating, 'sm')}
            </div>

            {/* Review Text */}
            <p className="text-gray-700 leading-relaxed mb-3">
              {review.reviewText}
            </p>

            {/* Review Footer */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Helpful ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookReviews;
