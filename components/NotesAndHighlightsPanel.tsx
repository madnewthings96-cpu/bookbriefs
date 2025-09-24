import React, { useState } from 'react';
import { PersonalNote, Highlight } from '../types';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NotesAndHighlightsPanelProps {
  bookId: string;
}

const NotesAndHighlightsPanel: React.FC<NotesAndHighlightsPanelProps> = ({ bookId }) => {
  const { user } = useAuth();
  const { getNotesForBook, getHighlightsForBook, deleteNote, deleteHighlight } = usePersonalNotes();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'notes' | 'highlights'>('notes');

  const notes = getNotesForBook(bookId);
  const highlights = getHighlightsForBook(bookId);

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm(t('confirmDeleteNote') || 'Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const handleDeleteHighlight = (highlightId: string) => {
    if (window.confirm(t('confirmDeleteHighlight') || 'Are you sure you want to delete this highlight?')) {
      deleteHighlight(highlightId);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          {t('loginToAddNotes') || 'Please log in to add personal notes and highlights.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('notes') || 'Notes'} ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'highlights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('highlights') || 'Highlights'} ({highlights.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'notes' ? (
          <div>
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-gray-500 mb-4">
                  {t('noNotesYet') || 'No personal notes yet.'}
                </p>
                <p className="text-sm text-gray-400">
                  {t('addNotesHint') || 'Add notes while reading to capture your thoughts and insights.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="ml-2 text-red-500 hover:text-red-700 p-1"
                        title={t('deleteNote') || 'Delete note'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('created') || 'Created'}: {note.createdAt.toLocaleDateString()}
                      {note.updatedAt.getTime() !== note.createdAt.getTime() &&
                        ` • ${t('updated') || 'Updated'}: ${note.updatedAt.toLocaleDateString()}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {highlights.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
                </svg>
                <p className="text-gray-500 mb-4">
                  {t('noHighlightsYet') || 'No highlights yet.'}
                </p>
                <p className="text-sm text-gray-400">
                  {t('highlightTextHint') || 'Highlight important text while reading to save key passages.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <blockquote className="text-gray-800 italic">
                          "{highlight.text}"
                        </blockquote>
                        {highlight.context && (
                          <p className="text-sm text-gray-600 mt-2">
                            {highlight.context}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteHighlight(highlight.id)}
                        className="ml-2 text-red-500 hover:text-red-700 p-1"
                        title={t('deleteHighlight') || 'Delete highlight'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('created') || 'Created'}: {highlight.createdAt.toLocaleDateString()}
                      {highlight.updatedAt.getTime() !== highlight.createdAt.getTime() &&
                        ` • ${t('updated') || 'Updated'}: ${highlight.updatedAt.toLocaleDateString()}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesAndHighlightsPanel;
