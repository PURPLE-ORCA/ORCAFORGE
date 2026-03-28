import { useCallback, useSyncExternalStore } from "react";
// Note: When you scaffold this into a project, ensure this path points to your actual i18n instance
import { i18n, setLocale as setI18nLocale, getCurrentLocale } from "@/locales";
import type { Language } from "@/types/localization";

type Listener = () => void;
const listeners = new Set<Listener>();

// External store subscription logic
function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return getCurrentLocale();
}

/**
 * Updates the locale outside of the React lifecycle and notifies all subscribers.
 * Use this when changing languages from plain TS files (e.g., API interceptors).
 */
export function setLocaleAppWide(newLocale: Language) {
  if (getCurrentLocale() === newLocale) return;

  setI18nLocale(newLocale);
  listeners.forEach((listener) => listener());
}

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

/**
 * React Hook to consume the current locale and translation function.
 * Uses useSyncExternalStore to prevent tearing and avoid unnecessary Context wrappers.
 */
export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot);

  const setLocale = useCallback((newLocale: Language) => {
    setLocaleAppWide(newLocale);
  }, []);

  return {
    t: (key: string, options?: Record<string, unknown>) =>
      i18n.t(key, { locale, ...options }),
    locale,
    setLocale,
    isRTL: RTL_LOCALES.has(locale),
  };
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Use inside any React component (no Context Provider required):
| import { useI18n } from '@/lib/i18n/useI18n';
|
| export function Header() {
|   const { t, locale, setLocale, isRTL } = useI18n();
|
|   return (
|     <header dir={isRTL ? 'rtl' : 'ltr'}>
|       <h1>{t('navigation.home')}</h1>
|       <button onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
|         Toggle Language
|       </button>
|     </header>
|   );
| }
|
*/
