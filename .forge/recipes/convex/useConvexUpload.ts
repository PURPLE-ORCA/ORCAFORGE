import { useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convertToWebP } from "@orcaforge/core";

export function useConvexUpload() {
  // Ensure you have a generic upload mutation at convex/uploads.ts -> generateUploadUrl
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const uploadFile = useCallback(
    async (file: File, quality = 0.85): Promise<Id<"_storage">> => {
      // Intercept and compress images, leave PDFs/Videos alone
      const fileToUpload = file.type.startsWith("image/")
        ? await convertToWebP(file, quality)
        : file;

      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": fileToUpload.type },
        body: fileToUpload,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const json = await res.json();
      return json.storageId as Id<"_storage">;
    },
    [generateUploadUrl],
  );

  const uploadMany = useCallback(
    async (files: File[]): Promise<Id<"_storage">[]> => {
      return Promise.all(files.map((f) => uploadFile(f)));
    },
    [uploadFile],
  );

  return { uploadFile, uploadMany };
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| const { uploadFile, uploadMany } = useConvexUpload();
|
| // Single file (automatically converted to WebP if image)
| const storageId = await uploadFile(event.target.files[0]);
| 
| // Multiple files
| const storageIds = await uploadMany(Array.from(event.target.files));
|
*/
