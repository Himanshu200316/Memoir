"use client";

import { useEffect, useState } from "react";
import { loadState, saveState, storageKey } from "./storage";

/**
 * useState that hydrates from and persists to localStorage under `key`.
 * Renders with `fallback` on first paint (SSR-safe), then syncs from
 * storage on mount — same pattern as any client-only persisted state.
 *
 * Also listens for `storage` events so that changes made in another tab
 * (or another mounted instance of this hook) don't get silently clobbered
 * by this instance's own stale in-memory snapshot.
 */
export function useLocalState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (hydrated) saveState(key, state);
  }, [key, state, hydrated]);

  useEffect(() => {
    const fullKey = storageKey(key);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== fullKey) return;
      setState(loadState(key, fallback));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState] as const;
}
