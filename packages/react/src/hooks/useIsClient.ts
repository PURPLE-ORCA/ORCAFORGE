import { useState, useEffect } from "react";

/**
 * Returns true if the component has mounted on the client.
 * Strictly avoids hydration mismatch errors during SSR.
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
