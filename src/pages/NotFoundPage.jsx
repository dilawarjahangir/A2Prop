import React from "react";
import { Link } from "react-router-dom";
import GradientButton from "../components/GradientButton.jsx";

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16 relative overflow-hidden text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#101010] via-[#0b0b0b] to-[#050505]" />
      <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#7DF5CA]/10 blur-3xl" />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />

      <div className="max-w-4xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-wide text-white/80">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
            404
          </span>
          Page not found
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
          We couldnâ€™t find the page you were looking for.
        </h1>

        <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
          The address might be mistyped or the page may have moved. Choose an option below to get back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <GradientButton href="/" className="w-full sm:w-auto justify-center">
            Back to homepage
          </GradientButton>
          <Link
            to="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Explore properties
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 hover:text-white hover:border-white/25 transition"
          >
            Learn about A2
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-8 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">Popular</p>
            <Link to="/properties" className="text-sm font-semibold hover:text-white transition">
              View all listings â†’
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">Featured</p>
            <a
              href="https://a2-properties.map.estate/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold hover:text-white transition"
            >
              Explore AI map &rarr;
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-white/60 mb-1">Need help?</p>
            <a
              href="mailto:info@a2properties.ae"
              className="text-sm font-semibold hover:text-white transition"
            >
              Contact our team â†’
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


