import { useEffect, useMemo, useRef, useState, useId } from "react";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isDark;
};

// ---- Cached feature checks (do once) ----
let _supportsBackdropFilter;
const supportsBackdropFilter = () => {
  if (_supportsBackdropFilter != null) return _supportsBackdropFilter;
  if (typeof window === "undefined" || typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    _supportsBackdropFilter = false;
  } else {
    _supportsBackdropFilter =
      CSS.supports("backdrop-filter", "blur(10px)") || CSS.supports("-webkit-backdrop-filter", "blur(10px)");
  }
  return _supportsBackdropFilter;
};

let _deviceProfile;
const getDeviceProfile = () => {
  if (_deviceProfile) return _deviceProfile;

  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // heuristic: mobile/coarse -> keep it cheap
  _deviceProfile = { coarse, reduced };
  return _deviceProfile;
};

// Optional: tiny static noise map (cheap-ish) if you want subtle texture.
// It is STATIC and does not regenerate on resize.
const STATIC_NOISE_DATA_URI =
  "data:image/svg+xml," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
  </filter>
  <rect width="120" height="120" filter="url(#n)" opacity=".55"/>
</svg>
`);

const cx = (...p) => p.filter(Boolean).join(" ");

const GlassSurface = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,

  // NEW: quality mode
  // "lite" (default) = fast glass
  // "pro" = enables heavier effects on capable devices only
  quality = "lite",

  // Lite controls
  blur = 10,
  opacity = 0.18,
  saturation = 1.25,

  // Optional texture (off by default)
  texture = false,

  // Styling
  className = "",
  style = {},
}) => {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-lite-filter-${uniqueId}`;

  const containerRef = useRef(null);
  const isDarkMode = useDarkMode();

  const { coarse, reduced } = useMemo(() => getDeviceProfile(), []);

  const canBackdrop = useMemo(() => supportsBackdropFilter(), []);

  // Decide final mode:
  // - reduced motion OR coarse pointer -> force lite
  // - if user asked for pro but device is coarse -> still lite
  const finalQuality = useMemo(() => {
    if (reduced || coarse) return "lite";
    return quality === "pro" ? "pro" : "lite";
  }, [quality, coarse, reduced]);

  // Base dimensions (stable)
  const sizeStyle = useMemo(() => {
    return {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
    };
  }, [width, height, borderRadius]);

  // ✅ FAST styles: 1 backdrop blur + 1 border + 1-2 shadows (NO huge inset stacks)
  const liteStyles = useMemo(() => {
    const bg = isDarkMode ? `rgba(0,0,0,${Math.min(0.35, opacity + 0.12)})` : `rgba(255,255,255,${opacity})`;
    const border = isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.22)";

    const base = {
      ...sizeStyle,
      ...style,
      background: bg,
      border: `1px solid ${border}`,
      boxShadow: isDarkMode
        ? "0 1px 10px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)"
        : "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35)",
      // keep it cheap
      backdropFilter: canBackdrop ? `blur(${blur}px) saturate(${saturation})` : undefined,
      WebkitBackdropFilter: canBackdrop ? `blur(${blur}px) saturate(${saturation})` : undefined,
      overflow: "hidden",
    };

    // Optional static texture layer (cheap compared to displacement + dynamic map)
    if (texture) {
      base.backgroundImage = `url("${STATIC_NOISE_DATA_URI}")`;
      base.backgroundBlendMode = isDarkMode ? "overlay" : "soft-light";
      base.backgroundSize = "140px 140px";
    }

    return base;
  }, [isDarkMode, opacity, blur, saturation, canBackdrop, texture, sizeStyle, style]);

  /**
   * PRO mode:
   * Still avoid your previous approach (dynamic displacement map + many shadows).
   * This "pro" adds a subtle SVG filter on the element itself (NOT backdrop url()).
   * If you need distortion, apply it to an overlay layer, not the backdrop pipeline.
   */
  const proStyles = useMemo(() => {
    // Start from lite
    const base = { ...liteStyles };

    // Slightly richer shadow, but still limited
    base.boxShadow = isDarkMode
      ? "0 10px 30px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)"
      : "0 14px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.45)";

    // If backdrop-filter exists, keep it (that’s the “glass” part).
    // Add an overlay filter on top content only (lighter than backdrop url(#filter)).
    return base;
  }, [liteStyles, isDarkMode]);

  const containerStyles = finalQuality === "pro" ? proStyles : liteStyles;

  return (
    <div
      ref={containerRef}
      className={cx(
        "relative flex items-center justify-center",
        "transition-opacity duration-200 ease-out",
        className
      )}
      style={containerStyles}
    >
      {/* Optional PRO overlay effect (cheap SVG) */}
      {finalQuality === "pro" && (
        <svg className="pointer-events-none absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
              {/* Subtle “softening” without displacement maps */}
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.95 0
                "
                result="m"
              />
              <feBlend in="SourceGraphic" in2="m" mode="screen" />
            </filter>
          </defs>

          {/* Apply filter to a transparent rect so it becomes a subtle overlay */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={borderRadius}
            fill="rgba(255,255,255,0.02)"
            filter={`url(#${filterId})`}
          />
        </svg>
      )}

      <div className="w-full h-full flex items-center justify-center rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
