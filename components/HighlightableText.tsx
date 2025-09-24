import React, { useState, useRef, useEffect } from 'react';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HighlightableTextProps {
  bookId: string;
  children: React.ReactNode;
  className?: string;
}

const HighlightableText: React.FC<HighlightableTextProps> = ({
  bookId,
  children,
  className = ''
}) => {
  const { user } = useAuth();
  const { addHighlight, getHighlightsForBook } = usePersonalNotes();
  const { t } = useLanguage();
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const highlights = getHighlightsForBook(bookId);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowHighlightTooltip(false);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length === 0 || selectedText.length > 500) {
        setShowHighlightTooltip(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Check if selection is within our container
      if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
        setShowHighlightTooltip(false);
        return;
      }

      setSelectedText(selectedText);
      setSelectionRect(rect);
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowHighlightTooltip(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHighlightTooltip(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bookId]);

  const handleHighlight = () => {
    if (!selectedText || !user) return;

    // Get some context around the selected text
    const selection = window.getSelection();
    if (!selection || !containerRef.current) return;

    const range = selection.getRangeAt(0);
    const container = containerRef.current;

    // Get context (previous and next sentences)
    let context = '';
    try {
      const fullText = container.textContent || '';
      const start = Math.max(0, range.startOffset - 100);
      const end = Math.min(fullText.length, range.endOffset + 100);
      context = fullText.substring(start, end).trim();

      // Clean up context to remove the selected text itself
      context = context.replace(selectedText, '').trim();
      if (context.length > 200) {
        context = context.substring(0, 200) + '...';
      }
    } catch (error) {
      console.error('Error getting context:', error);
    }

    addHighlight(bookId, selectedText, context);
    setShowHighlightTooltip(false);
    window.getSelection()?.removeAllRanges();
  };

  const renderHighlightedContent = (content: React.ReactNode): React.ReactNode => {
    if (typeof content !== 'string') {
      return content;
    }

    let processedContent = content;
    const highlightsForBook = highlights.filter(h => h.text.length > 0);

    // Sort highlights by length (longest first) to avoid conflicts
    highlightsForBook.sort((a, b) => b.text.length - a.text.length);

    highlightsForBook.forEach((highlight) => {
      const regex = new RegExp(`(${highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedContent = processedContent.replace(regex, `<mark class="bg-yellow-200 px-1 rounded" title="Your highlight: ${highlight.createdAt.toLocaleDateString()}">$1</mark>`);
    });

    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {renderHighlightedContent(children)}

      {showHighlightTooltip && user && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onClick={handleHighlight}
            className="flex items-center space-x-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
            </svg>
            <span>{t('highlight') || 'Highlight'}</span>
          </button>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      )}

      {user && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {t('highlightTip') || 'Select any text above to highlight and save important passages for later reference.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighlightableText;
