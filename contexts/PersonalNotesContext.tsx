import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { PersonalNote, Highlight, PersonalNotesData } from '../types';
import { useAuth } from './AuthContext';
import {
  emptyPersonalNotesData,
  getBrowserStorage,
  readPersonalNotes,
  safeWriteItem,
  UserScopedStore,
} from './userScopedPersistence';

interface PersonalNotesContextType {
  personalNotesData: PersonalNotesData;
  isUserDataReady: boolean;
  addNote: (bookId: string, content: string) => boolean;
  updateNote: (noteId: string, content: string) => boolean;
  deleteNote: (noteId: string) => boolean;
  addHighlight: (bookId: string, text: string, context?: string) => boolean;
  updateHighlight: (highlightId: string, text: string, context?: string) => boolean;
  deleteHighlight: (highlightId: string) => boolean;
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
  const scopedStore = useRef(new UserScopedStore(emptyPersonalNotesData));
  // Mark identity changes during render so old notes are never exposed while
  // the new user's local record is being hydrated.
  scopedStore.current.observe(currentUserId);
  const [storeRevision, forceRender] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const capturedUserId = currentUserId;
    const storage = getBrowserStorage();

    if (!capturedUserId) return () => { cancelled = true; };

    void scopedStore.current.hydrate(capturedUserId, (userId) => readPersonalNotes(storage, userId))
      .then((loaded) => {
        if (cancelled || loaded === undefined || !scopedStore.current.canWrite(capturedUserId)) return;
        forceRender((revision) => revision + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  useEffect(() => {
    const capturedUserId = currentUserId;
    scopedStore.current.persist(capturedUserId, (persisted) => {
      safeWriteItem(
        getBrowserStorage(),
        `bookbriefs_personal_notes_${capturedUserId}`,
        JSON.stringify(persisted),
      );
    });
  }, [currentUserId, storeRevision]);

  const addNote = (bookId: string, content: string): boolean => {
    const capturedUserId = currentUserId;
    const now = new Date();
    const newNote: PersonalNote = {
      id: Date.now().toString(),
      bookId,
      content,
      createdAt: now,
      updatedAt: now,
    };

    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      notes: [...state.notes, newNote],
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const updateNote = (noteId: string, content: string): boolean => {
    const capturedUserId = currentUserId;
    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      notes: state.notes.map(note =>
        note.id === noteId
          ? { ...note, content, updatedAt: new Date() }
          : note
      ),
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const deleteNote = (noteId: string): boolean => {
    const capturedUserId = currentUserId;
    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      notes: state.notes.filter(note => note.id !== noteId),
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const addHighlight = (bookId: string, text: string, context?: string): boolean => {
    const capturedUserId = currentUserId;
    const now = new Date();
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      bookId,
      text,
      context,
      createdAt: now,
      updatedAt: now,
    };

    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      highlights: [...state.highlights, newHighlight],
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const updateHighlight = (highlightId: string, text: string, context?: string): boolean => {
    const capturedUserId = currentUserId;
    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      highlights: state.highlights.map(highlight =>
        highlight.id === highlightId
          ? { ...highlight, text, context, updatedAt: new Date() }
          : highlight
      ),
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const deleteHighlight = (highlightId: string): boolean => {
    const capturedUserId = currentUserId;
    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      ...state,
      highlights: state.highlights.filter(highlight => highlight.id !== highlightId),
    }));
    if (!updated) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const exposedData = scopedStore.current.getExposedState(currentUserId);
  const isUserDataReady = scopedStore.current.canWrite(currentUserId);

  const getNotesForBook = (bookId: string): PersonalNote[] => {
    return exposedData.notes.filter(note => note.bookId === bookId);
  };

  const getHighlightsForBook = (bookId: string): Highlight[] => {
    return exposedData.highlights.filter(highlight => highlight.bookId === bookId);
  };

  const value: PersonalNotesContextType = {
    personalNotesData: exposedData,
    isUserDataReady,
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
