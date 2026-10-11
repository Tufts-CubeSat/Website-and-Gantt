"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Header height (h-16); pinned sections start below the fixed header. */
export const HEADER_OFFSET = 64;

let refreshFrame = 0;
let pageObserver: ResizeObserver | undefined;

/**
 * Re-sorts every ScrollTrigger into page order and recomputes its start/end,
 * at most once per frame. Needed whenever a section rebuilds its triggers
 * (they'd otherwise refresh after the triggers below them and miss the pin
 * spacing above) or the page height changes after the triggers measured it.
 */
export function queueScrollRefresh() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}

/** Late layout shifts (WebGL swapping in, fonts, lazy images) move every trigger below them. */
function observePageHeight() {
  if (pageObserver || typeof ResizeObserver === "undefined") return;
  pageObserver = new ResizeObserver(queueScrollRefresh);
  pageObserver.observe(document.body);
}

/**
 * Runs GSAP setup scoped to `scope` inside a gsap.context so every tween,
 * ScrollTrigger, and matchMedia created in `setup` is reverted on unmount.
 * `setup` may return a cleanup function. Pass `deps` to rebuild when they change.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: () => void | (() => void), deps: DependencyList = []) {
  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(setup, scope.current);
    observePageHeight();
    queueScrollRefresh();
    return () => ctx.revert();
    // Setup reruns only when `deps` change; animations read the DOM, not React state.
  }, deps);
}

export { gsap, ScrollTrigger };
