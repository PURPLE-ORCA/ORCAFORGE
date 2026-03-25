/**
 * Extracts the first and last initials from a full name string.
 * Completely decoupled from React.
 *
 * fullName : The full name string (e.g., "John Doe")
 * returns : The capitalized initials (e.g., "JD")
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return "";

  // Split on one or more spaces to avoid empty array elements
  const names = fullName.trim().split(/\s+/);

  if (names.length === 0 || names[0] === "") return "";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}
