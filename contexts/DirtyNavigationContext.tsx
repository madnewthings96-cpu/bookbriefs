import React, { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';

export const DIRTY_NAVIGATION_MESSAGE = 'Leave without saving your changes?';

type DirtySource = string | symbol;

export type DirtyNavigationRegistry = {
  setDirty(source: DirtySource, dirty: boolean): void;
  isDirty(): boolean;
  confirmNavigation(confirmLeave?: (message: string) => boolean): boolean;
};

export function createDirtyNavigationRegistry(): DirtyNavigationRegistry {
  const dirtySources = new Set<DirtySource>();
  return {
    setDirty(source, dirty) {
      if (dirty) dirtySources.add(source);
      else dirtySources.delete(source);
    },
    isDirty() {
      return dirtySources.size > 0;
    },
    confirmNavigation(confirmLeave = (message) => window.confirm(message)) {
      return dirtySources.size === 0 || confirmLeave(DIRTY_NAVIGATION_MESSAGE);
    },
  };
}

type DirtyNavigationContextValue = Pick<DirtyNavigationRegistry, 'setDirty' | 'confirmNavigation'>;

const cleanNavigationContext: DirtyNavigationContextValue = {
  setDirty: () => undefined,
  confirmNavigation: () => true,
};

const DirtyNavigationContext = createContext<DirtyNavigationContextValue>(cleanNavigationContext);

export function DirtyNavigationProvider({ children }: { children: ReactNode }) {
  const registryRef = useRef<DirtyNavigationRegistry>();
  if (!registryRef.current) registryRef.current = createDirtyNavigationRegistry();
  const registry = registryRef.current;
  const value = useMemo<DirtyNavigationContextValue>(() => ({
    setDirty: registry.setDirty,
    confirmNavigation: registry.confirmNavigation,
  }), [registry]);

  return (
    <DirtyNavigationContext.Provider value={value}>
      {children}
    </DirtyNavigationContext.Provider>
  );
}

export function useDirtyNavigation(): DirtyNavigationContextValue {
  return useContext(DirtyNavigationContext);
}

export function runGuardedNavigation(confirmNavigation: () => boolean, action: () => void): boolean {
  if (!confirmNavigation()) return false;
  action();
  return true;
}
