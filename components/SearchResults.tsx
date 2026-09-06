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
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  return (
    <div
      className="absolute left-0 right-0 top-full z-[95] mt-2 max-h-96 overflow-y-auto rounded-[20px] bg-[#FBF8F1] p-1.5 text-[#123D2F] shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_4px_12px_rgba(9,37,28,0.08),0_22px_48px_rgba(9,37,28,0.16)]"
      aria-live="polite"
    >
      {isLoading ? (
        <div className="flex min-h-24 flex-col items-center justify-center p-4 text-[#65766D]" role="status">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#B9C7BE] border-t-[#123D2F]" />
          <p className="mt-2 text-xs font-semibold">Searching the shelves…</p>
        </div>
      ) : results.length > 0 ? (
        <ul className="grid gap-1">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => handleResultClick(result)}
                className="group min-h-14 w-full rounded-[14px] px-3 py-2.5 text-left outline-none transition-[background-color,transform] duration-150 hover:bg-[#F0EADF] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
              >
                <h4 className="font-['Bricolage_Grotesque'] text-sm font-semibold tracking-[-0.02em] text-[#09251C]">
                  {result.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-pretty text-[11px] leading-relaxed text-[#65766D]">
                  {result.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-24 flex-col items-center justify-center p-4 text-center" role="status">
          <p className="font-['Bricolage_Grotesque'] text-sm font-semibold text-[#123D2F]">No matching books</p>
          <p className="mt-1 text-[11px] text-[#596C62]">Try an author, title, or broader idea.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
