import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UnsavedChangesWarning {
  showDialog: boolean;
  proceedWithNavigation: () => void;
  cancelNavigation: () => void;
}

/**
 * Intercepts Next.js App Router navigation to warn users about unsaved form changes.
 * Handles standard link clicks, browser back/forward buttons, and tab closures.
 */
export function useWarnIfUnsavedChanges(
  isDirty: boolean,
): UnsavedChangesWarning {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  // Keep a mutable ref so we don't have to bind state to the event listeners
  const pendingUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required for Chrome to show the default native prompt
      e.returnValue = "";
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // closest('a') ensures we catch clicks on SVGs or spans inside the link
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchor hashes, emails, or download triggers
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Ignore modifier keys (Cmd/Ctrl click to open in new tab)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      pendingUrl.current = href;
      setTargetUrl(href);
      setShowDialog(true);
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!isDirty) return;

      e.preventDefault();
      // Push the current URL back onto the history stack to prevent the actual back navigation
      window.history.pushState(null, "", window.location.href);

      setTargetUrl(null);
      setShowDialog(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Use capture phase to intercept the click before Next.js Link component handles it
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  const proceedWithNavigation = useCallback(() => {
    setShowDialog(false);
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      window.history.back();
    }
    pendingUrl.current = null;
  }, [targetUrl, router]);

  const cancelNavigation = useCallback(() => {
    setShowDialog(false);
    setTargetUrl(null);
    pendingUrl.current = null;
  }, []);

  return { showDialog, proceedWithNavigation, cancelNavigation };
}
