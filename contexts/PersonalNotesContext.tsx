import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PersonalNote, Highlight, PersonalNotesData } from '../types';
import { useAuth } from './AuthContext';

interface PersonalNotesContextType {
  personalNotesData: PersonalNotesData;
  addNote: (bookId: string, content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  addHighlight: (bookId: string, text: string, context?: string) => void;
  updateHighlight: (highlightId: string, text: string, context?: string) => void;
  deleteHighlight: (highlightId: string) => void;
  getNotesForBook: (bookId: string) => PersonalNote[];
  getHighlightsForBook: (bookId: string) => Highlight[];
}

const PersonalNotesContext = createContext<PersonalNotesContextType | undefined>(undefined);

export const usePersonalNotes = () => {
  const context = useContext(PersonalNotesContext);
  if (context === undefined) {
    throw new Error('usePersonalNotes must be used within a PersonalNotesProvider');
  }
  return context;
};

interface PersonalNotesProviderProps {
  children: ReactNode;
}

export const PersonalNotesProvider: React.FC<PersonalNotesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [personalNotesData, setPersonalNotesData] = useState<PersonalNotesData>({
    notes: [],
    highlights: []
  });

  // Load data from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`bookbriefs_personal_notes_${user.id}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const notes = parsedData.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        const highlights = parsedData.highlights.map((highlight: any) => ({
          ...highlight,
          createdAt: new Date(highlight.createdAt),
          updatedAt: new Date(highlight.updatedAt)
        }));

        setPersonalNotesData({ notes, highlights });
      }
    }
  }, [user]);

  // Save data to localStorage whenever personalNotesData changes
  useEffect(() => {
    if (user && personalNotesData.notes.length > 0 || personalNotesData.highlights.length > 0) {
      localStorage.setItem(`bookbriefs_personal_notes_${user.id}`, JSON.stringify(personalNotesData));
    }
  }, [personalNotesData, user]);

  const addNote = (bookId: string, content: string) => {
    if (!user) return;

    const newNote: PersonalNote = {
      id: Date.now().toString(),
      bookId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPersonalNotesData(prev => ({
      ...prev,
      notes: [...prev.notes, newNote]
    }));
  };

  const updateNote = (noteId: string, content: string) => {
    setPersonalNotesData(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId
          ? { ...note, content, updatedAt: new Date() }
          : note
      )
    }));
  };

  const deleteNote = (noteId: string) => {
    setPersonalNotesData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }));
  };

  const addHighlight = (bookId: string, text: string, context?: string) => {
    if (!user) return;

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      bookId,
      text,
      context,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPersonalNotesData(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight]
    }));
  };

  const updateHighlight = (highlightId: string, text: string, context?: string) => {
    setPersonalNotesData(prev => ({
      ...prev,
      highlights: prev.highlights.map(highlight =>
        highlight.id === highlightId
          ? { ...highlight, text, context, updatedAt: new Date() }
          : highlight
      )
    }));
  };

  const deleteHighlight = (highlightId: string) => {
    setPersonalNotesData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(highlight => highlight.id !== highlightId)
    }));
  };

  const getNotesForBook = (bookId: string): PersonalNote[] => {
    return personalNotesData.notes.filter(note => note.bookId === bookId);
  };

  const getHighlightsForBook = (bookId: string): Highlight[] => {
    return personalNotesData.highlights.filter(highlight => highlight.bookId === bookId);
  };

  const value: PersonalNotesContextType = {
    personalNotesData,
    addNote,
    updateNote,
    deleteNote,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    getNotesForBook,
    getHighlightsForBook
  };

  return (
    <PersonalNotesContext.Provider value={value}>
      {children}
    </PersonalNotesContext.Provider>
  );
};
