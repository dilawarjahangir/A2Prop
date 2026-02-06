import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useSmoothScroll = () => {
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const isCoarsePointer =
      window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false;
    if (isCoarsePointer) {
      // On touch devices, prefer native scroll to avoid lockups
      document.documentElement.style.scrollBehavior = 'auto';
      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    // Respect reduced motion: keep native scrolling
    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
      return undefined;
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Animation frame function
    const raf = (time) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };

    // Start the animation loop
    rafIdRef.current = requestAnimationFrame(raf);

    // Pause RAF when tab is hidden to save work
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lenis.stop();
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        lenis.start();
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(raf);
        }
      }
    };

    // Handle anchor links smoothly
    const handleAnchorClick = (e) => {
      const href = e.target.closest('a')?.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -80, // Offset for fixed header
            duration: 1.5,
          });
        }
      }
    };

    // Add click listener for anchor links
    document.addEventListener('click', handleAnchorClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle initial hash in URL (e.g., page load with #section)
    const handleInitialHash = () => {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Small delay to ensure page is fully rendered
          setTimeout(() => {
            lenis.scrollTo(targetElement, {
              offset: -80,
              duration: 1.5,
            });
          }, 100);
        }
      }
    };

    // Handle initial hash on mount
    handleInitialHash();

    // Also handle hash changes (e.g., browser back/forward)
    window.addEventListener('hashchange', handleInitialHash);

    // Cleanup
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
      rafIdRef.current = null;
      document.removeEventListener('click', handleAnchorClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('hashchange', handleInitialHash);
      ScrollTrigger.refresh();
    };
  }, []);

  return lenisRef;
};
