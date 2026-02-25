/**
 * Coordinate conversion for object-contain image inside a container.
 * Ensures click position and payload positions use image percentage (0-100)
 * so the painted image and backend get correct positions.
 */

/**
 * Get the displayed image rectangle (object-contain) inside a container.
 * @returns { offsetX, offsetY, displayWidth, displayHeight } in container pixels
 */
export function getContainedImageRect(
  containerWidth: number,
  containerHeight: number,
  imageNaturalWidth: number,
  imageNaturalHeight: number
): { offsetX: number; offsetY: number; displayWidth: number; displayHeight: number } {
  if (!imageNaturalWidth || !imageNaturalHeight) {
    return { offsetX: 0, offsetY: 0, displayWidth: containerWidth, displayHeight: containerHeight };
  }
  const imgAspect = imageNaturalWidth / imageNaturalHeight;
  const containerAspect = containerWidth / containerHeight;

  if (imgAspect >= containerAspect) {
    const displayWidth = containerWidth;
    const displayHeight = containerWidth / imgAspect;
    const offsetX = 0;
    const offsetY = (containerHeight - displayHeight) / 2;
    return { offsetX, offsetY, displayWidth, displayHeight };
  } else {
    const displayHeight = containerHeight;
    const displayWidth = containerHeight * imgAspect;
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = 0;
    return { offsetX, offsetY, displayWidth, displayHeight };
  }
}

/**
 * Convert a click (container pixels) to image percentage (0-100).
 * Clamps to [0, 100] so the point stays on the image.
 */
export function containerClickToImagePercent(
  clickX: number,
  clickY: number,
  rect: { offsetX: number; offsetY: number; displayWidth: number; displayHeight: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const relX = (clickX - rect.offsetX) / rect.displayWidth;
  const relY = (clickY - rect.offsetY) / rect.displayHeight;
  const x = Math.min(100, Math.max(0, relX * 100));
  const y = Math.min(100, Math.max(0, relY * 100));
  return { x, y };
}

/**
 * Convert image percentage (0-100) to container percentage for overlay positioning.
 */
export function imagePercentToContainerPercent(
  imageX: number,
  imageY: number,
  rect: { offsetX: number; offsetY: number; displayWidth: number; displayHeight: number },
  containerWidth: number,
  containerHeight: number
): { left: number; top: number } {
  const leftPx = rect.offsetX + (imageX / 100) * rect.displayWidth;
  const topPx = rect.offsetY + (imageY / 100) * rect.displayHeight;
  return {
    left: (leftPx / containerWidth) * 100,
    top: (topPx / containerHeight) * 100,
  };
}
