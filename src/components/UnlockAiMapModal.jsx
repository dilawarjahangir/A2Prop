import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phoneRegex = /^[+]?[\d\s\-().]{7,}$/;

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const UnlockAiMapModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    setForm({
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
    });
    setErrors({});
    setSubmitting(false);

    const timer = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [initialData, open]);

  useEffect(() => {
    if (!open) return undefined;

    const trapFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll(focusableSelector);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first) {
          last.focus();
          event.preventDefault();
        }
      } else if (active === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [onClose, open]);

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(form.phone.trim()))
      nextErrors.phone = "Enter a valid phone number.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email.trim()))
      nextErrors.email = "Enter a valid email.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      phoneRegex.test(form.phone.trim()) &&
      emailRegex.test(form.email.trim())
    );
  }, [form.email, form.name, form.phone]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const trimmed = value.trim();
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "name" && trimmed) delete next.name;
      if (name === "phone" && phoneRegex.test(trimmed)) delete next.phone;
      if (name === "email" && emailRegex.test(trimmed.toLowerCase())) delete next.email;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit?.({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-ai-map-title"
            className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#111]/95 px-6 py-6 sm:px-8 sm:py-8 shadow-[0_26px_120px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-white/5" />
            <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-[#7DF5CA]/20 blur-3xl" />
            <div className="absolute -right-12 -bottom-16 h-40 w-40 rounded-full bg-[#7CC7FF]/16 blur-3xl" />

            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                    Secure access
                  </p>
                  <h2
                    id="unlock-ai-map-title"
                    className="text-2xl sm:text-3xl font-semibold text-white"
                  >
                    Unlock the AI Map
                  </h2>
                  <p className="text-sm text-white/65">
                    Share your details to view live Dubai projects, pricing, and availability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/20 bg-white/5 p-2 text-white/80 hover:text-white hover:border-white/40 transition"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm text-white/80" htmlFor="aiMapName">
                    Full name
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="aiMapName"
                    name="name"
                    type="text"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
                    placeholder="Ayesha Rahman"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-sm text-rose-300">{errors.name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80" htmlFor="aiMapPhone">
                      Phone number
                    </label>
                    <input
                      id="aiMapPhone"
                      name="phone"
                      type="tel"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
                      placeholder="+971 5x xxx xxxx"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <p className="text-sm text-rose-300">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80" htmlFor="aiMapEmail">
                      Email
                    </label>
                    <input
                      id="aiMapEmail"
                      name="email"
                      type="email"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-sm text-rose-300">{errors.email}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className={[
                    "w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold",
                    "text-[#111] bg-white",
                    "transition-all duration-200",
                    submitting || !isValid
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_18px_60px_rgba(255,255,255,0.25)]",
                  ].join(" ")}
                >
                  {submitting ? "Submitting..." : "Unlock AI Map"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockAiMapModal;
