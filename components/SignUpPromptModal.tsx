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
              className="group relative w-full flex items-center justify-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 font-semibold text-gray-700 text-sm md:text-base overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="relative z-10">{t('signInWithGoogle') || 'Sign in with Google'}</span>
            </button>

            <button
              onClick={handleSignUp}
              className="group relative w-full flex items-center justify-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-semibold text-white transition-all duration-300 text-sm md:text-base overflow-hidden hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:shadow-xl hover:shadow-orange-500/30"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
