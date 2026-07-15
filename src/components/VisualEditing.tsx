import { VisualEditingClient } from "./VisualEditingClient";

// Server component wrapper that delegates to the client component
// which checks window.self !== window.top to ensure the overlay
// ONLY renders inside the CMS Presentation Tool iframe — never
// on the public website, even if draft mode is accidentally active.
export async function VisualEditing() {
  return <VisualEditingClient />;
}
