import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuthUser() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // Skip query when not authenticated to avoid throwing unnecessary Convex errors
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");

  // Combined loading state: true if checking auth OR if auth is true but user data hasn't arrived
  const isLoading = authLoading || (isAuthenticated && user === undefined);

  return {
    isLoading,
    isAuthenticated: isAuthenticated && user !== null && user !== undefined,
    user,
  };
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| const { user, isAuthenticated, isLoading } = useAuthUser();
|
| if (isLoading) return <Spinner />;
| if (!isAuthenticated) return <LoginPrompt />;
|
| return <div>Welcome, {user.name}</div>;
|
*/
