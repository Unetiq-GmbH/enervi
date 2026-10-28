export function base64ToFile(
  base64String: string,
  fileName: string = "file",
  mimeType: string = "application/octet-stream"
): File {
  const base64Data = base64String.split(",")[1] ?? base64String;

  const binaryStr = atob(base64Data);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return new File([bytes], fileName, { type: mimeType });
}
