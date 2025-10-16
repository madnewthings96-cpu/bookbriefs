import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

interface FavoriteButtonProps {
  bookId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ bookId, size = 'md', className = '' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const isFav = isFavorite(bookId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }
    
    toggleFavorite(bookId);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-300 ${
        isFav 
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
          : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-md'
      } backdrop-blur-sm transform hover:scale-110 ${className}`}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        className={iconSizes[size]} 
        fill={isFav ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={isFav ? 0 : 2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
