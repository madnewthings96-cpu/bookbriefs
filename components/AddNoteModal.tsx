import React, { useRef, useState } from 'react';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useModalDialog } from '../hooks/useModalDialog';
import { type ReadingSurface } from './readingRouteModel';

interface AddNoteModalProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  onSuccess?: () => void;
  surface?: ReadingSurface;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  bookId,
  isOpen,
  onClose,
  initialText = '',
  onSuccess,
  surface = 'public',
}) => {
  const { addNote } = usePersonalNotes();
  const { t } = useLanguage();
  const [noteContent, setNoteContent] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      addNote(bookId, noteContent.trim());
      setNoteContent('');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNoteContent(initialText);
    onClose();
  };

  const dialogRef = useModalDialog({ open: isOpen, onClose: handleClose, initialFocusRef: noteInputRef });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="add-note-modal-title" tabIndex={-1} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="add-note-modal-title" className="text-xl font-bold text-gray-900">
            {t('addPersonalNote') || 'Add Personal Note'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close add note dialog"
            className={`inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${surface === 'dashboard' ? 'h-11 w-11' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-2">
              {t('noteContent') || 'Note Content'}
            </label>
            <textarea
              ref={noteInputRef}
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={t('writeYourThoughts') || 'Write your thoughts, insights, or key takeaways from this book...'}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {t('noteHelpText') || 'Capture your personal insights, questions, or connections you make while reading.'}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className={`${surface === 'dashboard' ? 'min-h-11 ' : ''}px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors`}
              disabled={isSubmitting}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!noteContent.trim() || isSubmitting}
              className={`${surface === 'dashboard' ? 'min-h-11 ' : ''}px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('adding') || 'Adding...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('addNote') || 'Add Note'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
