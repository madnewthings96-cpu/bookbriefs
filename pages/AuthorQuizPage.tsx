import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

interface QuizQuestion {
  id: number;
  bookDescription: string;
  bookTitle: string;
  correctAuthor: string;
  options: string[];
  imageUrl?: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    bookDescription: "A groundbreaking book about building good habits and breaking bad ones, focusing on the compound effect of small improvements.",
    bookTitle: "Atomic Habits",
    correctAuthor: "James Clear",
    options: ["James Clear", "Charles Duhigg", "BJ Fogg", "Stephen Covey"]
  },
  {
    id: 2,
    bookDescription: "A classic that teaches financial literacy through the story of two father figures with different approaches to money.",
    bookTitle: "Rich Dad Poor Dad",
    correctAuthor: "Robert Kiyosaki",
    options: ["Robert Kiyosaki", "Dave Ramsey", "Tony Robbins", "Suze Orman"]
  },
  {
    id: 3,
    bookDescription: "A collection of 19 short stories exploring how people think about money and the psychology behind financial decisions.",
    bookTitle: "The Psychology of Money",
    correctAuthor: "Morgan Housel",
    options: ["Morgan Housel", "Daniel Kahneman", "Nassim Taleb", "Ray Dalio"]
  },
  {
    id: 4,
    bookDescription: "A philosophy book disguised as a self-help guide, teaching that life's struggles give it meaning.",
    bookTitle: "The Subtle Art of Not Giving a F*ck",
    correctAuthor: "Mark Manson",
    options: ["Mark Manson", "Ryan Holiday", "Tim Ferriss", "Gary Vaynerchuk"]
  },
  {
    id: 5,
    bookDescription: "An allegory about a shepherd's journey to find treasure, teaching about following one's personal legend.",
    bookTitle: "The Alchemist",
    correctAuthor: "Paulo Coelho",
    options: ["Paulo Coelho", "Gabriel García Márquez", "Jorge Luis Borges", "Isabel Allende"]
  },
  {
    id: 6,
    bookDescription: "A comprehensive look at human history from the Stone Age to the modern era, exploring how Homo sapiens came to dominate.",
    bookTitle: "Sapiens",
    correctAuthor: "Yuval Noah Harari",
    options: ["Yuval Noah Harari", "Jared Diamond", "Steven Pinker", "Niall Ferguson"]
  },
  {
    id: 7,
    bookDescription: "The classic guide to value investing, teaching investors to think long-term and analyze stocks fundamentally.",
    bookTitle: "The Intelligent Investor",
    correctAuthor: "Benjamin Graham",
    options: ["Benjamin Graham", "Warren Buffett", "Peter Lynch", "Philip Fisher"]
  },
  {
    id: 8,
    bookDescription: "A transformative book about developing mental toughness through the author's experiences as a Navy SEAL.",
    bookTitle: "Can't Hurt Me",
    correctAuthor: "David Goggins",
    options: ["David Goggins", "Jocko Willink", "Marcus Luttrell", "Chris Kyle"]
  },
  {
    id: 9,
    bookDescription: "A guide to understanding human behavior, manipulation, and the hidden forces that drive our actions.",
    bookTitle: "The Laws of Human Nature",
    correctAuthor: "Robert Greene",
    options: ["Robert Greene", "Dale Carnegie", "Cialdini", "Malcolm Gladwell"]
  },
  {
    id: 10,
    bookDescription: "A psychological exploration of the two systems that drive the way we think: fast, intuitive thinking and slow, deliberate thinking.",
    bookTitle: "Thinking, Fast and Slow",
    correctAuthor: "Daniel Kahneman",
    options: ["Daniel Kahneman", "Amos Tversky", "Richard Thaler", "Dan Ariely"]
  }
];

const AuthorQuizPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useSEO({
    title: 'Author Quiz - Test Your Knowledge | BookBriefs',
    description: 'Guess the author from book descriptions. Test your knowledge of popular books and their authors.',
    keywords: 'author quiz, book quiz, reading game, author knowledge test',
    type: 'website',
  });

  const handleAnswerSelect = (author: string) => {
    if (showResult) return;
    
    setSelectedAnswer(author);
    setShowResult(true);
    
    if (author === quizQuestions[currentQuestion].correctAuthor) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    setIsComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage === 100) return "Perfect! You're a literary genius! 📚✨";
    if (percentage >= 80) return "Excellent! You know your authors! 🌟";
    if (percentage >= 60) return "Good job! Keep reading! 📖";
    if (percentage >= 40) return "Not bad! Time to explore more books! 📕";
    return "Keep learning! Every book is a new adventure! 💡";
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quiz Complete!
            </h1>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
              {score}/{quizQuestions.length}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              {getScoreMessage()}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 px-8 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
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

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
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
            <div className="text-5xl">✍️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Author Quiz
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Guess the author from the book description
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>Score: {score}/{answeredQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Book Title Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {question.bookTitle}
          </div>

          {/* Description */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
            "{question.bookDescription}"
          </h2>

          <p className="text-lg font-bold text-gray-900 mb-6">
            Who wrote this book?
          </p>

          {/* Answer Options */}
          <div className="space-y-4">
            {question.options.map((author, index) => {
              const isSelected = selectedAnswer === author;
              const isCorrect = author === question.correctAuthor;
              const showResultForOption = showResult;

              let buttonClasses = "w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform ";
              
              if (!showResultForOption) {
                buttonClasses += isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-lg"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md";
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
                  onClick={() => handleAnswerSelect(author)}
                  disabled={showResult}
                  className={buttonClasses}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{author}</span>
                    {showResultForOption && (
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
          {showResult && (
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {selectedAnswer === question.correctAuthor ? "🎉" : "💡"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {selectedAnswer === question.correctAuthor ? "Correct!" : "Incorrect"}
                  </h3>
                  <p className="text-gray-700">
                    "{question.bookTitle}" was written by <strong>{question.correctAuthor}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        {showResult && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 px-12 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "See Results"}
              <span className="ml-2">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorQuizPage;
