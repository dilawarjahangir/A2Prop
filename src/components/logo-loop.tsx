"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string; // remote URL or /public path
      alt?: string;
      href?: string;
      title?: string;
      sizes?: string;
      width?: number;
      height?: number;
      displayHeight?: number;
    };

export interface LogoLoopProps {
  logos?: LogoItem[];
  speed?: number; // px/sec
  direction?: "left" | "right";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FALLBACK_IMG_WIDTH = 120;
const FALLBACK_IMG_HEIGHT = 40;
const MAX_COPIES = 6; // bounded for perf; 9–10 logos should usually stay <= 4

// Narrowing helpers for the LogoItem union
type NodeLogoItem = Extract<LogoItem, { node: React.ReactNode }>;
type ImageLogoItem = Extract<LogoItem, { src: string }>;

const isNodeLogo = (item: LogoItem): item is NodeLogoItem => "node" in item;

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === "number" ? `${value}px` : value ?? undefined;

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!m) return;
    const onChange = () => setReduced(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** Small perf win: pause animation when offscreen */
function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export const LogoLoop = React.memo<LogoLoopProps>(function LogoLoop({
  logos = [],
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover = true,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  ariaLabel = "Partner logos",
  className,
  style,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const safeLogos = useMemo(() => (Array.isArray(logos) ? logos.filter(Boolean) : []), [logos]);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(containerRef);

  const [seqWidth, setSeqWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);
  const [hovered, setHovered] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const gapValue = useMemo(() => `${gap}px`, [gap]);

  // Duration = distance / speed. Distance is exactly seqWidth (one full cycle).
  const absSpeed = Math.max(0.001, Math.abs(speed));
  const durationSeconds = useMemo(() => (seqWidth > 0 ? seqWidth / absSpeed : 1), [seqWidth, absSpeed]);

  // CSS variables
  const cssVariables = useMemo(
    () =>
      ({
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        "--logoloop-seqWidth": `${seqWidth}px`,
        "--logoloop-duration": `${durationSeconds}s`,
        ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
      }) as React.CSSProperties,
    [gap, logoHeight, seqWidth, durationSeconds, fadeOutColor]
  );

  const rootClasses = useMemo(
    () =>
      cx(
        "relative overflow-x-hidden group",
        "[--logoloop-gap:32px]",
        "[--logoloop-logoHeight:28px]",
        "[--logoloop-fadeColorAuto:#ffffff]",
        "dark:[--logoloop-fadeColorAuto:#0b0b0b]",
        scaleOnHover && "py-[calc(var(--logoloop-logoHeight)*0.1)]",
        className
      ),
    [scaleOnHover, className]
  );

  const containerStyle = useMemo(
    (): React.CSSProperties => ({
      width: toCssLength(width) ?? "100%",
      ...cssVariables,
      ...style,
    }),
    [width, cssVariables, style]
  );

  // Track hover for pause
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setHovered(true);
  }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setHovered(false);
  }, [pauseOnHover]);

  // Wait for images (first sequence only) so measurements are correct
  useEffect(() => {
    setImagesLoaded(false);
  }, [safeLogos]);

  useEffect(() => {
    const root = seqRef.current;
    if (!root) {
      setImagesLoaded(true);
      return;
    }

    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    if (imgs.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let remaining = imgs.length;
    const done = () => {
      remaining -= 1;
      if (remaining <= 0) setImagesLoaded(true);
    };

    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    };
  }, [safeLogos]);

  const measure = useCallback(() => {
    const cw = containerRef.current?.clientWidth ?? 0;
    const sw = seqRef.current?.getBoundingClientRect().width ?? 0;

    setContainerWidth(cw);
    setSeqWidth(sw > 0 ? Math.ceil(sw) : 0);
  }, []);

  // Measure after layout (and after images load)
  useLayoutEffect(() => {
    if (!imagesLoaded) return;
    measure();
  }, [imagesLoaded, measure, gap, logoHeight]);

  // ResizeObserver (throttled)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof ResizeObserver === "undefined") {
      const onResize = () => measure();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });

    ro.observe(el);
    if (seqRef.current) ro.observe(seqRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  // Compute minimal copies so there is NEVER a gap:
  // totalWidth >= containerWidth + seqWidth (one extra sequence)
  useEffect(() => {
    if (!seqWidth || !containerWidth) return;
    const needed = Math.ceil((containerWidth + seqWidth) / seqWidth);
    setCopyCount(Math.min(Math.max(2, needed), MAX_COPIES));
  }, [seqWidth, containerWidth]);

  const shouldAnimate =
    safeLogos.length > 0 &&
    seqWidth > 0 &&
    inView &&
    !reducedMotion &&
    absSpeed > 0 &&
    !(pauseOnHover && hovered);

  const renderLogoItem = useCallback(
    (item: LogoItem, key: React.Key) => {
      if (isNodeLogo(item)) {
        const content = (
          <span
            className={cx(
              "inline-flex items-center",
              "motion-reduce:transition-none",
              scaleOnHover &&
                "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110"
            )}
            aria-hidden={Boolean(item.href) && !item.ariaLabel}
          >
            {item.node}
          </span>
        );

        const inner = item.href ? (
          <a
            className={cx(
              "inline-flex items-center no-underline rounded",
              "transition-opacity duration-200 ease-linear hover:opacity-80",
              "focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2"
            )}
            href={item.href}
            aria-label={item.ariaLabel ?? item.title ?? "logo link"}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        );

        return (
          <li
            className={cx(
              "flex-none text-[length:var(--logoloop-logoHeight)] leading-[1]",
              scaleOnHover && "overflow-visible group/item"
            )}
            key={key}
            role="listitem"
          >
            {inner}
          </li>
        );
      }

      const imgItem = item as ImageLogoItem;
      const computedHeight = imgItem.displayHeight ?? undefined;
      const imageStyle = computedHeight !== undefined ? { height: `${computedHeight}px` } : undefined;

      const image = (
        <img
          className={cx(
            "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
            "[-webkit-user-drag:none]",
            // Only disable pointer-events if not wrapped with a link
            !imgItem.href && "pointer-events-none",
            "[image-rendering:-webkit-optimize-contrast]",
            "motion-reduce:transition-none",
            scaleOnHover &&
              "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110"
          )}
          src={imgItem.src}
          sizes={imgItem.sizes}
          width={imgItem.width ?? FALLBACK_IMG_WIDTH}
          height={imgItem.height ?? FALLBACK_IMG_HEIGHT}
          alt={imgItem.alt ?? ""}
          title={imgItem.title}
          loading="lazy"
          draggable={false}
          style={imageStyle}
        />
      );

      const inner = imgItem.href ? (
        <a
          className={cx(
            "inline-flex items-center no-underline rounded",
            "transition-opacity duration-200 ease-linear hover:opacity-80",
            "focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2"
          )}
          href={imgItem.href}
          aria-label={imgItem.alt ?? imgItem.title ?? "logo link"}
          target="_blank"
          rel="noreferrer noopener"
        >
          {image}
        </a>
      ) : (
        image
      );

      return (
        <li
          className={cx(
            "flex-none text-[length:var(--logoloop-logoHeight)] leading-[1]",
            scaleOnHover && "overflow-visible group/item"
          )}
          key={key}
          role="listitem"
        >
          {inner}
        </li>
      );
    },
    [scaleOnHover]
  );

  // Render empty container if no logos
  if (safeLogos.length === 0) {
    return (
      <div
        ref={containerRef}
        className={rootClasses}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={rootClasses}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Marquee keyframes: always travel exactly one sequence width. */}
      <style>{`
        @keyframes logoloop-marquee {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(calc(-1 * var(--logoloop-seqWidth)),0,0); }
        }
      `}</style>

      {fadeOut && (
        <>
          <div
            aria-hidden
            className={cx(
              "pointer-events-none absolute inset-y-0 left-0 z-[1]",
              "w-[clamp(24px,8%,120px)]",
              "bg-[linear-gradient(to_right,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
            )}
          />
          <div
            aria-hidden
            className={cx(
              "pointer-events-none absolute inset-y-0 right-0 z-[1]",
              "w-[clamp(24px,8%,120px)]",
              "bg-[linear-gradient(to_left,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
            )}
          />
        </>
      )}

      <div
        className={cx(
          "flex w-max will-change-transform select-none",
          // optional modern perf: avoids painting/layout work offscreen
          "[content-visibility:auto]"
        )}
        style={{
          animationName: shouldAnimate ? "logoloop-marquee" : "none",
          animationDuration: `var(--logoloop-duration)`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: direction === "left" ? "normal" : "reverse",
          animationPlayState: pauseOnHover && hovered ? "paused" : "running",
        }}
      >
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="flex items-center"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
            style={{ gap: gapValue, paddingRight: gapValue }}
          >
            {safeLogos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
          </ul>
        ))}
      </div>
    </div>
  );
});

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
