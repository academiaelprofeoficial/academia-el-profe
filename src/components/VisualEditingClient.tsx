"use client";

// Client component — ONLY renders inside Sanity Studio iframe (CMS Presentation Tool).
// On the public website (no iframe), this returns null even if draft mode cookie exists.
import { useEffect, useState } from "react";
import VisualEditingComponent from "next-sanity/visual-editing/client-component";

export function VisualEditingClient() {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Only render the overlay if we're inside an iframe (CMS Presentation Tool)
    // window.self !== window.top = we are in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      // Cross-origin: if we can't access window.top, we ARE in a cross-origin iframe
      setIsInIframe(true);
    }
  }, []);

  if (!isInIframe) return null;

  return <VisualEditingComponent />;
}