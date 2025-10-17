import React from 'react';
import { Link } from 'react-router-dom';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  link: string;
}

const games: Game[] = [
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Try this numbers game, minus the math.',
    icon: '🔢',
    color: 'from-yellow-400 to-orange-600',
    link: '/games/sudoku'
  },
  {
    id: 'spelling-bee',
    title: 'Spelling Bee',
    description: 'How many words can you make with 7 letters?',
    icon: '🐝',
    color: 'from-yellow-400 to-yellow-600',
    link: '/games/spelling-bee'
  },
  {
    id: 'strands',
    title: 'Strands',
    description: 'Find hidden words and uncover the theme.',
    icon: '🔤',
    color: 'from-green-400 to-teal-600',
    link: '/games/strands'
  },
  {
    id: 'reading-challenge',
    title: 'Reading Challenge',
    description: 'Set and track your reading goals.',
    icon: '📚',
    color: 'from-blue-400 to-blue-600',
    link: '/reading-challenge'
  },
  {
    id: 'book-trivia',
    title: 'Book Trivia',
    description: 'Test your knowledge with book quizzes.',
    icon: '🎯',
    color: 'from-purple-400 to-purple-600',
    link: '/games/book-trivia'
  },
  {
    id: 'author-quiz',
    title: 'Author Quiz',
    description: 'Guess the author from book descriptions.',
    icon: '✍️',
    color: 'from-indigo-400 to-indigo-600',
    link: '/games/author-quiz'
  }
];

const Games: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 inline-block relative">
            <span className="relative z-10">Games</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-300 -skew-y-1 opacity-70"></span>
          </h2>
          <p className="text-lg text-gray-600">
            Engage your mind with fun reading activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.link}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-6xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {game.icon}
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300">
                  {game.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {game.description}
                </p>

                {/* Play Arrow */}
                <div className="mt-6 flex items-center text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
                  <span className="text-sm font-semibold mr-2">Play Now</span>
                  <svg 
                    className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div className={`h-1 bg-gradient-to-r ${game.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to support us?
          </p>
          <a
            href="https://ko-fi.com/ta7leel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white font-bold py-3 px-8 rounded-full hover:from-orange-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Buy me a Coffee ☕
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Games;
