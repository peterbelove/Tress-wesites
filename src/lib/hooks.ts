"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Reactive matchMedia — no synchronous setState in an effect. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether the user's connection has a data-saver enabled. */
export function useSaveData(): boolean {
  type Conn = { connection?: { saveData?: boolean; addEventListener?: (t: string, cb: () => void) => void; removeEventListener?: (t: string, cb: () => void) => void } };
  const subscribe = useCallback((cb: () => void) => {
    const conn = (navigator as unknown as Conn).connection;
    conn?.addEventListener?.("change", cb);
    return () => conn?.removeEventListener?.("change", cb);
  }, []);
  const getSnapshot = useCallback(
    () => Boolean((navigator as unknown as Conn).connection?.saveData),
    [],
  );
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
