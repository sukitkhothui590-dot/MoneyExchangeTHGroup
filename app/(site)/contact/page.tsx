"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { fetchBranches, type BranchInfo } from "@/lib/api";

function SocialIcon({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full bg-site-accent text-white flex items-center justify-center hover:bg-site-accent-hover transition-colors"
    >
      {children}
    </a>
  );
}

export default function ContactPage() {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo | null>(null);

  useEffect(() => {
    fetchBranches().then((data) => {
      setBranches(data);
      const hq = data.find((b) => b.id === "head-office");
      setSelectedBranch(hq ?? data[0] ?? null);
    });
  }, []);

  const displayName = (b: BranchInfo) =>
    locale === "th" ? b.name_th || b.name : b.name;

  const displayAddress = (b: BranchInfo) => {
    if (locale === "th") return b.address_th || b.address;
    if (locale === "cn") return b.address_cn || b.address;
    return b.address || b.address_th;
  };

  const displayHours = (b: BranchInfo) => {
    if (locale === "th") return b.hours_th || b.hours;
    if (locale === "cn") return b.hours_cn || b.hours;
    return b.hours || b.hours_th;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const mapQuery = selectedBranch
    ? encodeURIComponent(
        `${displayName(selectedBranch)} ${displayAddress(selectedBranch)}`,
      )
    : "";

  return (
    <>
      {/* Hero */}
      <section
        className="relative z-0 bg-gradient-to-br from-site-accent to-site-accent-hover min-h-[120px] sm:min-h-[140px] lg:min-h-0"
        style={{ aspectRatio: "1440/185" }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight text-white">
              {t.contact.title}
            </h1>
            <p className="mt-3 text-base sm:text-lg font-medium text-white/90">
              {t.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact content */}
      <section className="bg-surface-0 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Branch info + map */}
            <div>
              {/* Branch selector */}
              {branches.length > 1 && (
                <div className="mb-4">
                  <select
                    value={selectedBranch?.id ?? ""}
                    onChange={(e) => {
                      const b = branches.find((br) => br.id === e.target.value);
                      if (b) setSelectedBranch(b);
                    }}
                    className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {displayName(b)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
                {selectedBranch
                  ? displayName(selectedBranch)
                  : t.contact.branchName}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-surface-600">
                {selectedBranch
                  ? displayAddress(selectedBranch)
                  : t.contact.branchAddress}
              </p>

              {selectedBranch && displayHours(selectedBranch) && (
                <p className="mt-1 text-sm text-surface-500">
                  {t.contact.hours}: {displayHours(selectedBranch)}
                </p>
              )}

              {/* Social icons */}
              <div className="mt-4 flex items-center gap-2.5">
                <SocialIcon href="https://lin.ee/mGYJgia">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 10.304C24 4.614 18.627.2 12 .2S0 4.614 0 10.304c0 5.003 4.434 9.192 10.424 9.984.406.088.96.268 1.1.616.126.316.082.81.04 1.128l-.178 1.068c-.054.326-.254 1.276 1.118.696 1.372-.58 7.396-4.356 10.09-7.454C24.22 14.466 24 12.432 24 10.304z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.facebook.com/profile.php?id=61585201603842">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialIcon>
              </div>

              {/* Phone & Google Map */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-6">
                <div>
                  <div className="flex items-center gap-2 text-site-accent">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-bold text-lg">02-6113185</span>
                  </div>
                  <p className="mt-1 text-xs text-surface-500">
                    {t.contact.hours}
                  </p>
                </div>
                <div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-site-accent hover:underline"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-bold text-base">Google Map</span>
                  </a>
                  <p className="mt-1 text-xs text-surface-500">
                    {t.contact.navigate}
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="mt-6 w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E7EB] bg-surface-50">
                <iframe
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={
                    selectedBranch
                      ? displayName(selectedBranch)
                      : "MoneyExchangeTHGroup"
                  }
                />
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-800">
                {t.contact.contactInfo}
              </h2>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                {/* Row: Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {t.contact.nameLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t.contact.namePlaceholder}
                      required
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {t.contact.emailLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.contact.emailPlaceholder}
                      required
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Row: Phone + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {t.contact.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t.contact.phonePlaceholder}
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {t.contact.companyLabel}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder={t.contact.companyPlaceholder}
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    {t.contact.messageLabel}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t.contact.messagePlaceholder}
                    rows={6}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/30 focus:border-site-accent transition-colors resize-none"
                  />
                </div>

                {/* Status messages */}
                {status === "success" && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    {t.contact.success}
                  </div>
                )}
                {status === "error" && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {t.contact.error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-site-accent text-white font-semibold py-3 text-base hover:bg-site-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? t.contact.sending : t.contact.send}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
