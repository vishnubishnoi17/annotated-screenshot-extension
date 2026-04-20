function createProcessingCanvas(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function dataUrlToBitmap(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

export async function stitchVerticalSegments(segments, targetWidth, targetHeight, viewportHeight) {
  const canvas = createProcessingCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });

  let y = 0;
  for (const segment of segments) {
    const bitmap = await dataUrlToBitmap(segment);
    const drawHeight = Math.min(bitmap.height, targetHeight - y);
    ctx.drawImage(bitmap, 0, 0, bitmap.width, drawHeight, 0, y, targetWidth, drawHeight);
    y += viewportHeight;
    bitmap.close?.();
  }

  const blob = canvas.convertToBlob
    ? await canvas.convertToBlob({ type: 'image/png', quality: 1 })
    : await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function cropDataUrl(dataUrl, rect, viewportWidth, viewportHeight) {
  const bitmap = await dataUrlToBitmap(dataUrl);
  const scaleX = bitmap.width / viewportWidth;
  const scaleY = bitmap.height / viewportHeight;

  const sx = Math.max(0, Math.round(rect.x * scaleX));
  const sy = Math.max(0, Math.round(rect.y * scaleY));
  const sw = Math.max(1, Math.round(rect.width * scaleX));
  const sh = Math.max(1, Math.round(rect.height * scaleY));

  const canvas = createProcessingCanvas(sw, sh);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  bitmap.close?.();

  const blob = canvas.convertToBlob
    ? await canvas.convertToBlob({ type: 'image/png', quality: 1 })
    : await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
