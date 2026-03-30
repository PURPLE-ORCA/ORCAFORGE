import type { Id } from "@/convex/_generated/dataModel";

export function resolveStorageId(
  currentUrl: string,
  originalId?: string | Id<"_storage">,
  originalUrl?: string,
): string | Id<"_storage"> {
  if (originalId && originalUrl && currentUrl === originalUrl) {
    return originalId as Id<"_storage">;
  }
  return currentUrl;
}

export function resolveGalleryStorageIds(
  currentUrls: string[],
  originalUrls?: string[],
  originalIds?: string[],
): (string | Id<"_storage">)[] {
  return currentUrls.map((url) => {
    const originalIndex = originalUrls?.indexOf(url) ?? -1;
    if (originalIndex !== -1 && originalIds?.[originalIndex]) {
      return originalIds[originalIndex] as Id<"_storage">;
    }
    return url;
  });
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // Use this before sending an update mutation to Convex. 
| // It ensures you don't send a full URL when Convex is expecting a storage ID
| // for an image that hasn't actually been changed by the user.
|
| const imageToSave = resolveStorageId(
|   formState.coverImage, 
|   existingData.coverImageId, 
|   existingData.coverImageUrl
| );
|
| await updateRecord({ id, coverImage: imageToSave });
|
*/
