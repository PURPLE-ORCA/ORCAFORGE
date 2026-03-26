"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// --- TYPES ---
interface BreadcrumbContextType {
  labels: Record<string, string>;
  setLabel: (path: string, label: string) => void;
}

export interface BreadcrumbTrailItem {
  href: string;
  label: string;
  isCurrentPage: boolean;
}

// --- CONTEXT & PROVIDER ---
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = (path: string, label: string) => {
    setLabels((prev) => {
      if (prev[path] === label) return prev;
      return { ...prev, [path]: label };
    });
  };

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// --- INTERNAL HOOK ---
function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error(
      "Breadcrumb hooks must be used within a <BreadcrumbProvider>",
    );
  }
  return context;
}

// --- EXPORTED HOOKS ---

/**
 * Registers a dynamic, human-readable label for a specific URL path.
 *
 * @param label The human-readable label (e.g., "John Doe")
 * @param path Optional: The exact path to label. Defaults to current pathname.
 */
export function useBreadcrumbLabel(
  label: string | undefined | null,
  path?: string,
) {
  const { setLabel } = useBreadcrumbContext();
  const pathname = usePathname();
  const targetPath = path || pathname;

  useEffect(() => {
    if (label) {
      setLabel(targetPath, label);
    }
  }, [label, targetPath, setLabel]);
}

/**
 * Consumes the registered labels and the current Next.js pathname
 * to generate a structured array for building the Breadcrumb UI.
 */
export function useBreadcrumbTrail(): BreadcrumbTrailItem[] {
  const { labels } = useBreadcrumbContext();
  const pathname = usePathname();

  // Remove trailing slashes and split
  const paths =
    pathname === "/" ? [""] : pathname.replace(/\/$/, "").split("/");

  return paths.map((segment, index) => {
    // Reconstruct the href for this specific segment
    const href = paths.slice(0, index + 1).join("/") || "/";

    // Check if we have a registered dynamic label, otherwise fallback to raw segment
    const rawLabel = labels[href] || segment;

    // Capitalize fallback labels (e.g., "users" -> "Users"), explicitly name home
    const displayLabel =
      href === "/"
        ? "Home"
        : rawLabel.charAt(0).toUpperCase() +
          rawLabel.slice(1).replace(/-/g, " ");

    return {
      href,
      label: displayLabel,
      isCurrentPage: index === paths.length - 1,
    };
  });
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Wrap your App Router layout (app/layout.tsx):
| export default function RootLayout({ children }) {
|   return <BreadcrumbProvider>{children}</BreadcrumbProvider>;
| }
|
| // 2. Consume the trail in your Navigation UI (app/components/Nav.tsx):
| export function Navigation() {
|   const trail = useBreadcrumbTrail();
|   return (
|     <nav>
|       {trail.map((item) => (
|         <Link key={item.href} href={item.href} aria-current={item.isCurrentPage ? "page" : undefined}>
|           {item.label}
|         </Link>
|       ))}
|     </nav>
|   );
| }
|
| // 3. Register dynamic names deeply inside your page components (app/users/[id]/page.tsx):
| export default function UserProfile({ params }) {
|   const { data: user } = useQuery(api.users.get, { id: params.id });
|   
|   // This tells the provider: "Rename /users/123 to 'John Doe'"
|   useBreadcrumbLabel(user?.name); 
|
|   return <div>...</div>;
| }
|
*/
