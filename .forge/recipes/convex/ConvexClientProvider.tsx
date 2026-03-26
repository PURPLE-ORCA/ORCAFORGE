"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set in environment variables.",
  );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // Inside your Next.js app/layout.tsx:
| import { ConvexClientProvider } from "@/lib/convex/ConvexClientProvider";
|
| export default function RootLayout({ children }: { children: React.ReactNode }) {
|   return (
|     <html lang="en">
|       <body>
|         <ConvexClientProvider>
|           {children}
|         </ConvexClientProvider>
|       </body>
|     </html>
|   );
| }
|
*/
