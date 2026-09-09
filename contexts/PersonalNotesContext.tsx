import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { PersonalNote, Highlight, PersonalNotesData } from '../types';
import { useAuth } from './AuthContext';
import {
  emptyPersonalNotesData,
  getBrowserStorage,
  readPersonalNotes,
  safeWriteItem,
  UserScopedIdentity,
} from './userScopedPersistence';

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
  const currentUserId = user?.id ?? null;
  const identity = useRef(new UserScopedIdentity());
  // Mark identity changes during render so old notes are never exposed while
  // the new user's local record is being hydrated.
  identity.current.observe(currentUserId);

  const [personalNotesData, setPersonalNotesData] = useState<PersonalNotesData>(() => emptyPersonalNotesData());

  useEffect(() => {
    let cancelled = false;
    const capturedUserId = currentUserId;
    const storage = getBrowserStorage();

    setPersonalNotesData(emptyPersonalNotesData());

    if (!capturedUserId) return () => { cancelled = true; };

    void identity.current.hydrate(capturedUserId, (userId) => readPersonalNotes(storage, userId))
      .then((loaded) => {
        if (cancelled || loaded === undefined || !identity.current.isReady(capturedUserId)) return;
        setPersonalNotesData(loaded);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const canWrite = (capturedUserId: string | null) => (
    capturedUserId !== null && identity.current.canWrite(capturedUserId)
  );

  useEffect(() => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    safeWriteItem(
      getBrowserStorage(),
      `bookbriefs_personal_notes_${capturedUserId}`,
      JSON.stringify(personalNotesData),
    );
  }, [currentUserId, personalNotesData]);

  const addNote = (bookId: string, content: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    const now = new Date();
    const newNote: PersonalNote = {
      id: Date.now().toString(),
      bookId,
      content,
      createdAt: now,
      updatedAt: now,
    };

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return { ...prev, notes: [...prev.notes, newNote] };
    });
  };

  const updateNote = (noteId: string, content: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return {
        ...prev,
        notes: prev.notes.map(note =>
          note.id === noteId
            ? { ...note, content, updatedAt: new Date() }
            : note
        ),
      };
    });
  };

  const deleteNote = (noteId: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return { ...prev, notes: prev.notes.filter(note => note.id !== noteId) };
    });
  };

  const addHighlight = (bookId: string, text: string, context?: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    const now = new Date();
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      bookId,
      text,
      context,
      createdAt: now,
      updatedAt: now,
    };

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return { ...prev, highlights: [...prev.highlights, newHighlight] };
    });
  };

  const updateHighlight = (highlightId: string, text: string, context?: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return {
        ...prev,
        highlights: prev.highlights.map(highlight =>
          highlight.id === highlightId
            ? { ...highlight, text, context, updatedAt: new Date() }
            : highlight
        ),
      };
    });
  };

  const deleteHighlight = (highlightId: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    setPersonalNotesData(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return { ...prev, highlights: prev.highlights.filter(highlight => highlight.id !== highlightId) };
    });
  };

  const exposedData = identity.current.isReady(currentUserId)
    ? personalNotesData
    : emptyPersonalNotesData();

  const getNotesForBook = (bookId: string): PersonalNote[] => {
    return exposedData.notes.filter(note => note.bookId === bookId);
  };

  const getHighlightsForBook = (bookId: string): Highlight[] => {
    return exposedData.highlights.filter(highlight => highlight.bookId === bookId);
  };

  const value: PersonalNotesContextType = {
    personalNotesData: exposedData,
    addNote,
    updateNote,
    deleteNote,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    getNotesForBook,
    getHighlightsForBook,
  };

  return (
    <PersonalNotesContext.Provider value={value}>
      {children}
    </PersonalNotesContext.Provider>
  );
};
