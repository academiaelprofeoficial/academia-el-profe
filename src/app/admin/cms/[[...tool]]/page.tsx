"use client";
import dynamic from "next/dynamic";

const Studio = dynamic(() => import("next-sanity/studio").then((mod) => mod.NextStudio), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "linear-gradient(135deg, #064e3b, #065f46)",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, border: "3px solid rgba(255,255,255,0.2)",
        borderTopColor: "#10b981", borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, fontFamily: "system-ui, sans-serif" }}>
        Cargando CMS...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  ),
});

function StudioGuard({ children }: { children: React.ReactNode }) {
  const hasProjectId = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

  if (!hasProjectId) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "linear-gradient(135deg, #064e3b, #065f46)",
        padding: 32, textAlign: "center", fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 20, padding: "48px 40px", maxWidth: 560, width: "100%",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 style={{ color: "#10b981", fontSize: 22, marginBottom: 16, fontWeight: 700 }}>
            CMS — Sanity Studio
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Para activar el panel de edici&oacute;n visual, configura estas variables en Vercel:
          </p>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "20px 24px",
            textAlign: "left", marginBottom: 24, fontSize: 13, fontFamily: "monospace",
          }}>
            <code style={{ color: "#10b981", display: "block", marginBottom: 8 }}>
              NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
            </code>
            <code style={{ color: "#10b981", display: "block", marginBottom: 8 }}>
              NEXT_PUBLIC_SANITY_DATASET=production
            </code>
            <code style={{ color: "#10b981", display: "block", marginBottom: 8 }}>
              SANITY_API_READ_TOKEN=tu_read_token
            </code>
            <code style={{ color: "#10b981", display: "block" }}>
              NEXT_PUBLIC_SANITY_API_READ_TOKEN=tu_read_token
            </code>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>
            Crea tu proyecto gratuito en{" "}
            <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer"
               style={{ color: "#10b981", textDecoration: "underline" }}>
              sanity.io/manage
            </a>
            {" "}y obt&eacute;n las credenciales en Settings &rarr; API.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function StudioWithConfig() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = require("../../../../../sanity.config");
  return <Studio config={config.default || config} />;
}

export default function AdminCMSPage() {
  return (
    <StudioGuard>
      <StudioWithConfig />
    </StudioGuard>
  );
}