import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const useSmoothScroll = () => {
  useEffect(() => {
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

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Animation frame function
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    // Start the animation loop
    rafId = requestAnimationFrame(raf);

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
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('hashchange', handleInitialHash);
      ScrollTrigger.refresh();
    };
  }, []);
};

