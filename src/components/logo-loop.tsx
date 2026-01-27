"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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
      width?: number;  // if omitted we fallback to <img>
      height?: number; // if omitted we fallback to <img>
      displayHeight?: number;
    };

export interface LogoLoopProps {
  logos?: LogoItem[];                // ← optional now
  speed?: number;
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

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

// Fallback dimensions for images when width/height are not provided
const FALLBACK_IMG_WIDTH = 120;
const FALLBACK_IMG_HEIGHT = 40;

// Narrowing helpers for the LogoItem union
type NodeLogoItem = Extract<LogoItem, { node: React.ReactNode }>;
type ImageLogoItem = Extract<LogoItem, { src: string }>;

const isNodeLogo = (item: LogoItem): item is NodeLogoItem => "node" in item;
const hasDimensions = (
  item: ImageLogoItem
): item is ImageLogoItem & Required<Pick<ImageLogoItem, "width" | "height">> =>
  typeof item.width === "number" && typeof item.height === "number";

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === "number" ? `${value}px` : value ?? undefined;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize);
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
    
  }, dependencies);
};

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    const images = Array.from(
      seqRef.current?.querySelectorAll<HTMLImageElement>("img") ?? []
    );

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) onLoad();
    };

    images.forEach((img) => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener("load", handleImageLoad, { once: true });
        img.addEventListener("error", handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
        img.removeEventListener("error", handleImageLoad);
      });
    };
  }, dependencies);
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = "translate3d(0, 0, 0)";
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);
};

export const LogoLoop = React.memo<LogoLoopProps>(
  ({
    logos = [],                         // ← default to []
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
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const seqRef = useRef<HTMLUListElement>(null);

    const safeLogos = Array.isArray(logos) ? logos.filter(Boolean) : [];

    const [seqWidth, setSeqWidth] = useState<number>(0);
    const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const gapValue = useMemo(() => `${gap}px`, [gap]);

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      const directionMultiplier = direction === "left" ? 1 : -1;
      const speedMultiplier = speed < 0 ? -1 : 1;
      return magnitude * directionMultiplier * speedMultiplier;
    }, [speed, direction]);

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const sequenceWidth = seqRef.current ? seqRef.current.getBoundingClientRect().width : 0;

      if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth));
        const copiesNeeded =
          Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
      }
    }, []);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [safeLogos, gap, logoHeight]);
    useImageLoader(seqRef, updateDimensions, [safeLogos, gap, logoHeight]);
    useAnimationLoop(trackRef, targetVelocity, seqWidth, isHovered, pauseOnHover);

    const cssVariables = useMemo(
      () =>
        ({
          "--logoloop-gap": `${gap}px`,
          "--logoloop-logoHeight": `${logoHeight}px`,
          ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
        }) as React.CSSProperties,
      [gap, logoHeight, fadeOutColor]
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

    const handleMouseEnter = useCallback(() => {
      if (pauseOnHover) setIsHovered(true);
    }, [pauseOnHover]);

    const handleMouseLeave = useCallback(() => {
      if (pauseOnHover) setIsHovered(false);
    }, [pauseOnHover]);

const renderLogoItem = useCallback(
      (item: LogoItem, key: React.Key) => {
        if (isNodeLogo(item)) {
          const content = (
            <span
              className={cx(
                "inline-flex items-center",
                "motion-reduce:transition-none",
                // Tailwind default: scale-110 (scale-120 would need config)
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
                "transition-opacity duration-200 ease-linear",
                "hover:opacity-80",
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

        // Image logo item
        const imgItem = item as ImageLogoItem;
        const computedHeight = imgItem.displayHeight ?? undefined;
        const imageStyle = computedHeight !== undefined ? { height: `${computedHeight}px` } : undefined;

        const content = hasDimensions(imgItem) ? (
          <img
            className={cx(
              "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
              "[-webkit-user-drag:none] pointer-events-none",
              "[image-rendering:-webkit-optimize-contrast]",
              "motion-reduce:transition-none",
              scaleOnHover &&
                "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110"
            )}
            src={imgItem.src}
            sizes={imgItem.sizes}
            width={imgItem.width}
            height={imgItem.height}
            alt={imgItem.alt ?? ""}
            title={imgItem.title}
            loading="lazy"
            draggable={false}
            style={imageStyle}
          />
        ) : (
          <img
            className={cx(
              "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
              "[-webkit-user-drag:none] pointer-events-none",
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
              "transition-opacity duration-200 ease-linear",
              "hover:opacity-80",
              "focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2"
            )}
            href={imgItem.href}
            aria-label={imgItem.alt ?? imgItem.title ?? "logo link"}
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
      },
      [scaleOnHover, gapValue]
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="flex items-center"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
            style={{ gap: gapValue, paddingRight: gapValue }}
          >
            {safeLogos.map((item, itemIndex) =>
              renderLogoItem(item, `${copyIndex}-${itemIndex}`)
            )}
          </ul>
        )),
      [copyCount, safeLogos, renderLogoItem, gapValue]
    );

    // If no logos yet, render just the container (prevents errors during data loading)
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
      <motion.div
        ref={containerRef}
        className={rootClasses}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
          className={cx("flex w-max will-change-transform select-none", "motion-reduce:transform-none")}
          ref={trackRef}
        >
          {logoLists}
        </div>
      </motion.div>
    );
  }
);

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
