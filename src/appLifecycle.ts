import { App, type AppState } from '@capacitor/app';

type LifecycleHandler = (state: AppState) => void;
const handlers = new Set<LifecycleHandler>();

let initialized = false;
let listenerHandle: { remove: () => void } | null = null;

/** Initialize Capacitor app lifecycle listeners. Call once at app startup. */
export function initAppLifecycle(): () => void {
  if (initialized) return () => {};
  initialized = true;

  const handleStateChange = (state: AppState) => {
    handlers.forEach((h) => h(state));
  };

  App.addListener('appStateChange', handleStateChange).then((handle) => {
    listenerHandle = handle;
  });

  return () => {
    listenerHandle?.remove();
    listenerHandle = null;
    initialized = false;
  };
}

/** Subscribe to app state changes. Returns unsubscribe function. */
export function onAppStateChange(handler: LifecycleHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

/** Check if the app is currently in the foreground. */
export function isAppActive(): boolean {
  return document.visibilityState === 'visible';
}
