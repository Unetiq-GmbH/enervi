const MAX_DIMENSION = 2000;
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const MIN_QUALITY = 0.4;
const INITIAL_QUALITY = 0.92;
const QUALITY_STEP = 0.1;
const MAX_TRIES = 5;

export const resizeAndCompressImage = (
  file: File,
  quality: number = INITIAL_QUALITY
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;

      // Calculate scale to keep dimensions under MAX_DIMENSION
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);
      const targetWidth = width * scale;
      const targetHeight = height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          const newFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".jpg"),
            {
              type: "image/jpeg",
            }
          );
          resolve(newFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Image load error"));
    img.src = url;
  });
};

export async function compressFile(file: File): Promise<File | null> {
  let quality = INITIAL_QUALITY;
  let attempt = 0;

  if (file.size <= MAX_UPLOAD_SIZE) {
    return file;
  }

  let compressed = await resizeAndCompressImage(file, quality);

  while (
    compressed.size > MAX_UPLOAD_SIZE &&
    quality > MIN_QUALITY &&
    attempt < MAX_TRIES
  ) {
    attempt++;
    quality = Math.max(quality - QUALITY_STEP, MIN_QUALITY);
    compressed = await resizeAndCompressImage(file, quality);
  }

  return compressed.size <= MAX_UPLOAD_SIZE ? compressed : null;
}
