"use client";

// ============================================================
// Color Picker — Custom Sanity Input Component
// Visual color picker with preset color swatches + RGB sliders.
// Replaces the plain hex string input for course cardColor.
// ============================================================

import { useState, useCallback, type ComponentType } from "react";
import { type StringInputProps, set } from "sanity";
import { ChevronDownIcon } from "@sanity/icons";

/** Preset color palette — covers the most common course themes */
const PRESET_COLORS = [
  { name: "Verde", hex: "#10B981" },
  { name: "Verde Oscuro", hex: "#059669" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Azul Oscuro", hex: "#1D4ED8" },
  { name: "Rojo", hex: "#EF4444" },
  { name: "Rojo Oscuro", hex: "#B91C1C" },
  { name: "Amarillo", hex: "#F59E0B" },
  { name: "Amarillo Claro", hex: "#FBBF24" },
  { name: "Naranja", hex: "#F97316" },
  { name: "Morado", hex: "#8B5CF6" },
  { name: "Rosa", hex: "#EC4899" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Negro", hex: "#1F2937" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Blanco", hex: "#F9FAFB" },
  { name: "Verde Lima", hex: "#84CC16" },
];

/** Strip invisible Unicode chars that corrupt CSS hex values */
function cleanHex(hex: string): string {
  return hex.replace(/[^0-9a-fA-F#]/g, '');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = cleanHex(hex).replace("#", "");
  if (raw.length !== 6) return null;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  if ([r, g, b].some((v) => isNaN(v))) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  ).toUpperCase();
}

export const ColorPickerInput: ComponentType<StringInputProps> = function ColorPickerInput(props: StringInputProps) {
  const { value = "", onChange, readOnly, schemaType } = props;
  const [isOpen, setIsOpen] = useState(false);
  const rgb = hexToRgb(value) || { r: 16, g: 185, b: 129 };

  const commit = useCallback(
    (hex: string) => {
      onChange(set(hex));
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (hex: string) => {
      commit(hex);
    },
    [commit]
  );

  const handleSliderChange = useCallback(
    (channel: "r" | "g" | "b", val: number) => {
      const updated = { ...rgb, [channel]: val };
      commit(rgbToHex(updated.r, updated.g, updated.b));
    },
    [rgb, commit]
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Trigger button — shows current color swatch + hex */}
      <button
        type="button"
        onClick={() => !readOnly && setIsOpen(!isOpen)}
        disabled={readOnly}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          padding: "8px 12px",
          border: "1px solid var(--sanity-colors--border)",
          borderRadius: "6px",
          background: "var(--sanity-colors--input-bg)",
          cursor: readOnly ? "default" : "pointer",
          fontSize: "14px",
          color: "var(--sanity-colors--text)",
          textAlign: "left",
        }}
      >
        {/* Color swatch */}
        <span
          style={{
            display: "inline-block",
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: cleanHex(value) || "#10B981",
            border: "2px solid var(--sanity-colors--border)",
            flexShrink: 0,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)`,
          }}
        />
        {/* Hex value */}
        <span style={{ flex: 1, fontFamily: "monospace", fontSize: "14px", letterSpacing: "0.5px" }}>
          {(cleanHex(value) || "#10B981").toUpperCase()}
        </span>
        {/* Dropdown arrow */}
        {!readOnly && (
          <ChevronDownIcon
            style={{
              width: "18px",
              height: "18px",
              opacity: 0.5,
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
            }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && !readOnly && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "var(--sanity-colors--card-bg, #1c1c1c)",
            border: "1px solid var(--sanity-colors--border, #333)",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            minWidth: "320px",
          }}
        >
          {/* Preview bar */}
          <div
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "8px",
              backgroundColor: cleanHex(value) || "#10B981",
              marginBottom: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />

          {/* Section: Preset Colors */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--sanity-colors--label, #999)",
                marginBottom: "8px",
              }}
            >
              Colores Predefinidos
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: "6px",
              }}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => handlePresetClick(c.hex)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "6px",
                    backgroundColor: c.hex,
                    border: cleanHex(value).toUpperCase() === c.hex.toUpperCase() ? "3px solid white" : "2px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "transform 0.1s ease, border-color 0.1s ease",
                    transform: cleanHex(value).toUpperCase() === c.hex.toUpperCase() ? "scale(1.15)" : "scale(1)",
                    boxShadow:
                      cleanHex(value).toUpperCase() === c.hex.toUpperCase()
                        ? "0 0 0 2px rgba(59,130,246,0.6)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    const isCurrent = cleanHex(value).toUpperCase() === c.hex.toUpperCase();
                    (e.currentTarget as HTMLElement).style.transform = isCurrent ? "scale(1.15)" : "scale(1)";
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "var(--sanity-colors--border, #333)",
              margin: "0 0 16px 0",
            }}
          />

          {/* Section: RGB Sliders */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--sanity-colors--label, #999)",
                marginBottom: "12px",
              }}
            >
              Color Personalizado (RGB)
            </div>

            {(["r", "g", "b"] as const).map((channel) => {
              const labels = { r: "Rojo", g: "Verde", b: "Azul" };
              const channelColors = { r: "#EF4444", g: "#22C55E", b: "#3B82F6" };
              return (
                <div key={channel} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      backgroundColor: channelColors[channel],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      width: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: channelColors[channel],
                      flexShrink: 0,
                    }}
                  >
                    {channel.toUpperCase()}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb[channel]}
                    onChange={(e) => handleSliderChange(channel, parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: "6px",
                      accentColor: channelColors[channel],
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[channel]}
                    onChange={(e) => handleSliderChange(channel, parseInt(e.target.value) || 0)}
                    style={{
                      width: "52px",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--sanity-colors--border, #333)",
                      background: "var(--sanity-colors--input-bg, #222)",
                      color: "var(--sanity-colors--text, #fff)",
                      fontSize: "12px",
                      textAlign: "center",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              );
            })}

            {/* Hex display */}
            <div
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.05)",
                fontFamily: "monospace",
                fontSize: "14px",
                color: "var(--sanity-colors--text, #fff)",
                textAlign: "center",
                letterSpacing: "1px",
              }}
            >
              {rgbToHex(rgb.r, rgb.g, rgb.b)}
            </div>
          </div>
        </div>
      )}

      {/* Click-away overlay to close dropdown */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};