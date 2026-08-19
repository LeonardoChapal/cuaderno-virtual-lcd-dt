import type { SectionSlug, SubsectionSlug } from "@/db/schema";

/* -------------------------------------------------------------------------
 * Identidad del sitio
 * ---------------------------------------------------------------------- */

export const site = {
  name: "Cuaderno Virtual",
  shortName: "CV",
  author: "Leonardo Chapal Díaz",
  school: "I.E.M Técnico Industrial",
  course: "Grado 9-2",
  subject: "Dibujo Técnico · Diseño Aplicado",
  location: "Pasto, Colombia",
  github: "https://github.com/LeonardoChapal",
  whatsapp: "https://wa.me/573193106380",
} as const;

/* -------------------------------------------------------------------------
 * Modelo de navegación
 *
 * `slug`  → segmento de URL          (p. ej. "diseno-aplicado")
 * `value` → valor del enum en la BD  (p. ej. "diseno_aplicado")
 * ---------------------------------------------------------------------- */

export type PlanoItem = {
  slug: string;
  title: string;
  /** Código de lámina que se muestra en la ficha técnica. */
  code: string;
  blurb: string;
};

export type SubsectionDef = {
  slug: SubsectionKey;
  value: SubsectionSlug;
  title: string;
  blurb: string;
};

export type SubsectionKey = "videos" | "consultas" | "planos";

export type SectionDef = {
  slug: string;
  value: SectionSlug;
  index: number;
  title: string;
  tagline: string;
  description: string;
  /** Orden en el que se muestran las subsecciones de esta sección. */
  order: SubsectionKey[];
  planos: PlanoItem[];
};

const SUBSECTIONS: Record<SubsectionKey, SubsectionDef> = {
  videos: {
    slug: "videos",
    value: "videos",
    title: "Videos de apoyo",
    blurb: "Material audiovisual que acompaña y explica cada tema.",
  },
  consultas: {
    slug: "consultas",
    value: "consultas",
    title: "Consultas",
    blurb: "Investigaciones, definiciones y trabajos de consulta.",
  },
  planos: {
    slug: "planos",
    value: "planos",
    title: "Planos",
    blurb: "Láminas, proyectos y ejercicios de trazado.",
  },
};

export const SECTIONS: SectionDef[] = [
  {
    slug: "diseno-aplicado",
    value: "diseno_aplicado",
    index: 1,
    title: "Diseño Aplicado",
    tagline: "Del boceto a la pieza",
    description:
      "Ejercicios de diseño llevados al plano: representación de piezas, perspectivas y proyectos aplicados a la producción.",
    order: ["videos", "consultas", "planos"],
    planos: [
      {
        slug: "planos",
        title: "Planos",
        code: "DA-01",
        blurb: "Láminas base de la asignatura: formatos, rótulos y trazado.",
      },
      {
        slug: "tornillo",
        title: "Tornillo",
        code: "DA-02",
        blurb: "Representación normalizada del tornillo y su rosca.",
      },
      {
        slug: "proyecto-1",
        title: "Proyecto N°1",
        code: "DA-03",
        blurb: "Primer proyecto de diseño aplicado, de la idea al plano.",
      },
      {
        slug: "proyecto-2",
        title: "Proyecto N°2",
        code: "DA-04",
        blurb: "Segundo proyecto: despiece, cotas y conjunto.",
      },
      {
        slug: "tornillo-en-perspectiva",
        title: "Tornillo en perspectiva",
        code: "DA-05",
        blurb: "El mismo tornillo resuelto en perspectiva isométrica.",
      },
    ],
  },
  {
    slug: "fundamentacion-tecnologica",
    value: "fundamentacion_tecnologica",
    index: 2,
    title: "Fundamentación Tecnológica",
    tagline: "La norma y el trazo",
    description:
      "Los fundamentos del dibujo técnico: normalización, vistas, acotación y los procesos industriales que sostienen el plano.",
    order: ["planos", "videos", "consultas"],
    planos: [
      {
        slug: "planos",
        title: "Planos",
        code: "FT-01",
        blurb: "Láminas de fundamentación: normas, líneas y escalas.",
      },
      {
        slug: "tornillo",
        title: "Tornillo",
        code: "FT-02",
        blurb: "Estudio del tornillo desde la normalización.",
      },
      {
        slug: "proyecto",
        title: "Proyecto",
        code: "FT-03",
        blurb: "Proyecto integrador de fundamentación tecnológica.",
      },
      {
        slug: "carpeta",
        title: "Carpeta",
        code: "FT-04",
        blurb: "Carpeta de trabajos: recopilación y presentación.",
      },
      {
        slug: "proyecto-2",
        title: "Proyecto N°2",
        code: "FT-05",
        blurb: "Segundo proyecto con desarrollo y vistas auxiliares.",
      },
      {
        slug: "caldereria",
        title: "Calderería",
        code: "FT-06",
        blurb: "Desarrollos de superficies y trazado para calderería.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------
 * Utilidades de búsqueda
 * ---------------------------------------------------------------------- */

export function getSection(slug: string): SectionDef | undefined {
  return SECTIONS.find((section) => section.slug === slug);
}

export function getSectionByValue(value: SectionSlug): SectionDef | undefined {
  return SECTIONS.find((section) => section.value === value);
}

export function getSubsection(key: SubsectionKey): SubsectionDef {
  return SUBSECTIONS[key];
}

/** Subsecciones de una sección, ya en el orden definido para ella. */
export function getSubsections(section: SectionDef): SubsectionDef[] {
  return section.order.map((key) => SUBSECTIONS[key]);
}

export function getPlano(
  section: SectionDef,
  planoSlug: string,
): PlanoItem | undefined {
  return section.planos.find((plano) => plano.slug === planoSlug);
}

export function subsectionHref(
  section: SectionDef,
  sub: SubsectionKey,
): string {
  return `/${section.slug}/${sub}`;
}

export function planoHref(section: SectionDef, plano: PlanoItem): string {
  return `/${section.slug}/planos/${plano.slug}`;
}

/** Etiquetas legibles para el panel de administración. */
export const SECTION_LABELS: Record<SectionSlug, string> = {
  diseno_aplicado: "Diseño Aplicado",
  fundamentacion_tecnologica: "Fundamentación Tecnológica",
};

export const SUBSECTION_LABELS: Record<SubsectionSlug, string> = {
  videos: "Videos de apoyo",
  consultas: "Consultas",
  planos: "Planos",
};
