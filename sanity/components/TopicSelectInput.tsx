"use client";

// ============================================================
// Topic Select — Custom Sanity Input Component
// Shows a dropdown of the course's topics (from the same document)
// so the user can select exactly which topic a video/PDF belongs to.
// Uses useFormValue (form state, includes unsaved) + useClient (API fallback)
// ============================================================

import { useEffect, useState, useMemo, type ComponentType } from "react";
import { useClient, useDocumentStore, type StringInputProps, set, unset } from "sanity";

export const TopicSelectInput: ComponentType<StringInputProps> = function TopicSelectInput(props: StringInputProps) {
  const { onChange, value, documentId } = props;
  const client = useClient();
  const documentStore = useDocumentStore();
  const [apiTopics, setApiTopics] = useState<string[]>([]);

  // ── Strategy 1: useDocumentStore (real-time from document store) ──
  useEffect(() => {
    if (!documentId) return;

    // The documentId could be the raw ID or drafts.xxx — try both
    const rawId = documentId.replace(/^drafts\./, "");
    const draftId = `drafts.${rawId}`;

    const query = `*[_id == $draftId || _id == $rawId][0].topics[].title`;
    const params = { draftId, rawId };

    // Listen for real-time changes
    const sub = documentStore.listen(query, params, (result: string[]) => {
      if (Array.isArray(result) && result.length > 0) {
        setApiTopics(result);
      }
    });

    // Also fetch immediately
    documentStore
      .fetch(query, params)
      .then((result: string[]) => {
        if (Array.isArray(result) && result.length > 0) {
          setApiTopics(result);
        }
      })
      .catch(() => {});

    return () => sub.unsubscribe();
  }, [documentId, documentStore]);

  // ── Strategy 2: useClient API fetch (fallback) ──
  useEffect(() => {
    if (!documentId || apiTopics.length > 0) return; // skip if already have topics

    const rawId = documentId.replace(/^drafts\./, "");
    const draftId = `drafts.${rawId}`;
    const query = `*[_id == $draftId || _id == $rawId][0].topics[].title`;

    client
      .fetch(query, { draftId, rawId })
      .then((result: string[]) => {
        if (Array.isArray(result) && result.length > 0) {
          setApiTopics(result);
        }
      })
      .catch(() => {});
  }, [documentId, client, apiTopics.length]);

  const topicTitles = useMemo(() => {
    // Deduplicate while preserving order
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of apiTopics) {
      if (t && !seen.has(t)) {
        seen.add(t);
        result.push(t);
      }
    }
    return result;
  }, [apiTopics]);

  // ── Fallback: text input when no topics found ──
  if (topicTitles.length === 0) {
    return (
      <div>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value ? set(e.target.value) : unset())}
          placeholder="Escribe el nombre del tema"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid var(--input-border-color, #ddd)",
            fontSize: "0.9em",
            background: "var(--input-bg, #fff)",
            color: "var(--card-fg-color, #000)",
          }}
        />
        <p style={{ color: "var(--card-muted-fg-color, #888)", fontSize: "0.75em", marginTop: 4 }}>
          Primero define los temas del curso en "Temas del Curso" para verlos aquí como opciones desplegables.
        </p>
      </div>
    );
  }

  // ── Main: dropdown select ──
  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? set(e.target.value) : unset())}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "2px solid var(--input-border-color, #10b981)",
          fontSize: "0.95em",
          fontWeight: 500,
          background: "var(--input-bg, #fff)",
          color: "var(--card-fg-color, #000)",
          cursor: "pointer",
          minHeight: "42px",
          appearance: "auto",
          WebkitAppearance: "menulist",
        }}
      >
        <option value="">— Seleccionar tema —</option>
        {topicTitles.map((t) => (
          <option key={t} value={t}>
            📚 {t}
          </option>
        ))}
      </select>
      <p style={{ color: "var(--card-muted-fg-color, #888)", fontSize: "0.75em", marginTop: 4 }}>
        Selecciona el tema. La clase aparecerá desplegada bajo ese módulo en el temario.
      </p>
    </div>
  );
};
