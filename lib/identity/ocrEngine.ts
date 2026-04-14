"use client";

import { resolveIdentityInput, type IdentityResolved } from "./parseScan";
import { preprocessForOcr } from "./imagePreprocess";

export type OcrPassResult = {
  passName: string;
  rawText: string;
  resolved: IdentityResolved | null;
};

export type OcrResult = {
  passes: OcrPassResult[];
  bestMatch: IdentityResolved | null;
  bestRawText: string;
  allRawTexts: string;
};

const MRZ_WHITELIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789< ";
const DIGIT_WHITELIST = "0123456789 -";
const BROAD_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>-./() ";

type ProgressCb = (pct: number, passLabel: string) => void;

/**
 * Multi-pass OCR strategy:
 *
 * 1) MRZ zone (binarized) — MRZ whitelist (passport)
 * 2) MRZ zone (enhanced) — MRZ whitelist (passport)
 * 3) Full image (binarized) — MRZ whitelist (full doc MRZ)
 * 4) Full image (enhanced) — DIGIT-ONLY whitelist (Thai NID specific)
 * 5) Full image (enhanced) — broad whitelist (fallback)
 *
 * Pass 4 is the key change: by forcing Tesseract to only recognise digits,
 * spaces, and dashes, it produces much cleaner output for Thai NID cards
 * where the 13-digit number is the primary target.
 *
 * Stops early if a valid identity is found.
 */
export async function multiPassOcr(
  imageDataUrl: string,
  onProgress?: ProgressCb,
): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");

  onProgress?.(2, "กำลังเตรียมภาพ…");
  const images = await preprocessForOcr(imageDataUrl);

  const passes: {
    name: string;
    image: string;
    whitelist: string;
  }[] = [
    {
      name: "MRZ zone (binarized)",
      image: images.mrzCrop,
      whitelist: MRZ_WHITELIST,
    },
    {
      name: "MRZ zone (enhanced)",
      image: images.mrzCropEnhanced,
      whitelist: MRZ_WHITELIST,
    },
    {
      name: "Full image (binarized, MRZ)",
      image: images.fullBinarized,
      whitelist: MRZ_WHITELIST,
    },
    {
      name: "Full image (digits only — NID)",
      image: images.fullEnhanced,
      whitelist: DIGIT_WHITELIST,
    },
    {
      name: "Full image (broad)",
      image: images.fullEnhanced,
      whitelist: BROAD_WHITELIST,
    },
  ];

  const results: OcrPassResult[] = [];
  let bestMatch: IdentityResolved | null = null;
  let bestRawText = "";

  const totalPasses = passes.length;
  let currentPass = 0;

  for (const pass of passes) {
    currentPass++;
    const baseProgress = ((currentPass - 1) / totalPasses) * 100;
    const passWeight = 100 / totalPasses;

    onProgress?.(
      Math.round(baseProgress + 5),
      `รอบ ${currentPass}/${totalPasses}: ${pass.name}`,
    );

    let worker: import("tesseract.js").Worker | null = null;
    try {
      worker = await createWorker("eng", undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = baseProgress + (m.progress ?? 0) * passWeight;
            onProgress?.(
              Math.round(Math.min(pct, 99)),
              `รอบ ${currentPass}/${totalPasses}: กำลังอ่าน…`,
            );
          }
        },
      });

      await worker.setParameters({
        tessedit_char_whitelist: pass.whitelist,
      });

      const {
        data: { text },
      } = await worker.recognize(pass.image);

      const rawText = text.trim();
      const resolved = rawText
        ? resolveIdentityInput({ raw: rawText })
        : null;

      results.push({ passName: pass.name, rawText, resolved });

      if (resolved && !bestMatch) {
        bestMatch = resolved;
        bestRawText = rawText;
        await worker.terminate();
        break;
      }

      if (rawText && !bestRawText) {
        bestRawText = rawText;
      }
    } catch {
      results.push({ passName: pass.name, rawText: "", resolved: null });
    } finally {
      try {
        await worker?.terminate();
      } catch {
        /* ignore */
      }
    }
  }

  onProgress?.(100, "เสร็จแล้ว");

  return {
    passes: results,
    bestMatch,
    bestRawText,
    allRawTexts: results.map((r) => r.rawText).filter(Boolean).join("\n---\n"),
  };
}
