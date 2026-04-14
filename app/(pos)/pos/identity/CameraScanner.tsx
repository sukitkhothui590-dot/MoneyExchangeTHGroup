"use client";

import {
  CameraIcon,
  ArrowPathIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  type CSSProperties,
} from "react";

export type CapturedImage = {
  dataUrl: string;
  width: number;
  height: number;
};

type Props = {
  onCapture: (img: CapturedImage) => void;
  disabled?: boolean;
};

const CORNER: CSSProperties = {
  position: "absolute",
  width: 28,
  height: 28,
  borderColor: "white",
  borderStyle: "solid",
  borderWidth: 0,
};

function CornerMarks() {
  return (
    <>
      <span style={{ ...CORNER, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }} />
      <span style={{ ...CORNER, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }} />
      <span style={{ ...CORNER, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }} />
      <span style={{ ...CORNER, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }} />
    </>
  );
}

export default function CameraScanner({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      stopCamera();
      setCameraError(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        video.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          const onMeta = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            video.removeEventListener("error", onErr);
            resolve();
          };
          const onErr = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            video.removeEventListener("error", onErr);
            reject(new Error("video error"));
          };
          if (video.readyState >= 1) {
            resolve();
          } else {
            video.addEventListener("loadedmetadata", onMeta);
            video.addEventListener("error", onErr);
          }
        });

        await video.play();

        setCameraActive(true);
        setVideoReady(true);
        setFacingMode(facing);
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "กรุณาอนุญาตเข้าถึงกล้อง (Camera permission denied)"
            : "ไม่สามารถเปิดกล้องได้ — ลองอัปโหลดรูปแทน";
        setCameraError(msg);
      }
    },
    [stopCamera],
  );

  const flipCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    void startCamera(next);
  }, [facingMode, startCamera]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/png");
    stopCamera();
    onCapture({ dataUrl, width: w, height: h });
  }, [onCapture, stopCamera]);

  const handleFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          onCapture({
            dataUrl: reader.result as string,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onCapture],
  );

  return (
    <div className="space-y-3">
      {!cameraActive ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => void startCamera(facingMode)}
            className="flex-1 h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <CameraIcon className="h-5 w-5" />
            เปิดกล้องแสกน
          </button>
          <label
            className={`flex-1 h-12 rounded-xl border-2 border-violet-300/50 bg-violet-50/50 text-violet-900 text-sm font-semibold hover:bg-violet-100/60 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            <PhotoIcon className="h-5 w-5" />
            อัปโหลดรูป
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={disabled}
            />
          </label>
        </div>
      ) : null}

      {cameraError ? (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {cameraError}
        </p>
      ) : null}

      <div
        className={`relative rounded-xl overflow-hidden bg-black ${
          cameraActive ? "block" : "hidden"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
        />

        {cameraActive && !videoReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <p className="text-white/70 text-sm animate-pulse">
              กำลังเปิดกล้อง…
            </p>
          </div>
        ) : null}

        {/*
         * Overlay: dim everything except the guide zone.
         * Uses a CSS mask to cut out the center rectangle.
         */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "rgba(0,0,0,0.55)",
            maskImage:
              "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            maskSize: "100% 100%, 82% 65%",
            maskPosition: "center, center",
            maskRepeat: "no-repeat",
            WebkitMaskImage:
              "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
            WebkitMaskSize: "100% 100%, 82% 65%",
            WebkitMaskPosition: "center, center",
            WebkitMaskRepeat: "no-repeat",
          }}
        />

        {/* Guide frame with corner marks */}
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            width: "82%",
            height: "65%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CornerMarks />
          <p className="absolute -bottom-6 inset-x-0 text-center text-white/70 text-[10px] sm:text-xs drop-shadow">
            วางพาสปอร์ต / บัตร ปชช. ให้อยู่ในกรอบ
          </p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-20">
          <button
            type="button"
            onClick={flipCamera}
            className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="สลับกล้อง"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={captureFrame}
            disabled={!videoReady}
            className="h-16 w-16 rounded-full bg-white/90 border-4 border-violet-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            aria-label="ถ่ายภาพ"
          >
            <div className="h-12 w-12 rounded-full bg-violet-600" />
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="ปิดกล้อง"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
