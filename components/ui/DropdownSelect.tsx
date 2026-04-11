"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export type DropdownOption = {
  value: string;
  /** ข้อความล้วน (aria / fallback) */
  label: string;
  /** ถ้ามี จะแสดงแทน label ในเมนูและปุ่ม — เช่น ธง + รหัสสกุลเงิน */
  labelContent?: ReactNode;
  disabled?: boolean;
};

export type DropdownSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  className?: string;
  id?: string;
};

function initialHighlight(
  options: DropdownOption[],
  selectedIndex: number,
  enabledIndices: number[],
): number {
  if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
    return selectedIndex;
  }
  return enabledIndices[0] ?? 0;
}

/** Scroll so `el` is visible inside `container`; only adjusts container.scrollTop */
function scrollOptionIntoContainer(
  container: HTMLElement,
  el: HTMLElement,
) {
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  if (eRect.top < cRect.top) {
    container.scrollTop += eRect.top - cRect.top;
  } else if (eRect.bottom > cRect.bottom) {
    container.scrollTop += eRect.bottom - cRect.bottom;
  }
}

export default function DropdownSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  id: idProp,
}: DropdownSelectProps) {
  const uid = useId();
  const listboxId = idProp ? `${idProp}-listbox` : `${uid}-listbox`;
  const buttonId = idProp ?? `${uid}-trigger`;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const enabledIndices = useMemo(
    () =>
      options
        .map((o, i) => (o.disabled ? -1 : i))
        .filter((i): i is number => i >= 0),
    [options],
  );

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? "—";
  const displayNode = selected?.labelContent ?? displayLabel;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const updateMenuPosition = useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const gap = 8;
    setMenuStyle({
      top: r.bottom + gap,
      left: r.left,
      width: r.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const container = listRef.current;
    const el = container.querySelector(
      `[data-option-index="${highlight}"]`,
    ) as HTMLElement | null;
    if (!el) return;
    scrollOptionIntoContainer(container, el);
  }, [highlight, open]);

  const openMenu = useCallback(() => {
    const start = initialHighlight(options, selectedIndex, enabledIndices);
    setHighlight(start);
    setOpen(true);
    requestAnimationFrame(() => updateMenuPosition());
  }, [options, selectedIndex, enabledIndices, updateMenuPosition]);

  const selectOption = useCallback(
    (index: number) => {
      const opt = options[index];
      if (!opt || opt.disabled) return;
      onChange(opt.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [options, onChange],
  );

  const moveHighlight = useCallback(
    (delta: 1 | -1) => {
      const len = options.length;
      if (len === 0) return;
      let i = highlight;
      let guard = 0;
      do {
        i = (i + delta + len) % len;
        guard++;
      } while (options[i]?.disabled && guard <= len);
      if (!options[i]?.disabled) setHighlight(i);
    },
    [highlight, options],
  );

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = enabledIndices[0];
      if (first !== undefined) setHighlight(first);
    } else if (e.key === "End") {
      e.preventDefault();
      const last = enabledIndices[enabledIndices.length - 1];
      if (last !== undefined) setHighlight(last);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(highlight);
    }
  };

  const listbox = open &&
    !disabled &&
    mounted &&
    createPortal(
      <div
        ref={listRef}
        className="pointer-events-auto fixed z-[100] max-h-[min(320px,50vh)] overflow-y-auto no-scrollbar rounded-xl border border-border/90 bg-white p-1 shadow-lg shadow-surface-900/[0.06] ring-1 ring-black/[0.03]"
        style={{
          top: menuStyle.top,
          left: menuStyle.left,
          width: Math.max(menuStyle.width, 200),
        }}
        id={listboxId}
        role="listbox"
      >
        {options.map((opt, i) => {
          const isSelected = value === opt.value;
          const isActive = highlight === i;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              data-option-index={i}
              aria-selected={isSelected}
              disabled={opt.disabled}
              onClick={() => selectOption(i)}
              onMouseEnter={() => !opt.disabled && setHighlight(i)}
              className={[
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                opt.disabled
                  ? "cursor-not-allowed text-surface-400"
                  : isSelected
                    ? "bg-[var(--site-subtle)] font-medium text-site-accent"
                    : isActive
                      ? "bg-surface-100 text-surface-900"
                      : "text-surface-800 hover:bg-surface-50",
              ].join(" ")}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {opt.labelContent ?? opt.label}
              </span>
              {isSelected && !opt.disabled && (
                <CheckIcon
                  className="h-4 w-4 shrink-0 text-site-accent"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>,
      document.body,
    );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label
        htmlFor={buttonId}
        className="block text-sm font-medium text-surface-700 mb-1.5"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!open) openMenu();
          else setOpen(false);
        }}
        onKeyDown={onTriggerKeyDown}
        className={[
          "group flex w-full min-h-12 items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white px-4 text-left text-sm font-medium text-surface-900 shadow-sm transition-all duration-200",
          "outline-none focus-visible:border-site-accent/50 focus-visible:ring-2 focus-visible:ring-site-accent/20 focus-visible:ring-offset-0",
          disabled
            ? "cursor-not-allowed border-border/60 opacity-50"
            : open
              ? "border-site-accent/35 ring-2 ring-site-accent/15"
              : "hover:border-surface-300 hover:shadow",
        ].join(" ")}
      >
        <span className="truncate flex items-center gap-2 min-w-0 [&_img]:shrink-0">
          {displayNode}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-surface-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {listbox}
    </div>
  );
}
