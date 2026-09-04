"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track visits on public pages, do not track admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const trackVisit = async () => {
      try {
        await fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathname }),
        });
      } catch {
        // Silently ignore network tracking errors so user experience is never impacted
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // Invisible component
}
