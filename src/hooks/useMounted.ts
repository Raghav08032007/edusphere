'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * useMounted hook using useSyncExternalStore (React 18 & 19 recommended pattern).
 * Returns false on the server and true on the client without cascading effect renders.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
