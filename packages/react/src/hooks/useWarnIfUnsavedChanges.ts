import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UnsavedChangesWarning {
  showDialog: boolean;
  proceedWithNavigation: () => void;
  cancelNavigation: () => void;
}

export function useWarnIfUnsavedChanges(
  isDirty: boolean,
): UnsavedChangesWarning {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const pendingUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

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
      window.history.pushState(null, "", window.location.href);

      setTargetUrl(null);
      setShowDialog(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
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

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Pass your form's dirty state (e.g., from react-hook-form) into the hook
| const { showDialog, proceedWithNavigation, cancelNavigation } = useWarnIfUnsavedChanges(formState.isDirty);
|
| // 2. Render your Dialog component at the bottom of your form view
| return (
|   <>
|     <form onSubmit={handleSubmit}>...</form>
|     
|     <Dialog open={showDialog} onOpenChange={cancelNavigation}>
|       <DialogContent>
|         <DialogTitle>Unsaved Changes</DialogTitle>
|         <DialogDescription>
|           You have unsaved changes. Are you sure you want to leave this page?
|         </DialogDescription>
|         <DialogFooter>
|           <Button variant="outline" onClick={cancelNavigation}>Stay</Button>
|           <Button variant="destructive" onClick={proceedWithNavigation}>Leave Anyway</Button>
|         </DialogFooter>
|       </DialogContent>
|     </Dialog>
|   </>
| );
|
*/
