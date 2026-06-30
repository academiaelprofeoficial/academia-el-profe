import { VisualEditingClient } from "./VisualEditingClient";

// Server component — only rendered when draft mode is active.
// The parent layout.tsx already guards with `isDraftMode && <VisualEditing />`
// so this component will NEVER appear on the public website.
export async function VisualEditing() {
  const { default: VisualEditingComponent } = await import("next-sanity/visual-editing/client-component");
  return <VisualEditingComponent />;
}