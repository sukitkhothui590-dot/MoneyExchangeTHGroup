/**
 * Image preprocessing for OCR accuracy.
 * Runs entirely client-side via OffscreenCanvas / HTMLCanvasElement.
 */

function getCanvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== "undefined") {
    const c = new OffscreenCanvas(w, h);
    return { canvas: c, ctx: c.getContext("2d")! };
  }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext("2d")! };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function toDataUrl(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): string {
  if (canvas instanceof HTMLCanvasElement) {
    return canvas.toDataURL("image/png");
  }
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.drawImage(canvas as unknown as CanvasImageSource, 0, 0);
  return tmpCanvas.toDataURL("image/png");
}

/** Grayscale + adaptive contrast stretch + binarize */
function enhanceForOcr(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  threshold: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // 1. Convert to grayscale
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i]! * 0.299 + d[i + 1]! * 0.587 + d[i + 2]! * 0.114;
    d[i] = d[i + 1] = d[i + 2] = gray;
  }

  // 2. Find min/max for contrast stretching
  let min = 255,
    max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i]!;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range = max - min || 1;

  // 3. Stretch contrast + Otsu-style binarize
  for (let i = 0; i < d.length; i += 4) {
    const stretched = ((d[i]! - min) / range) * 255;
    const bw = stretched > threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = bw;
  }

  ctx.putImageData(imageData, 0, 0);
}

/** Sharpen with unsharp mask kernel */
function sharpen(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;

  // 3x3 sharpen kernel
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            val += src[idx]! * kernel[(ky + 1) * 3 + (kx + 1)]!;
          }
        }
        dst[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, val));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export type PreprocessedImages = {
  /** Full image: grayscale + contrast + sharpen (for general OCR) */
  fullEnhanced: string;
  /** Full image: binarized (for MRZ) */
  fullBinarized: string;
  /** Bottom 35% crop: binarized (MRZ zone on passports) */
  mrzCrop: string;
  /** Bottom 35% crop: enhanced without binarize */
  mrzCropEnhanced: string;
  /** Original width/height */
  width: number;
  height: number;
};

/**
 * Prepare multiple preprocessed versions of an image for multi-pass OCR.
 */
export async function preprocessForOcr(
  dataUrl: string,
): Promise<PreprocessedImages> {
  const img = await loadImage(dataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // --- Full enhanced (grayscale + sharpen, no binarize) ---
  const { canvas: c1, ctx: ctx1 } = getCanvas(w, h);
  ctx1.drawImage(img, 0, 0, w, h);
  // grayscale only
  const id1 = ctx1.getImageData(0, 0, w, h);
  const d1 = id1.data;
  for (let i = 0; i < d1.length; i += 4) {
    const gray = d1[i]! * 0.299 + d1[i + 1]! * 0.587 + d1[i + 2]! * 0.114;
    d1[i] = d1[i + 1] = d1[i + 2] = gray;
  }
  ctx1.putImageData(id1, 0, 0);
  sharpen(ctx1, w, h);
  const fullEnhanced = toDataUrl(c1);

  // --- Full binarized (for MRZ) ---
  const { canvas: c2, ctx: ctx2 } = getCanvas(w, h);
  ctx2.drawImage(img, 0, 0, w, h);
  enhanceForOcr(ctx2, w, h, 140);
  const fullBinarized = toDataUrl(c2);

  // --- MRZ crop: bottom 35% ---
  const cropH = Math.round(h * 0.35);
  const cropY = h - cropH;

  const { canvas: c3, ctx: ctx3 } = getCanvas(w, cropH);
  ctx3.drawImage(img, 0, cropY, w, cropH, 0, 0, w, cropH);
  enhanceForOcr(ctx3, w, cropH, 130);
  const mrzCrop = toDataUrl(c3);

  const { canvas: c4, ctx: ctx4 } = getCanvas(w, cropH);
  ctx4.drawImage(img, 0, cropY, w, cropH, 0, 0, w, cropH);
  const id4 = ctx4.getImageData(0, 0, w, cropH);
  const d4 = id4.data;
  for (let i = 0; i < d4.length; i += 4) {
    const gray = d4[i]! * 0.299 + d4[i + 1]! * 0.587 + d4[i + 2]! * 0.114;
    d4[i] = d4[i + 1] = d4[i + 2] = gray;
  }
  ctx4.putImageData(id4, 0, 0);
  sharpen(ctx4, w, cropH);
  const mrzCropEnhanced = toDataUrl(c4);

  return { fullEnhanced, fullBinarized, mrzCrop, mrzCropEnhanced, width: w, height: h };
}
