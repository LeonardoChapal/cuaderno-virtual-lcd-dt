import type { CSSProperties } from "react";

/**
 * Proyección ortogonal de un tornillo hexagonal — vista de perfil y vista
 * lateral — que se dibuja sola en el mismo orden en que se traza a mano:
 * primero el eje, luego los contornos, después el detalle (rosca, aristas del
 * hexágono, chaflán) y al final la acotación.
 *
 * Todo el trazado usa `pathLength={1}`, así que cada elemento se anima con la
 * misma escala sin medir longitudes reales.
 */

/** Duración y retardo del trazado de una línea. */
function draw(delay: number, duration = 0.8): CSSProperties {
  return {
    ["--dash" as string]: 1,
    strokeDasharray: 1,
    animation: `trace-in ${duration}s var(--ease-draft) ${delay}s both`,
  };
}

/** Aparición de textos y flechas (elementos rellenos, no trazados). */
function reveal(delay: number): CSSProperties {
  return { animation: `fade-rise 0.5s var(--ease-draft) ${delay}s both` };
}

/**
 * Los ejes llevan patrón de raya-punto, así que no se pueden trazar con
 * `stroke-dashoffset` (el patrón sólo se desplazaría). Se despliegan
 * escalando desde el centro, que es justo como se traza un eje a mano.
 */
function drawAxis(delay: number, axis: "x" | "y", duration = 0.9): CSSProperties {
  return {
    transformBox: "fill-box",
    transformOrigin: "center",
    animation: `axis-${axis} ${duration}s var(--ease-draft) ${delay}s both`,
  };
}

const AXIS = "var(--color-blueline)";
const CONTOUR = "var(--color-cyan)";
const DETAIL = "var(--color-blueline)";
const DIM = "var(--color-amber)";

export default function HeroBlueprint() {
  return (
    <svg
      viewBox="0 0 500 300"
      className="h-auto w-full"
      role="img"
      aria-label="Proyección ortogonal acotada de un tornillo hexagonal M12"
      fill="none"
      strokeLinecap="square"
    >
      {/* ---- 1. Ejes ---------------------------------------------------- */}
      <g stroke={AXIS} strokeWidth="1" opacity="0.9">
        <line
          x1="18"
          y1="150"
          x2="482"
          y2="150"
          strokeDasharray="10 4 2 4"
          style={drawAxis(0, "x", 1.1)}
        />
        <line
          x1="80"
          y1="88"
          x2="80"
          y2="212"
          strokeDasharray="10 4 2 4"
          style={drawAxis(0.25, "y", 0.7)}
        />
      </g>

      {/* ---- 2. Contornos ------------------------------------------------ */}
      <g stroke={CONTOUR} strokeWidth="2" strokeLinejoin="miter">
        {/* Vista lateral: hexágono de la cabeza */}
        <polygon
          points="124,150 102,188 58,188 36,150 58,112 102,112"
          pathLength={1}
          style={draw(0.5, 1)}
          data-draw
        />
        {/* Vista de perfil: cabeza */}
        <rect
          x="180"
          y="106"
          width="52"
          height="88"
          pathLength={1}
          style={draw(0.85, 0.9)}
          data-draw
        />
        {/* Vista de perfil: vástago */}
        <path
          d="M232 132 H452 M232 168 H452 M452 132 V168"
          pathLength={1}
          style={draw(1.15, 1)}
          data-draw
        />
      </g>

      {/* ---- 3. Detalle: rosca, aristas, chaflán ------------------------- */}
      <g stroke={DETAIL} strokeWidth="1">
        {/* Círculo del vástago y 3/4 de circunferencia de la rosca */}
        <circle
          cx="80"
          cy="150"
          r="18"
          pathLength={1}
          style={draw(1.5, 0.6)}
          data-draw
        />
        <path
          d="M80 128 A22 22 0 1 1 58 150"
          pathLength={1}
          style={draw(1.65, 0.6)}
          data-draw
        />
        {/* Aristas del hexágono proyectadas en la vista de perfil */}
        <path
          d="M180 112 H232 M180 188 H232"
          pathLength={1}
          style={draw(1.75, 0.5)}
          data-draw
        />
        {/* Diámetro menor de la rosca */}
        <path
          d="M340 138 H452 M340 162 H452"
          pathLength={1}
          style={draw(1.9, 0.7)}
          data-draw
        />
        {/* Chaflán del extremo */}
        <path
          d="M446 132 L452 138 M446 168 L452 162"
          pathLength={1}
          style={draw(2.15, 0.35)}
          data-draw
        />
        {/* Comienzo de la zona roscada */}
        <path
          d="M340 132 V168"
          pathLength={1}
          style={draw(2.2, 0.3)}
          data-draw
        />
      </g>

      {/* ---- 4. Acotación ------------------------------------------------ */}
      <g stroke={DIM} strokeWidth="1">
        {/* Líneas de referencia */}
        <path
          d="M180 200 V250 M452 176 V250 M340 126 V62 M452 126 V62"
          pathLength={1}
          style={{ ...draw(2.35, 0.5), opacity: 0.55 }}
          data-draw
        />
        {/* Línea de cota: longitud total */}
        <line
          x1="180"
          y1="242"
          x2="452"
          y2="242"
          pathLength={1}
          style={draw(2.5, 0.6)}
          data-draw
        />
        {/* Línea de cota: longitud roscada */}
        <line
          x1="340"
          y1="70"
          x2="452"
          y2="70"
          pathLength={1}
          style={draw(2.65, 0.45)}
          data-draw
        />
        {/* Directriz de la designación */}
        <path
          d="M300 150 L300 96 L268 96"
          pathLength={1}
          style={draw(2.8, 0.45)}
          data-draw
        />
      </g>

      {/* Puntas de flecha */}
      <g fill={DIM}>
        <polygon points="180,242 190,238.5 190,245.5" style={reveal(2.95)} />
        <polygon points="452,242 442,238.5 442,245.5" style={reveal(2.95)} />
        <polygon points="340,70 350,66.5 350,73.5" style={reveal(3)} />
        <polygon points="452,70 442,66.5 442,73.5" style={reveal(3)} />
        <circle cx="300" cy="150" r="3" style={reveal(3.05)} />
      </g>

      {/* ---- 5. Textos --------------------------------------------------- */}
      <g
        fill={DIM}
        fontFamily="var(--font-mono)"
        fontSize="13"
        textAnchor="middle"
      >
        <text x="316" y="236" style={reveal(3.1)}>
          145
        </text>
        <text x="396" y="64" style={reveal(3.15)}>
          36
        </text>
        <text x="262" y="100" textAnchor="end" style={reveal(3.2)}>
          M12 × 1,75
        </text>
      </g>

      <g
        fill="var(--color-blueline)"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="1.6"
        textAnchor="middle"
      >
        <text x="80" y="238" style={reveal(3.3)}>
          VISTA LATERAL
        </text>
        <text x="316" y="278" style={reveal(3.3)}>
          VISTA DE PERFIL — ESC. 1:1
        </text>
      </g>
    </svg>
  );
}
