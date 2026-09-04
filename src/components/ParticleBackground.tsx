"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
  pulseSpeed: number;
}

interface BokehOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle color palette matching blue/cyan/indigo dark theme
    const colors = [
      "rgba(59, 130, 246, ",  // blue-500
      "rgba(96, 165, 250, ",  // blue-400
      "rgba(99, 102, 241, ",  // indigo-500
      "rgba(56, 189, 248, ",  // sky-400
      "rgba(147, 197, 253, ", // blue-300
    ];

    // Generate Floating Bokeh Orbs (large background glow)
    const bokehOrbs: BokehOrb[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 120 + 80,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.12 + 0.05,
    }));

    // Generate Floating Particles
    const particleCount = Math.min(Math.floor(width / 25), 55);
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const baseAlpha = Math.random() * 0.5 + 0.2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.15, // float upwards gently
        alpha: baseAlpha,
        targetAlpha: baseAlpha,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      };
    });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Bokeh Orbs
      bokehOrbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        gradient.addColorStop(0, `${orb.color}${orb.alpha})`);
        gradient.addColorStop(1, `${orb.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Floating Glowing Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Smooth pulse alpha
        p.alpha += (p.targetAlpha - p.alpha) * p.pulseSpeed;
        if (Math.abs(p.targetAlpha - p.alpha) < 0.02) {
          p.targetAlpha = Math.random() * 0.6 + 0.15;
        }

        // Wrap around screen boundaries smoothly
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Particle core glow
        const glowRadius = p.radius * 3.5;
        const radialGradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          glowRadius
        );
        radialGradient.addColorStop(0, `${p.color}${p.alpha})`);
        radialGradient.addColorStop(0.4, `${p.color}${p.alpha * 0.4})`);
        radialGradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid crisp center point
        ctx.fillStyle = `${p.color}${Math.min(p.alpha + 0.3, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-80"
    />
  );
}
