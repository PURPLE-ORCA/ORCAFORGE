import { useState, useCallback } from "react";

export interface UseFormImagesOptions {
  /** Initial cover/main image URL (from existing data when editing) */
  initialCoverUrl?: string | null;
  /** Initial secondary image URLs — gallery or detail images */
  initialSecondaryUrls?: string[];
}

export function useFormImages(options?: UseFormImagesOptions) {
  // Lazy initialize to avoid unnecessary re-evaluations on parent renders
  const [coverImage, setCoverImage] = useState<string | null>(
    () => options?.initialCoverUrl || null,
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    () => options?.initialSecondaryUrls || [],
  );

  // Expose a safe reset method if the form is canceled or completely re-fetched
  const resetImages = useCallback(() => {
    setCoverImage(options?.initialCoverUrl || null);
    setGalleryImages(options?.initialSecondaryUrls || []);
  }, [options?.initialCoverUrl, options?.initialSecondaryUrls]);

  return {
    coverImage,
    setCoverImage,
    galleryImages,
    setGalleryImages,
    resetImages,
  };
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Initialize inside your form component (perfect for edit views)
| const { 
|   coverImage, 
|   setCoverImage, 
|   galleryImages, 
|   setGalleryImages 
| } = useFormImages({
|   initialCoverUrl: activity?.cover_image,
|   initialSecondaryUrls: activity?.gallery
| });
|
| // 2. Bind to your UI uploaders
| return (
|   <form>
|     <SingleImageUploader 
|       value={coverImage} 
|       onChange={setCoverImage} 
|     />
|     
|     <MultiImageUploader 
|       values={galleryImages} 
|       onChange={setGalleryImages} 
|     />
|   </form>
| );
|
*/
