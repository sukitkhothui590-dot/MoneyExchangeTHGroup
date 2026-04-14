"use client";

import {
  CreditCardIcon,
  SignalIcon,
  SignalSlashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

export type CardReadResult = {
  rawData: string;
  method: "wedge" | "serial";
};

type Props = {
  onRead: (result: CardReadResult) => void;
  disabled?: boolean;
  active: boolean;
};

/**
 * Card reader modes:
 * 1. Keyboard-wedge — most readers emulate keyboard, type data fast then Enter
 * 2. WebSerial — direct serial port access (Chrome/Edge 89+)
 */
export default function CardReaderListener({ onRead, disabled, active }: Props) {
  const [wedgeListening, setWedgeListening] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialError, setSerialError] = useState("");
  const [lastData, setLastData] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // ── Keyboard wedge detection ─────────────────────────────────
  // Card readers type all chars in <80ms then press Enter.
  // Human typing averages 200ms+ per char.
  const WEDGE_TIMEOUT_MS = 150;
  const WEDGE_MIN_LENGTH = 5;

  const startWedge = useCallback(() => {
    setWedgeListening(true);
    bufferRef.current = "";
    inputRef.current?.focus();
  }, []);

  const stopWedge = useCallback(() => {
    setWedgeListening(false);
    bufferRef.current = "";
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleWedgeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      bufferRef.current = val;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const data = bufferRef.current.trim();
        if (data.length >= WEDGE_MIN_LENGTH) {
          setLastData(data);
          onRead({ rawData: data, method: "wedge" });
          bufferRef.current = "";
          if (inputRef.current) inputRef.current.value = "";
        }
      }, WEDGE_TIMEOUT_MS);
    },
    [onRead],
  );

  const handleWedgeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        const data = bufferRef.current.trim();
        if (data.length >= WEDGE_MIN_LENGTH) {
          setLastData(data);
          onRead({ rawData: data, method: "wedge" });
        }
        bufferRef.current = "";
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onRead],
  );

  // Auto-focus wedge when active
  useEffect(() => {
    if (active && wedgeListening) {
      inputRef.current?.focus();
    }
  }, [active, wedgeListening]);

  // ── WebSerial connection ─────────────────────────────────────
  const supportsSerial = typeof navigator !== "undefined" && "serial" in navigator;

  const connectSerial = useCallback(async () => {
    if (!supportsSerial) {
      setSerialError("เบราว์เซอร์นี้ไม่รองรับ WebSerial — ใช้ Chrome หรือ Edge เวอร์ชันใหม่");
      return;
    }
    setSerialError("");
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setSerialConnected(true);

      const decoder = new TextDecoder();
      let lineBuffer = "";

      const reader = port.readable?.getReader();
      if (!reader) throw new Error("No readable stream");
      readerRef.current = reader;

      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            lineBuffer += text;

            const lines = lineBuffer.split(/[\r\n]+/);
            lineBuffer = lines.pop() ?? "";

            for (const line of lines) {
              const data = line.trim();
              if (data.length >= WEDGE_MIN_LENGTH) {
                setLastData(data);
                onRead({ rawData: data, method: "serial" });
              }
            }
          }
        } catch (err) {
          if (!(err instanceof DOMException && err.name === "NetworkError")) {
            setSerialError(`Serial อ่านล้มเหลว: ${err instanceof Error ? err.message : "unknown"}`);
          }
        }
      };

      void readLoop();
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        return;
      }
      setSerialError(`เชื่อมต่อไม่สำเร็จ: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }, [onRead, supportsSerial]);

  const disconnectSerial = useCallback(async () => {
    try {
      readerRef.current?.cancel();
      readerRef.current = null;
      await portRef.current?.close();
      portRef.current = null;
    } catch {
      /* ignore */
    }
    setSerialConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWedge();
      void disconnectSerial();
    };
  }, [stopWedge, disconnectSerial]);

  return (
    <div className="space-y-4">
      {/* ── Method 1: Keyboard wedge ── */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-teal-700" />
            <div>
              <p className="text-xs font-semibold text-teal-900">
                เสียบบัตร (Keyboard Wedge)
              </p>
              <p className="text-[10px] text-teal-700/70 mt-0.5">
                เครื่องอ่านบัตรแบบ USB ที่ส่งข้อมูลเป็น keystroke
              </p>
            </div>
          </div>
          {wedgeListening ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-100 text-[10px] font-semibold text-teal-800 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              กำลังรอรับข้อมูล
            </span>
          ) : null}
        </div>

        {!wedgeListening ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startWedge}
            className="w-full h-12 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <CreditCardIcon className="h-5 w-5" />
            เปิดรับข้อมูลจากเครื่องเสียบบัตร
          </button>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                autoComplete="off"
                onChange={handleWedgeInput}
                onKeyDown={handleWedgeKeyDown}
                onBlur={() => {
                  if (wedgeListening) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }
                }}
                className="w-full h-14 px-4 rounded-xl border-2 border-teal-400 bg-white text-sm font-mono text-teal-900 text-center focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors"
                placeholder="เสียบบัตรเลย… ข้อมูลจะปรากฏที่นี่อัตโนมัติ"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-teal-400 opacity-75" />
                  <span className="relative h-3 w-3 rounded-full bg-teal-500" />
                </span>
              </div>
            </div>
            <p className="text-[10px] text-teal-700 leading-relaxed text-center">
              เสียบบัตร ปชช. หรือพาสปอร์ตเข้าเครื่องอ่าน — ระบบจะรับข้อมูลอัตโนมัติ
            </p>
            <button
              type="button"
              onClick={stopWedge}
              className="w-full h-10 rounded-xl border border-teal-200 text-xs text-teal-700 font-medium hover:bg-teal-50"
            >
              หยุดรับข้อมูล
            </button>
          </div>
        )}
      </div>

      {/* ── Method 2: WebSerial ── */}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {serialConnected ? (
              <SignalIcon className="h-5 w-5 text-cyan-700" />
            ) : (
              <SignalSlashIcon className="h-5 w-5 text-cyan-400" />
            )}
            <div>
              <p className="text-xs font-semibold text-cyan-900">
                Serial Port (ขั้นสูง)
              </p>
              <p className="text-[10px] text-cyan-700/70 mt-0.5">
                เชื่อมต่อตรงกับเครื่องอ่านผ่าน COM/Serial port
              </p>
            </div>
          </div>
          {serialConnected ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-100 text-[10px] font-semibold text-cyan-800">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              เชื่อมต่อแล้ว
            </span>
          ) : null}
        </div>

        {!serialConnected ? (
          <button
            type="button"
            disabled={disabled || !supportsSerial}
            onClick={() => void connectSerial()}
            className="w-full h-11 rounded-xl border-2 border-cyan-300/60 bg-white text-cyan-800 text-sm font-medium hover:bg-cyan-50 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <SignalIcon className="h-4 w-4" />
            {supportsSerial ? "เชื่อมต่อ Serial Port" : "เบราว์เซอร์ไม่รองรับ WebSerial"}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-100/60 border border-cyan-200">
              <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-75" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-500" />
              </span>
              <p className="text-[11px] text-cyan-800">
                กำลังรับข้อมูลจาก Serial — เสียบบัตรได้เลย
              </p>
            </div>
            <button
              type="button"
              onClick={() => void disconnectSerial()}
              className="w-full h-10 rounded-xl border border-cyan-200 text-xs text-cyan-700 font-medium hover:bg-cyan-50 inline-flex items-center justify-center gap-1.5"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              ตัดการเชื่อมต่อ
            </button>
          </div>
        )}

        {serialError ? (
          <p className="text-[11px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {serialError}
          </p>
        ) : null}
      </div>

      {/* ── Last received data ── */}
      {lastData ? (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-[10px] font-medium text-slate-500 mb-1">
            ข้อมูลล่าสุดที่ได้รับ:
          </p>
          <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
            {lastData}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
