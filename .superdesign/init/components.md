# Shared UI Components

Framework context: React 18 + TypeScript on Vite, Tailwind CSS, custom components, and a small shadcn/Radix-style primitive layer. This catalog is intentionally limited to reusable primitives and cross-page patterns; route-specific calculators, trading widgets, and long-form page compositions belong in `pages.md`.

The source below is copied verbatim from the repository. The dormant command family is retained for discovery, but should not be selected as generation context without repairing its missing local/dependency imports.

## Button

- File: `components/ui/button.tsx`
- Description: CVA- and Radix Slot-based button primitive with variant, size, and `asChild` composition support.
- Key props: `variant`, `size`, `asChild`, plus native button attributes

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## ConfirmDialog

- File: `components/ui/ConfirmDialog.tsx`
- Description: Reusable blocking confirmation modal with primary/danger treatments and loading state.
- Key props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `cancelText`, `variant`, `isLoading`

```tsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {variant === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
```

## Spinner

- File: `components/Spinner.tsx`
- Description: Centered coral circular loading indicator used by route suspense and data-loading pages.
- Key props: None

```tsx

import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500" style={{ borderColor: '#FF7F50', borderTopColor: 'transparent', borderBottomColor: 'transparent' }}></div>
    </div>
  );
};

export default Spinner;
```

## ErrorMessage

- File: `components/ErrorMessage.tsx`
- Description: Compact red alert panel for surfaced page errors.
- Key props: `message`

```tsx

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
```

## BookCard

- File: `components/BookCard.tsx`
- Description: Reusable library/category book tile with cover, metadata, summary link, and favorite action.
- Key props: `book` (`Book`)

```tsx

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
```

## FavoriteButton

- File: `components/FavoriteButton.tsx`
- Description: Authentication-aware bookmark control with three sizes and a sign-up prompt fallback.
- Key props: `bookId`, `size`, `className`

```tsx
import React, { useState } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import SignUpPromptModal from './SignUpPromptModal';

interface FavoriteButtonProps {
  bookId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ bookId, size = 'md', className = '' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const isFav = isFavorite(bookId);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowSignUpModal(true);
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
    <>
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
      
      <SignUpPromptModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />
    </>
  );
};

export default FavoriteButton;
```

## SearchResults

- File: `components/SearchResults.tsx`
- Description: Header search dropdown with loading, empty, and navigable-result states.
- Key props: `results`, `onClose`, `isVisible`, `isLoading`

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onClose: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onClose, 
  isVisible,
  isLoading = false 
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 z-50">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
          <p className="mt-2">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <ul className="py-2">
          {results.map((result) => (
            <li key={result.id}>
              <button
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {result.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchResults;
```

## SignUpPromptModal

- File: `components/SignUpPromptModal.tsx`
- Description: Reusable guest-conversion modal shown when protected lightweight actions need an account.
- Key props: `isOpen`, `onClose`

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface SignUpPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignUpPromptModal: React.FC<SignUpPromptModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate('/signup');
    onClose();
  };

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col space-y-1">
                <div className="h-1 w-6 md:w-8 bg-gray-800 rounded"></div>
                <div className="h-1 w-6 md:w-8 bg-gray-800 rounded"></div>
                <div className="h-1 w-6 md:w-8 bg-gray-800 rounded"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-900">BookBriefs</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 text-center">
            {t('createFreeAccount') || 'Create a free account to unlock:'}
          </h2>

          {/* Benefits list */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900 text-sm md:text-base">{t('recommendations') || 'Recommendations:'}</span>
                <span className="text-gray-600 text-sm md:text-base"> {t('personalizedForYou') || 'Personalized for you'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900 text-sm md:text-base">{t('pdfDownloads') || 'Arabic PDF Downloads:'}</span>
                <span className="text-gray-600 text-sm md:text-base"> {t('downloadAllBooks') || 'Download book summaries'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900 text-sm md:text-base">{t('bookmarks') || 'Bookmarks:'}</span>
                <span className="text-gray-600 text-sm md:text-base"> {t('saveYourFavoriteBooks') || 'Save your favorite books'}</span>
              </div>
            </div>
          </div>

          {/* Sign-in buttons */}
          <div className="space-y-3 md:space-y-4">
            <button
              onClick={handleSignUp}
              className="group relative w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-lg transition-all duration-300 font-semibold text-gray-700 text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="relative z-10">{t('signInWithGoogle') || 'Sign in with Google'}</span>
            </button>

            <button
              onClick={handleSignUp}
              className="group relative w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:shadow-xl hover:shadow-orange-500/30"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <svg className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="relative z-10">{t('signInWithEmail') || 'Sign in with email'}</span>
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-4 md:mt-6 flex items-center justify-center space-x-2 text-xs md:text-sm">
            <div className="flex items-center">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">{t('readersCount') || '5,000+'}</span>
            <span className="text-gray-600">{t('readers') || 'readers'}</span>
          </div>

          {/* Already have account */}
          <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600">
            {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
            <button
              onClick={handleLogin}
              className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {t('login') || 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPromptModal;
```

## ReadingProgressBar

- File: `components/ReadingProgressBar.tsx`
- Description: Fixed top-of-viewport progress indicator for long-form reading.
- Key props: None

```tsx
import React, { useState, useEffect } from 'react';

const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', calculateProgress);
    // Initial calculation
    calculateProgress();

    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-1 z-50"
      style={{ backgroundColor: 'rgba(36, 76, 71, 0.12)' }}
    >
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: '#FF7F50',
        }}
      />
    </div>
  );
};

export default ReadingProgressBar;
```

## Command family (dormant/incomplete)

- File: `components/ui/command.tsx`
- Description: Command-palette primitives modeled after shadcn/ui; currently unreferenced and not build-ready because `./dialog`, `cmdk`, and `@radix-ui/react-dialog` are absent.
- Key props: Forwarded cmdk/Radix props

```tsx
import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { Dialog, DialogContent } from "./dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-900 ${className || ''}`}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className || ''}`}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={`overflow-hidden p-1 text-gray-900 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 ${className || ''}`}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={`-mx-1 h-px bg-gray-200 ${className || ''}`}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={`relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ''}`}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`ml-auto text-xs tracking-widest text-gray-500 ${className || ''}`}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
}
```


