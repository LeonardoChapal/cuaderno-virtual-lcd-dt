import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------
 * Enums de dominio
 * ---------------------------------------------------------------------- */

/** Las dos secciones públicas del cuaderno. */
export const sectionEnum = pgEnum("section", [
  "diseno_aplicado",
  "fundamentacion_tecnologica",
]);

/** Subsección dentro de cada sección. */
export const subsectionEnum = pgEnum("subsection", [
  "videos",
  "consultas",
  "planos",
]);

/** Tipo de cada pieza de contenido adjunta a una publicación. */
export const mediaTypeEnum = pgEnum("media_type", [
  "video_upload", // video subido desde el computador (Vercel Blob)
  "youtube", // video incrustado de YouTube (por link)
  "image", // foto subida (Vercel Blob)
  "link", // enlace externo
]);

/* -------------------------------------------------------------------------
 * Tablas
 * ---------------------------------------------------------------------- */

/**
 * Cuenta de administrador. No hay registro público: la única fila se crea
 * con `npm run db:seed` a partir de ADMIN_USERNAME / ADMIN_PASSWORD.
 * La contraseña se guarda siempre hasheada con bcrypt.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_username_idx").on(table.username)],
);

/**
 * Publicación. Vive dentro de una sección + subsección; si la subsección es
 * "planos", `planoSlug` indica a qué plano concreto pertenece
 * (tornillo, proyecto-1, carpeta, ...).
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    body: text("body"),

    section: sectionEnum("section").notNull(),
    subsection: subsectionEnum("subsection").notNull(),
    /** Sólo se usa cuando subsection = "planos". */
    planoSlug: text("plano_slug"),

    published: boolean("published").default(true).notNull(),
    position: integer("position").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("posts_slug_idx").on(table.slug),
    index("posts_section_idx").on(table.section, table.subsection),
    index("posts_plano_idx").on(table.section, table.planoSlug),
  ],
);

/**
 * Cada archivo o enlace adjunto a una publicación. En Postgres sólo se
 * guardan metadatos + URL; los binarios viven en Vercel Blob.
 */
export const postMedia = pgTable(
  "post_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),

    type: mediaTypeEnum("type").notNull(),
    /** URL del Blob, del embed de YouTube o del enlace externo. */
    url: text("url").notNull(),
    label: text("label"),
    /** Nombre original y tamaño en bytes de los archivos subidos. */
    fileName: text("file_name"),
    fileSize: integer("file_size"),
    position: integer("position").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("post_media_post_idx").on(table.postId)],
);

/* -------------------------------------------------------------------------
 * Relaciones
 * ---------------------------------------------------------------------- */

export const postsRelations = relations(posts, ({ many }) => ({
  media: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
}));

/* -------------------------------------------------------------------------
 * Tipos inferidos
 * ---------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostMedia = typeof postMedia.$inferSelect;
export type NewPostMedia = typeof postMedia.$inferInsert;

export type SectionSlug = (typeof sectionEnum.enumValues)[number];
export type SubsectionSlug = (typeof subsectionEnum.enumValues)[number];
export type MediaType = (typeof mediaTypeEnum.enumValues)[number];

export type PostWithMedia = Post & { media: PostMedia[] };
