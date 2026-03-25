import { router, type Href } from "expo-router";

/**
 * 1. THE DICTIONARY
 * Define the app's exact static routes here.
 * If you rename a folder, you only change it here.
 */
export const Routes = {
  home: "/(tabs)",
  login: "/(auth)/login",
  settings: "/(tabs)/settings",
  // TODO: Add project-specific static routes here
} as const;

/**
 * 2. THE NAVIGATOR
 * Type-safe navigation wrapper.
 * Use this instead of calling `router.push()` directly to guarantee valid paths.
 */
export const to = {
  /** Safely go back, or fallback to home if there is no history */
  back: () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(Routes.home as Href);
    }
  },

  // --- STATIC ROUTES ---
  home: () => router.navigate(Routes.home as Href),
  login: () => router.push(Routes.login as Href),
  settings: () => router.push(Routes.settings as Href),

  // --- DYNAMIC ROUTES ---
  /**
   * Example of a dynamic route wrapper.
   * Forces you to pass the required params instead of guessing string interpolation.
   */
  // userProfile: (userId: string) => router.push(`/user/${userId}` as Href),

  // --- UTILS ---
  replaceToHome: () => router.replace(Routes.home as Href),
  replaceToAuth: () => router.replace(Routes.login as Href),
};
