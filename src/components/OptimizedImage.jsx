import React, { useMemo, useState, forwardRef } from "react";

const ABSOLUTE_PROTOCOL = /^https?:\/\//i;

const withBase = (url = "") => {
  if (!url) return "";
  if (ABSOLUTE_PROTOCOL.test(url) || url.startsWith("data:")) return url;

  const base = (import.meta?.env?.BASE_URL ?? "/").replace(/\/+$/, "");
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${base}${clean}`;
};

const formatSrcSet = (value) => {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") return entry;
        if (typeof entry === "object" && entry.src && entry.descriptor) {
          return `${withBase(entry.src)} ${entry.descriptor}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ");
  }

  // Expect a comma-separated list of "url descriptor"
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return null;
        const [url, ...rest] = trimmed.split(/\s+/);
        const descriptor = rest.join(" ");
        return [withBase(url), descriptor].filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .join(", ");
  }

  return undefined;
};

/**
 * Lightweight image helper that standardizes lazy loading, decoding and base path handling.
 * Supports optional <picture> sources to layer AVIF/WebP fallbacks.
 */
const OptimizedImage = forwardRef(
  (
    {
      src,
      alt = "",
      sources = [],
      className,
      imgClassName,
      loading = "lazy",
      decoding = "async",
      fetchPriority,
      sizes,
      width,
      height,
      fallbackSrc,
      ...imgProps
    },
    ref
  ) => {
    const [errored, setErrored] = useState(false);

    const resolvedSrc = useMemo(
      () => withBase(errored && fallbackSrc ? fallbackSrc : src),
      [errored, fallbackSrc, src]
    );

    const resolvedSources = useMemo(
      () =>
        Array.isArray(sources)
          ? sources
              .map((source) => ({
                ...source,
                srcSet: formatSrcSet(source?.srcSet),
              }))
              .filter((s) => Boolean(s.srcSet))
          : [],
      [sources]
    );

    return (
      <picture className={className}>
        {resolvedSources.map(({ srcSet, type, media }, idx) => (
          <source key={idx} srcSet={srcSet} type={type} media={media} sizes={sizes} />
        ))}
        <img
          ref={ref}
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          sizes={sizes}
          width={width}
          height={height}
          className={imgClassName}
          onError={() => {
            if (fallbackSrc && !errored) {
              setErrored(true);
            }
          }}
          {...imgProps}
        />
      </picture>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
