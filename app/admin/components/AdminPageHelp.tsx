"use client";

import { useId, useState } from "react";
import {
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export type AdminHelpSection = {
  readonly title: string;
  readonly items: readonly string[];
};

export interface AdminPageHelpProps {
  /** Unique prefix for aria ids (e.g. "rates", "dashboard"). */
  idPrefix: string;
  title: string;
  expandLabel: string;
  collapseLabel: string;
  sections: readonly AdminHelpSection[];
  className?: string;
}

export default function AdminPageHelp({
  idPrefix,
  title,
  expandLabel,
  collapseLabel,
  sections,
  className = "",
}: AdminPageHelpProps) {
  const uid = useId().replace(/:/g, "");
  const headingId = `${idPrefix}-help-h-${uid}`;
  const panelId = `${idPrefix}-help-p-${uid}`;
  const [open, setOpen] = useState(false);

  return (
    <section
      className={`mb-6 rounded-xl border border-border bg-brand-subtle/30 overflow-hidden ${className}`}
      aria-label={title}
    >
      <button
        type="button"
        id={headingId}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-brand-subtle/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <InformationCircleIcon
            className="w-5 h-5 text-brand shrink-0"
            aria-hidden
          />
          <span className="text-sm font-semibold text-foreground truncate">
            {title}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-brand">
            {open ? collapseLabel : expandLabel}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-border/50"
        >
          <div className="pt-3 space-y-4 text-sm text-muted leading-relaxed">
            {sections.map((section, si) => (
              <div key={section.title}>
                <p className="text-xs font-semibold text-foreground mb-2">
                  {section.title}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  {section.items.map((line, li) => (
                    <li key={`${si}-${li}`}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
