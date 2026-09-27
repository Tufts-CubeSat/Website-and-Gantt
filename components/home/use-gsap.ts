"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Header height (h-16); pinned sections start below the fixed header. */
export const HEADER_OFFSET = 64;

/**
 * Runs GSAP setup scoped to `scope` inside a gsap.context so every tween,
 * ScrollTrigger, and matchMedia created in `setup` is reverted on unmount.
 * `setup` may return a cleanup function.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: () => void | (() => void)) {
  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(setup, scope.current);
    return () => ctx.revert();
    // Setup runs once per mount; animations read the DOM, not React state.
  }, []);
}

export { gsap, ScrollTrigger };
