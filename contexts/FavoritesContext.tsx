import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { arrayRemove, arrayUnion, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { UserScopedRealtimeStore, type UserIdentityToken } from './userScopedRealtime';
import { OptimisticFavoritesState } from './favoritesState';
import { getBrowserStorage, safeReadItem, safeRemoveItem } from './userScopedPersistence';

interface FavoritesContextType {
  favorites: string[];
  error: string | null;
  isUserDataReady: boolean;
  refreshFavorites: () => void;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (bookId: string) => void;
}

interface FavoritesState {
  favorites: string[];
  error: string | null;
  ready: boolean;
}

const emptyFavoritesState = (): FavoritesState => ({ favorites: [], error: null, ready: false });
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const scopedStore = useRef(new UserScopedRealtimeStore<FavoritesState>(emptyFavoritesState)).current;
  const optimisticState = useRef(new OptimisticFavoritesState()).current;

  // Reset before React renders children for a new UID or logout.
  if (scopedStore.observe(currentUserId)) optimisticState.reset();
  const [, forceRender] = useState(0);
  const [retryRevision, setRetryRevision] = useState(0);
  const exposedState = scopedStore.getExposedState(currentUserId);

  const publish = (token: UserIdentityToken, nextState: FavoritesState) => {
    if (!scopedStore.publish(token, nextState)) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  const readLegacyFavorites = (storageKey: string): string[] => {
    const storedFavorites = safeReadItem(getBrowserStorage(), storageKey);
    if (!storedFavorites) return [];

    try {
      const parsed = JSON.parse(storedFavorites);
      return Array.isArray(parsed)
        ? parsed.filter((bookId): bookId is string => typeof bookId === 'string')
        : [];
    } catch (error) {
      console.error('Failed to parse legacy favorites:', error);
      return [];
    }
  };

  const uniqueFavorites = (bookIds: string[]) => (
    Array.from(new Set(bookIds.filter((bookId) => typeof bookId === 'string' && bookId.length > 0)))
  );

  useEffect(() => {
    scopedStore.activate(currentUserId);
    const capturedUserId = currentUserId;
    const token = scopedStore.capture(capturedUserId);
    if (!token || !user) return () => undefined;

    publish(token, {
      ...scopedStore.getExposedState(capturedUserId),
      error: null,
      ready: false,
    });

    const legacyStorageKey = `favorites_${user.email}`;
    const legacyFavorites = readLegacyFavorites(legacyStorageKey);
    const favoritesRef = doc(db, 'favorites', token.userId);

    const dispose = scopedStore.subscribe(
      token.userId,
      (_subscriptionToken, onValue, onError) => onSnapshot(favoritesRef, onValue, onError),
      (snapshot: any, snapshotToken) => {
        const data = snapshot.data();
        const remoteFavorites = Array.isArray(data?.bookIds)
          ? data.bookIds.filter((bookId): bookId is string => typeof bookId === 'string')
          : [];
        const mergedFavorites = uniqueFavorites([...remoteFavorites, ...legacyFavorites]);

        const rebasedFavorites = optimisticState.setRemote(mergedFavorites);
        publish(snapshotToken, { favorites: rebasedFavorites, error: null, ready: true });

        if (legacyFavorites.length > 0 && mergedFavorites.length !== remoteFavorites.length) {
          if (!scopedStore.isCurrent(snapshotToken)) return;
          void setDoc(favoritesRef, {
            bookIds: mergedFavorites,
            updatedAt: serverTimestamp(),
          }, { merge: true })
            .then(() => {
              if (scopedStore.isCurrent(snapshotToken)) {
                safeRemoveItem(getBrowserStorage(), legacyStorageKey);
              }
            })
            .catch((error) => {
              console.error('Failed to migrate legacy favorites:', error);
            });
        }
      },
      (error, errorToken) => {
        console.error('Failed to load favorites:', error);
        const visibleFavorites = scopedStore.getExposedState(errorToken.userId).favorites;
        const legacyFallback = optimisticState.setRemote(legacyFavorites);
        const preservedFavorites = optimisticState.setRemote(uniqueFavorites([...visibleFavorites, ...legacyFallback]));
        publish(errorToken, {
          favorites: preservedFavorites,
          error: "We couldn't load your saved books. Your saved books on this device are still available.",
          ready: true,
        });
      },
    );

    return dispose;
  }, [currentUserId, retryRevision, user?.email]);

  useEffect(() => () => {
    scopedStore.destroy();
  }, [scopedStore]);

  const addFavorite = (bookId: string) => {
    const token = scopedStore.capture(currentUserId);
    if (!token) return;
    const currentFavorites = scopedStore.getExposedState(token.userId).favorites;
    if (currentFavorites.includes(bookId)) return;

    const mutation = optimisticState.begin(bookId, true);
    if (!scopedStore.update(token, (state) => ({
      favorites: mutation.state,
      error: null,
      ready: state.ready,
    }))) return;
    forceRender((revision) => revision + 1);

    const favoritesRef = doc(db, 'favorites', token.userId);
    if (!scopedStore.isCurrent(token)) return;
    void setDoc(favoritesRef, {
      bookIds: arrayUnion(bookId),
      updatedAt: serverTimestamp(),
    }, { merge: true }).then(() => {
      if (!scopedStore.isCurrent(token)) return;
      const rebasedFavorites = optimisticState.resolve(mutation.token, true);
      scopedStore.publish(token, {
        favorites: rebasedFavorites,
        error: null,
        ready: scopedStore.getExposedState(token.userId).ready,
      });
      forceRender((revision) => revision + 1);
    }, (error) => {
      console.error('Failed to add favorite:', error);
      if (!scopedStore.isCurrent(token)) return;
      const rebasedFavorites = optimisticState.resolve(mutation.token, false);
      scopedStore.publish(token, {
        favorites: rebasedFavorites,
        error: null,
        ready: scopedStore.getExposedState(token.userId).ready,
      });
      forceRender((revision) => revision + 1);
    });
  };

  const removeFavorite = (bookId: string) => {
    const token = scopedStore.capture(currentUserId);
    if (!token) return;
    const currentFavorites = scopedStore.getExposedState(token.userId).favorites;
    if (!currentFavorites.includes(bookId)) return;

    const mutation = optimisticState.begin(bookId, false);
    if (!scopedStore.update(token, (state) => ({
      favorites: mutation.state,
      error: null,
      ready: state.ready,
    }))) return;
    forceRender((revision) => revision + 1);

    const favoritesRef = doc(db, 'favorites', token.userId);
    if (!scopedStore.isCurrent(token)) return;
    void setDoc(favoritesRef, {
      bookIds: arrayRemove(bookId),
      updatedAt: serverTimestamp(),
    }, { merge: true }).then(() => {
      if (!scopedStore.isCurrent(token)) return;
      const rebasedFavorites = optimisticState.resolve(mutation.token, true);
      scopedStore.publish(token, {
        favorites: rebasedFavorites,
        error: null,
        ready: scopedStore.getExposedState(token.userId).ready,
      });
      forceRender((revision) => revision + 1);
    }, (error) => {
      console.error('Failed to remove favorite:', error);
      if (!scopedStore.isCurrent(token)) return;
      const rebasedFavorites = optimisticState.resolve(mutation.token, false);
      scopedStore.publish(token, {
        favorites: rebasedFavorites,
        error: null,
        ready: scopedStore.getExposedState(token.userId).ready,
      });
      forceRender((revision) => revision + 1);
    });
  };

  const favorites = currentUserId ? exposedState.favorites : [];
  const error = currentUserId ? exposedState.error : null;
  const isUserDataReady = Boolean(currentUserId && exposedState.ready);
  const refreshFavorites = () => setRetryRevision((revision) => revision + 1);
  const isFavorite = (bookId: string): boolean => favorites.includes(bookId);

  const toggleFavorite = (bookId: string) => {
    if (isFavorite(bookId)) removeFavorite(bookId);
    else addFavorite(bookId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, error, isUserDataReady, refreshFavorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
