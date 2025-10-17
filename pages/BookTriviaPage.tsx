import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  book: string;
}

const triviaQuestions: Question[] = [
  {
    id: 1,
    question: "In 'Atomic Habits', what does James Clear say is the compound effect of 1% improvement every day for a year?",
    options: ["37 times better", "365 times better", "100 times better", "50 times better"],
    correctAnswer: 0,
    explanation: "If you get 1% better each day for one year, you'll end up 37 times better by the time you're done.",
    book: "Atomic Habits"
  },
  {
    id: 2,
    question: "What is the main lesson from 'Rich Dad Poor Dad'?",
    options: [
      "Save more money",
      "Assets put money in your pocket, liabilities take money out",
      "Work harder for more income",
      "Invest only in stocks"
    ],
    correctAnswer: 1,
    explanation: "Robert Kiyosaki emphasizes understanding the difference between assets and liabilities as the foundation of wealth building.",
    book: "Rich Dad Poor Dad"
  },
  {
    id: 3,
    question: "According to 'The Psychology of Money', what is more important than intelligence when it comes to financial success?",
    options: ["Education", "Behavior", "Starting capital", "Market timing"],
    correctAnswer: 1,
    explanation: "Morgan Housel argues that behavior and psychology are more important than intelligence when it comes to money.",
    book: "The Psychology of Money"
  },
  {
    id: 4,
    question: "In 'Think and Grow Rich', what does Napoleon Hill identify as the starting point of all achievement?",
    options: ["Hard work", "Desire", "Capital", "Education"],
    correctAnswer: 1,
    explanation: "Napoleon Hill states that desire is the starting point of all achievement - a burning desire backed by faith.",
    book: "Think and Grow Rich"
  },
  {
    id: 5,
    question: "What is the main principle in 'The Subtle Art of Not Giving a F*ck'?",
    options: [
      "Don't care about anything",
      "Choose what to care about carefully",
      "Be positive all the time",
      "Avoid all problems"
    ],
    correctAnswer: 1,
    explanation: "Mark Manson teaches that we should be selective about what we give our energy and attention to.",
    book: "The Subtle Art of Not Giving a F*ck"
  }
];

const BookTriviaPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);

  useSEO({
    title: 'Book Trivia - Test Your Knowledge | BookBriefs',
    description: 'Challenge yourself with our book trivia game. Test your knowledge of popular books and learn key insights.',
    keywords: 'book trivia, book quiz, reading game, book knowledge test',
    type: 'website',
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === triviaQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
  };

  const handleNext = () => {
    if (currentQuestion < triviaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
    setIsGameComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage === 100) return "Perfect! You're a book expert! 🏆";
    if (percentage >= 80) return "Excellent work! You know your books! 🌟";
    if (percentage >= 60) return "Good job! Keep reading! 📚";
    if (percentage >= 40) return "Not bad! Time to read more! 📖";
    return "Keep learning! Every book teaches something new! 💡";
  };

  if (isGameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quiz Complete!
            </h1>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
              {score}/{triviaQuestions.length}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              {getScoreMessage()}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
              <Link
                to="/"
                className="bg-gray-200 text-gray-800 font-bold py-4 px-8 rounded-full hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
              >
                Back to Home
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4">Want to learn more about these books?</p>
              <Link
                to="/summaries"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Browse Book Summaries
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = triviaQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl">🎯</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Book Trivia
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Test your knowledge of popular books
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {triviaQuestions.length}</span>
            <span>Score: {score}/{answeredQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / triviaQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Book Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {question.book}
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = showExplanation;

              let buttonClasses = "w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform ";
              
              if (!showResult) {
                buttonClasses += isSelected
                  ? "border-purple-500 bg-purple-50 shadow-lg"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md";
              } else {
                if (isCorrect) {
                  buttonClasses += "border-green-500 bg-green-50 shadow-lg";
                } else if (isSelected && !isCorrect) {
                  buttonClasses += "border-red-500 bg-red-50 shadow-lg";
                } else {
                  buttonClasses += "border-gray-200 bg-gray-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={buttonClasses}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{option}</span>
                    {showResult && (
                      <span className="text-2xl">
                        {isCorrect ? "✅" : (isSelected ? "❌" : "")}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Explanation</h3>
                  <p className="text-gray-700">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        {showExplanation && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-12 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {currentQuestion < triviaQuestions.length - 1 ? "Next Question" : "See Results"}
              <span className="ml-2">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTriviaPage;
