"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
}

const STAR_COUNT = 320;

/**
 * Twinkling starfield with depth-based scroll parallax. Reads --home-star so
 * it follows the theme, pauses when offscreen, and draws a single static
 * frame under prefers-reduced-motion.
 */
export function StarfieldCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      depth: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) draw(0);
    };

    function draw(time: number) {
      if (!canvas || !ctx) return;
      const color = getComputedStyle(canvas).getPropertyValue("--home-star").trim() || "#fff";
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const star of stars) {
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
      draw(time);
      if (visible) frame = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reducedMotion) frame = requestAnimationFrame(loop);
    });

    if (!reducedMotion) observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none h-full w-full ${className}`} aria-hidden />;
}
