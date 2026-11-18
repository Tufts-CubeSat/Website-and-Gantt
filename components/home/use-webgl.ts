"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

let lastScroll = 0;
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true });
}

/** Quiet time required before a scene may build in the background. */
const SCROLL_QUIET_MS = 800;

/**
 * Becomes true (and stays true) when a WebGL scene should build: in a quiet
 * moment after the page has loaded, or as a fallback once the element is
 * within about one screen of the viewport. Building blocks the main thread for
 * a few hundred ms, so it should land while the visitor is reading, not at
 * page load or in the middle of a scroll.
 */
export function useSceneTrigger(ref: RefObject<HTMLElement | null>, idleDelay: number) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || go) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setGo(true);
      },
      { rootMargin: "100% 0px" }
    );
    observer.observe(el);

    let timer = 0;
    let idle = 0;
    const attempt = () => {
      if (performance.now() - lastScroll < SCROLL_QUIET_MS) {
        timer = window.setTimeout(attempt, SCROLL_QUIET_MS);
        return;
      }
      setGo(true);
    };
    const schedule = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(attempt, { timeout: 2000 });
        else attempt();
      }, idleDelay);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("load", schedule);
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [ref, go, idleDelay]);
  return go;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

let webglSupport: boolean | undefined;

function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      webglSupport = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True when the homepage should render its WebGL scenes: WebGL2 is available
 * and the visitor hasn't asked for reduced motion. Always false on the server,
 * so the SVG illustrations are what renders first and what no-JS visitors see.
 */
export function useWebGLScenes() {
  return useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(REDUCED_MOTION).matches && supportsWebGL(),
    () => false
  );
}
