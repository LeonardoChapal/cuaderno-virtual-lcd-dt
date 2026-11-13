import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

/**
 * Vista previa por defecto del sitio (1200×630) al compartir un enlace:
 * una lámina de cianotipia con rótulo. Se genera una sola vez en el build.
 */
export const alt = `${site.name} · ${site.subject}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FERRO = "#06121f";
const PRUSSIAN = "#0c2038";
const BLUELINE = "#2e6e9e";
const CYAN = "#5fd3f3";
const CHALK = "#e8f1f8";
const AMBER = "#ffa724";
const LABEL = "#5d9ac6";

function Tick({ pos }: { pos: "tl" | "br" }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 48,
        height: 48,
        ...(pos === "tl"
          ? { top: 36, left: 36, borderTop: `6px solid ${AMBER}`, borderLeft: `6px solid ${AMBER}` }
          : { bottom: 36, right: 36, borderBottom: `6px solid ${AMBER}`, borderRight: `6px solid ${AMBER}` }),
      }}
    />
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 96px",
          background: FERRO,
          backgroundImage: `linear-gradient(${BLUELINE}33 1px, transparent 1px), linear-gradient(90deg, ${BLUELINE}33 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          color: CHALK,
          position: "relative",
        }}
      >
        <Tick pos="tl" />
        <Tick pos="br" />

        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: AMBER }}>
          {site.school.toUpperCase()} · {site.course.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: 4 }}>
            CUADERNO
          </div>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: 4, color: CYAN }}>
            VIRTUAL
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              height: 3,
              width: 360,
              background: AMBER,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "18px 24px",
            background: PRUSSIAN,
            border: `2px solid ${BLUELINE}`,
            fontSize: 28,
            color: LABEL,
          }}
        >
          <div style={{ display: "flex" }}>{site.subject}</div>
          <div style={{ display: "flex", color: CHALK }}>{site.author}</div>
        </div>
      </div>
    ),
    size,
  );
}
