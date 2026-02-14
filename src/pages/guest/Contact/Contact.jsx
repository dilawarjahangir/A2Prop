import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitGeneralLead } from "../../../api/leads.js";

const Contact = () => {
  const { t, i18n } = useTranslation();

  const tx = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback || key : value;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    leadType: "BUY",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      leadType: form.leadType,
      message: form.message.trim() || undefined,
      source: "contact_page",
      language: i18n?.language || "en",
      extraData: { page: "contact_page" },
    };

    if (!payload.name || !payload.email || !payload.phone) {
      setSubmitError("Please fill in name, email and phone.");
      return;
    }

    setSubmitting(true);
    try {
      await submitGeneralLead(payload);
      setSubmitSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        leadType: "BUY",
        message: "",
      });
    } catch (error) {
      setSubmitError(error?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
        <p className="text-sm text-white/60 uppercase tracking-wide">
          {tx("nav.contact", "Contact Us")}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">
          {tx("sections.contact_heading", "Contact Us")}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/70 max-w-3xl">
          Tell us your requirement and our advisors will get back to you quickly with the right options.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-white/50">{tx("sections.contact_office_heading", "Come to our office")}</p>
            <p className="text-white/85">{tx("sections.contact_office_line1", "Office No. 401")}</p>
            <p className="text-white/85">{tx("sections.contact_office_line2", "Building No. 2, Bay Square")}</p>
            <p className="text-white/85">{tx("sections.contact_office_line3", "Business Bay, Dubai, UAE")}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-white/50">{tx("sections.contact_call_label", "Call us")}</p>
            <a
              href="tel:+971588314825"
              className="inline-flex text-white/85 underline-offset-2 hover:underline"
            >
              {tx("sections.contact_phone_display", "+971588314825")}
            </a>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-white/50">{tx("sections.contact_email_label", "Email us")}</p>
            <a
              href="mailto:info@a2properties.ae"
              className="inline-flex text-white/85 underline-offset-2 hover:underline"
            >
              {tx("sections.contact_email_address", "info@a2properties.ae")}
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Inquiry Form</h2>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onFieldChange}
            placeholder={tx("sections.contact_form_name_placeholder", "Your Name")}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onFieldChange}
            placeholder={tx("sections.contact_form_email_placeholder", "Your Email")}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onFieldChange}
            placeholder={tx("sections.contact_form_phone_placeholder", "Your phone number")}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />

          <select
            name="leadType"
            value={form.leadType}
            onChange={onFieldChange}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
          >
            <option value="BUY" className="bg-[#181818] text-white">
              Buy
            </option>
            <option value="RENT" className="bg-[#181818] text-white">
              Rent
            </option>
          </select>

          <textarea
            name="message"
            value={form.message}
            onChange={onFieldChange}
            rows={4}
            placeholder="Tell us your requirement"
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />

          {submitError ? <p className="text-sm text-red-300">{submitError}</p> : null}
          {submitSuccess ? (
            <p className="text-sm text-[#7DF5CA]">Inquiry submitted successfully. We will contact you soon.</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white px-8 text-sm font-semibold text-black shadow"
          >
            {submitting ? "Sending..." : tx("sections.contact_form_send", "Send")}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
