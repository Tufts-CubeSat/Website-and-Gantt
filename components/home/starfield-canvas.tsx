"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
}

/** Star count at a 1440×900 viewport; smaller screens get proportionally fewer, down to MIN_STARS. */
const MAX_STARS = 320;
const REFERENCE_AREA = 1440 * 900;
const MIN_STARS = 110;
/** Matches the WebGL stages: when nothing has moved for a moment, twinkling alone runs at ~30 fps. */
const IDLE_AFTER_MS = 1200;
const IDLE_FRAME_MS = 1000 / 30;

/**
 * Twinkling starfield with depth-based scroll parallax. Reads --home-star so
 * it follows the theme, pauses when offscreen, and draws a single static
 * frame under prefers-reduced-motion.
 *
 * It sits behind the whole page and repaints every frame, so it is kept cheap:
 * the theme color is read only when the theme changes (reading it per frame
 * forced a style recalculation every scrolled frame), phones draw fewer stars,
 * and twinkling alone drops to ~30 fps.
 */
export function StarfieldCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars: Star[] = Array.from({ length: MAX_STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      depth: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let width = 0;
    let height = 0;
    let count = MAX_STARS;
    let frame = 0;
    let visible = true;
    let last = 0;
    let lastActive = performance.now();
    let color = "#fff";
    const readColor = () => {
      color = getComputedStyle(canvas).getPropertyValue("--home-star").trim() || "#fff";
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.round(Math.min(MAX_STARS, Math.max(MIN_STARS, (MAX_STARS * width * height) / REFERENCE_AREA)));
      readColor();
      if (reducedMotion) draw(0);
    };

    function draw(time: number) {
      if (!ctx) return;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        const y = (((star.y * height - scroll * star.depth * 0.35) % height) + height) % height;
        const twinkle = reducedMotion ? 1 : 0.55 + 0.45 * Math.sin(time * 0.0012 * star.depth + star.phase);
        ctx.globalAlpha = twinkle * star.depth;
        ctx.beginPath();
        ctx.arc(star.x * width, y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - lastActive > IDLE_AFTER_MS && time - last < IDLE_FRAME_MS) return;
      last = time;
      draw(time);
    };
    const markActive = () => {
      lastActive = performance.now();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", markActive, { passive: true });

    // The theme toggle flips a class on <html>; re-read the color only then.
    const themeObserver = new MutationObserver(() => {
      readColor();
      if (reducedMotion) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reducedMotion) frame = requestAnimationFrame(loop);
    });

    if (!reducedMotion) observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", markActive);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none h-full w-full ${className}`} aria-hidden />;
}
