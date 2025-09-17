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