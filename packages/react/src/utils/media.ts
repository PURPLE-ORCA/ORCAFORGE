/**
 * Converts any standard image file to a WebP format using the browser's Canvas API.
 * file : The original image File object
 * quality : A number between 0 and 1 indicating image quality (default: 0.85)
 * maxWidth : Maximum width for the image to prevent oversized uploads (default: 1080)
 * returns : A Promise resolving to the new WebP File object
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.85,
  maxWidth: number = 1080,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Clean up the object URL immediately to prevent memory leaks
      URL.revokeObjectURL(url);

      // Calculate new dimensions if image exceeds maxWidth
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      // Draw and scale the image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export the canvas as a WebP blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob conversion failed"));
            return;
          }

          // Swap the old extension out for .webp
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

          const webpFile = new File([blob], newName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        "image/webp",
        quality, // 0.85 = 85%, etc.
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = url;
  });
}
