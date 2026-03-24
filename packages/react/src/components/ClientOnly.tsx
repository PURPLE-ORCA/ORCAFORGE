import type { ReactNode } from "react";
import { useIsClient } from "../hooks/useIsClient";

export interface ClientOnlyProps {
  children: ReactNode;
  /**
   * The UI to display during Server-Side Rendering and initial hydration.
   * Use skeletons or loaders here to prevent Cumulative Layout Shift (CLS).
   */
  fallback?: ReactNode;
}

/**
 * Ensures the wrapped children are only rendered on the browser.
 * Perfect for heavy client-side libraries, window APIs, or custom local storage states.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient();

  // Render the skeleton on the server and during the very first client render
  if (!isClient) {
    return <>{fallback}</>;
  }

  // Safe to render the heavy interactive stuff
  return <>{children}</>;
}
