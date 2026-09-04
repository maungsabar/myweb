"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "zoom" | "none";
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  className?: string;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  className = "",
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  // Determine initial hidden styles based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return "translate-y-10 opacity-0 scale-[0.98]";
      case "down":
        return "-translate-y-10 opacity-0 scale-[0.98]";
      case "left":
        return "translate-x-12 opacity-0";
      case "right":
        return "-translate-x-12 opacity-0";
      case "zoom":
        return "scale-90 opacity-0";
      case "none":
        return "opacity-0";
      default:
        return "translate-y-10 opacity-0";
    }
  };

  const visibleClass = "translate-y-0 translate-x-0 scale-100 opacity-100";

  return (
    <div
      ref={domRef}
      className={`transition-all ease-out ${
        isVisible ? visibleClass : getInitialTransform()
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
