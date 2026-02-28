import React, { useState } from 'react';
import { useReadingChallenge } from '../contexts/ReadingChallengeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';

const ReadingChallengePage: React.FC = () => {
  const { challenge, loading, setGoal, deleteGoal, progress, isBookRead, markBookAsRead, unmarkBookAsRead } = useReadingChallenge();
  const { isAuthenticated } = useAuth();
  const { books } = useBooks();
  const [goalInput, setGoalInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const handleSetGoal = async () => {
    const goal = parseInt(goalInput);
    if (!goal || goal <= 0 || goal > 1000) {
      setError('Please enter a valid goal between 1 and 1000');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setGoal(goal);
      setShowGoalModal(false);
      setGoalInput('');
      setError(null);
    } catch (err) {
      console.error('Error setting goal:', err);
      setError('Failed to set goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    setIsSubmitting(true);
    try {
      await deleteGoal();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readBooks = books.filter(book => isBookRead(book.id));
  const unreadBooks = books.filter(book => !isBookRead(book.id));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join the Reading Challenge!
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to set your reading goal and track your progress throughout the year.
          </p>
          <div className="space-y-3">
            <Link
              to="/signup"
              className="block w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-300"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" style={{ fontFamily: "'Lato', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {currentYear} Reading Challenge
          </h1>
          <p className="text-lg text-gray-600">
            Set a goal and track your reading journey
          </p>
        </div>

        {/* Challenge Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          {!challenge ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Want to read more? Set a goal!
              </h2>
              <p className="text-gray-600 mb-6">
                Join the challenge and set yourself a goal for how many books to read this year.
              </p>
              <button
                onClick={() => setShowGoalModal(true)}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Set a Goal
              </button>
            </div>
          ) : (
            <div>
              {/* Progress Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {progress.current} <span className="text-gray-400">/ {progress.goal}</span>
                    </h3>
                    <p className="text-gray-600">books read</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowGoalModal(true)}
                      className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-300 hover:border-orange-400 rounded-lg transition-colors duration-200"
                    >
                      Update Goal
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors duration-200"
                      title="Delete challenge"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                  {progress.percentage > 0 && (
                    <div
                      className="absolute top-0 h-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${progress.percentage}%` }}
                    >
                      {progress.percentage.toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Motivational Message */}
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    {progress.percentage === 0 && "🚀 Let's get started! Pick your first book."}
                    {progress.percentage > 0 && progress.percentage < 25 && "📚 Great start! Keep the momentum going."}
                    {progress.percentage >= 25 && progress.percentage < 50 && "🌟 You're making excellent progress!"}
                    {progress.percentage >= 50 && progress.percentage < 75 && "🔥 Halfway there! You're crushing it!"}
                    {progress.percentage >= 75 && progress.percentage < 100 && "⚡ Almost there! The finish line is in sight!"}
                    {progress.percentage >= 100 && "🎉 Congratulations! You've reached your goal! Consider setting a new one!"}
                  </p>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* First Book Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 1
                      ? 'border-blue-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 1
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 1 ? '📖' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">First Step</h4>
                    <p className="text-xs text-center text-gray-600">Read 1 book</p>
                    {progress.current >= 1 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Getting Started Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 3
                      ? 'border-purple-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 3
                        ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 3 ? '🌱' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Bookworm</h4>
                    <p className="text-xs text-center text-gray-600">Read 3 books</p>
                    {progress.current >= 3 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Dedicated Reader Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 5
                      ? 'border-green-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 5
                        ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 5 ? '📚' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Dedicated</h4>
                    <p className="text-xs text-center text-gray-600">Read 5 books</p>
                    {progress.current >= 5 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Rising Star Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 10
                      ? 'border-yellow-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 10
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 10 ? '⭐' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Rising Star</h4>
                    <p className="text-xs text-center text-gray-600">Read 10 books</p>
                    {progress.current >= 10 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Scholar Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 20
                      ? 'border-indigo-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 20
                        ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 20 ? '🎓' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Scholar</h4>
                    <p className="text-xs text-center text-gray-600">Read 20 books</p>
                    {progress.current >= 20 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Master Reader Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 50
                      ? 'border-orange-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 50
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 50 ? '🏆' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Master</h4>
                    <p className="text-xs text-center text-gray-600">Read 50 books</p>
                    {progress.current >= 50 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Centurion Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.current >= 100
                      ? 'border-pink-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.current >= 100
                        ? 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.current >= 100 ? '👑' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Centurion</h4>
                    <p className="text-xs text-center text-gray-600">Read 100 books</p>
                    {progress.current >= 100 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Goal Achieved Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.percentage >= 100
                      ? 'border-red-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.percentage >= 100
                        ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.percentage >= 100 ? '🎯' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Goal Crusher</h4>
                    <p className="text-xs text-center text-gray-600">Reach your goal</p>
                    {progress.percentage >= 100 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Early Bird Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.percentage >= 100 && new Date().getMonth() < 6
                      ? 'border-teal-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.percentage >= 100 && new Date().getMonth() < 6
                        ? 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.percentage >= 100 && new Date().getMonth() < 6 ? '🌅' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Early Bird</h4>
                    <p className="text-xs text-center text-gray-600">Goal by June</p>
                    {progress.percentage >= 100 && new Date().getMonth() < 6 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Overachiever Badge */}
                  <div className={`group relative bg-white rounded-xl p-4 border-2 transition-all duration-300 ${progress.percentage >= 150
                      ? 'border-cyan-400 shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 opacity-50'
                    }`}>
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${progress.percentage >= 150
                        ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg'
                        : 'bg-gray-100'
                      }`}>
                      {progress.percentage >= 150 ? '🚀' : '🔒'}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900 mb-1">Overachiever</h4>
                    <p className="text-xs text-center text-gray-600">150% of goal</p>
                    {progress.percentage >= 150 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Progress Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {[
                          progress.current >= 1 ? 1 : 0,
                          progress.current >= 3 ? 1 : 0,
                          progress.current >= 5 ? 1 : 0,
                          progress.current >= 10 ? 1 : 0,
                          progress.current >= 20 ? 1 : 0,
                          progress.current >= 50 ? 1 : 0,
                          progress.current >= 100 ? 1 : 0,
                          progress.percentage >= 100 ? 1 : 0,
                          (progress.percentage >= 100 && new Date().getMonth() < 6) ? 1 : 0,
                          progress.percentage >= 150 ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)} / 10 Badges Earned
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Keep reading to unlock more achievements!</p>
                    </div>
                    <div className="text-4xl">🏅</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Books Section */}
        {challenge && (
          <div className="space-y-8">
            {/* Books Read */}
            {readBooks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Books You've Read ({readBooks.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {readBooks.map((book) => {
                    const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;
                    return (
                      <div key={book.id} className="group relative">
                        <Link to={bookUrl}>
                          <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                            <img
                              src={book.coverImageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <button
                          onClick={() => unmarkBookAsRead(book.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-green-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                          title="Mark as unread"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Books */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Available Books to Read
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {unreadBooks.map((book) => {
                  const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;
                  return (
                    <div key={book.id} className="group relative">
                      <Link to={bookUrl}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <button
                        onClick={() => markBookAsRead(book.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white hover:bg-green-500 text-gray-400 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                        title="Mark as read"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {challenge ? 'Update Your Goal' : 'Set Your Reading Goal'}
            </h3>
            <p className="text-gray-600 mb-6">
              How many books do you want to read in {currentYear}?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <input
              type="number"
              value={goalInput}
              onChange={(e) => {
                setGoalInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  handleSetGoal();
                }
              }}
              placeholder={challenge ? challenge.goal.toString() : "e.g., 12"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-6"
              min="1"
              max="1000"
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setGoalInput('');
                  setError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSetGoal}
                disabled={!goalInput || parseInt(goalInput) <= 0 || isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {challenge ? 'Updating...' : 'Setting...'}
                  </>
                ) : (
                  challenge ? 'Update' : 'Set Goal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              Delete Reading Challenge?
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              This will permanently delete your {currentYear} reading challenge and all progress. This action cannot be undone.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Challenge'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingChallengePage;
