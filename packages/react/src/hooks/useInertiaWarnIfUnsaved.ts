import { useEffect, useState, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";

export interface InertiaUnsavedWarning {
  showDialog: boolean;
  proceed: () => void;
  cancel: () => void;
}

export function useInertiaWarnIfUnsaved(
  isDirty: boolean,
): InertiaUnsavedWarning {
  const [showDialog, setShowDialog] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  // The secret sauce: bypass the dirtiness check when the user explicitly confirms they want to leave
  const forceLeave = useRef(false);

  useEffect(() => {
    // 1. Handle native browser refresh or tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !forceLeave.current) {
        e.preventDefault();
        // Required for Chrome to trigger the native prompt
        e.returnValue = "";
      }
    };

    // 2. Handle Inertia SPA navigation
    const removeListener = router.on("before", (event) => {
      if (isDirty && !forceLeave.current) {
        event.preventDefault();

        // event.detail.visit.url is usually a URL object in Inertia
        const href =
          typeof event.detail.visit.url === "string"
            ? event.detail.visit.url
            : event.detail.visit.url.href;

        setTargetUrl(href);
        setShowDialog(true);
      }
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      removeListener();
    };
  }, [isDirty]);

  const proceed = useCallback(() => {
    forceLeave.current = true;
    setShowDialog(false);

    if (targetUrl) {
      router.visit(targetUrl);
    }
  }, [targetUrl]);

  const cancel = useCallback(() => {
    setShowDialog(false);
    setTargetUrl(null);
  }, []);

  return { showDialog, proceed, cancel };
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Use it in your Inertia page, passing the form's dirty state:
| const { data, setData, post, isDirty } = useForm({ name: '' });
| const { showDialog, proceed, cancel } = useInertiaWarnIfUnsaved(isDirty);
|
| // 2. Render your dialog (using shadcn/ui or similar):
| return (
|   <>
|     <form onSubmit={submit}>...</form>
|     
|     <Dialog open={showDialog} onOpenChange={cancel}>
|       <DialogContent>
|         <DialogTitle>Unsaved Changes</DialogTitle>
|         <DialogDescription>
|           You have unsaved changes. Are you sure you want to leave?
|         </DialogDescription>
|         <DialogFooter>
|           <Button variant="outline" onClick={cancel}>Stay Here</Button>
|           <Button variant="destructive" onClick={proceed}>Leave Anyway</Button>
|         </DialogFooter>
|       </DialogContent>
|     </Dialog>
|   </>
| );
|
*/
