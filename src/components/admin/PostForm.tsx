"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { MediaType, PostWithMedia } from "@/db/schema";
import { SECTIONS, SECTION_LABELS, SUBSECTION_LABELS } from "@/lib/site";
import { formatBytes } from "@/lib/slug";
import { youtubeId } from "@/lib/youtube";

import type { ActionState } from "@/app/admin/actions";

type MediaDraft = {
  key: string;
  type: MediaType;
  url: string;
  label: string;
  fileName?: string;
  fileSize?: number;
  /** Progreso 0-100 mientras se sube a Vercel Blob. */
  progress?: number;
  error?: string;
};

const TYPE_LABELS: Record<MediaType, string> = {
  youtube: "Video de YouTube",
  video_upload: "Video subido",
  image: "Foto",
  link: "Enlace externo",
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tag border border-amber bg-amber px-6 py-3.5 text-ferro transition-colors hover:bg-transparent hover:text-amber disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

const fieldClass =
  "w-full border border-blueline/50 bg-ferro px-3.5 py-2.5 text-sm text-chalk outline-none transition-colors focus:border-cyan";
const labelClass = "tag mb-2 block text-blueline";

export default function PostForm({
  post,
  action,
  submitLabel,
}: {
  post?: PostWithMedia;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  const [sectionValue, setSectionValue] = useState(
    post?.section ?? SECTIONS[0].value,
  );
  const [subsection, setSubsection] = useState(post?.subsection ?? "videos");
  const [planoSlug, setPlanoSlug] = useState(post?.planoSlug ?? "");
  const [media, setMedia] = useState<MediaDraft[]>(
    () =>
      post?.media.map((item) => ({
        key: item.id,
        type: item.type,
        url: item.url,
        label: item.label ?? "",
        fileName: item.fileName ?? undefined,
        fileSize: item.fileSize ?? undefined,
      })) ?? [],
  );

  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const currentSection = useMemo(
    () => SECTIONS.find((item) => item.value === sectionValue) ?? SECTIONS[0],
    [sectionValue],
  );

  // Los adjuntos que aún se están subiendo no deben guardarse.
  const uploading = media.some((item) => item.progress !== undefined);

  const serializedMedia = JSON.stringify(
    media
      .filter((item) => item.url && item.progress === undefined)
      .map((item) => ({
        type: item.type,
        url: item.url,
        label: item.label || null,
        fileName: item.fileName ?? null,
        fileSize: item.fileSize ?? null,
      })),
  );

  function addMedia(type: MediaType) {
    setMedia((items) => [
      ...items,
      { key: newKey(), type, url: "", label: "" },
    ]);
  }

  function updateMedia(key: string, patch: Partial<MediaDraft>) {
    setMedia((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function removeMedia(key: string) {
    setMedia((items) => items.filter((item) => item.key !== key));
  }

  function move(key: string, direction: -1 | 1) {
    setMedia((items) => {
      const index = items.findIndex((item) => item.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  /** Sube el archivo directo del navegador a Vercel Blob. */
  async function handleFiles(files: FileList | null, type: MediaType) {
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const key = newKey();
      setMedia((items) => [
        ...items,
        {
          key,
          type,
          url: "",
          label: file.name,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
        },
      ]);

      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: true,
          onUploadProgress: ({ percentage }) => {
            updateMedia(key, { progress: Math.round(percentage) });
          },
        });
        updateMedia(key, { url: blob.url, progress: undefined });
      } catch (error) {
        updateMedia(key, {
          progress: undefined,
          error:
            error instanceof Error
              ? error.message
              : "No se pudo subir el archivo.",
        });
      }
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="media" value={serializedMedia} />

      {/* ---- Datos de la publicación ------------------------------------ */}
      <section className="border border-blueline/40 bg-prussian/85 p-5">
        <h2 className="tag mb-5 text-amber">Datos</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Título
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="summary" className={labelClass}>
              Resumen
            </label>
            <input
              id="summary"
              name="summary"
              defaultValue={post?.summary ?? ""}
              placeholder="Una línea que explique de qué trata"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="body" className={labelClass}>
              Contenido
            </label>
            <textarea
              id="body"
              name="body"
              rows={6}
              defaultValue={post?.body ?? ""}
              className={`${fieldClass} resize-y`}
            />
          </div>
        </div>
      </section>

      {/* ---- Ubicación en el sitio -------------------------------------- */}
      <section className="border border-blueline/40 bg-prussian/85 p-5">
        <h2 className="tag mb-5 text-amber">Donde se publica</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="section" className={labelClass}>
              Sección
            </label>
            <select
              id="section"
              name="section"
              value={sectionValue}
              onChange={(event) => {
                setSectionValue(event.target.value as typeof sectionValue);
                setPlanoSlug("");
              }}
              className={fieldClass}
            >
              {SECTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {SECTION_LABELS[item.value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subsection" className={labelClass}>
              Subsección
            </label>
            <select
              id="subsection"
              name="subsection"
              value={subsection}
              onChange={(event) =>
                setSubsection(event.target.value as typeof subsection)
              }
              className={fieldClass}
            >
              {(["videos", "consultas", "planos"] as const).map((value) => (
                <option key={value} value={value}>
                  {SUBSECTION_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {subsection === "planos" ? (
            <div className="sm:col-span-2">
              <label htmlFor="planoSlug" className={labelClass}>
                Plano de {currentSection.title}
              </label>
              <select
                id="planoSlug"
                name="planoSlug"
                value={planoSlug}
                onChange={(event) => setPlanoSlug(event.target.value)}
                required
                className={fieldClass}
              >
                <option value="">Elige un plano…</option>
                {currentSection.planos.map((plano) => (
                  <option key={plano.slug} value={plano.slug}>
                    {plano.code} — {plano.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="position" className={labelClass}>
              Orden
            </label>
            <input
              id="position"
              name="position"
              type="number"
              defaultValue={post?.position ?? 0}
              className={fieldClass}
            />
          </div>

          <label className="flex items-end gap-3 pb-2.5 text-sm text-chalk">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post?.published ?? true}
              className="h-4 w-4 accent-[var(--color-amber)]"
            />
            Visible en el sitio público
          </label>
        </div>
      </section>

      {/* ---- Adjuntos ---------------------------------------------------- */}
      <section className="border border-blueline/40 bg-prussian/85 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="tag text-amber">Adjuntos</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addMedia("youtube")}
              className="tag border border-blueline/50 px-3 py-2 text-graphite transition-colors hover:border-cyan hover:text-cyan"
            >
              + YouTube
            </button>
            <button
              type="button"
              onClick={() => addMedia("link")}
              className="tag border border-blueline/50 px-3 py-2 text-graphite transition-colors hover:border-cyan hover:text-cyan"
            >
              + Enlace
            </button>
            <button
              type="button"
              onClick={() => imageInput.current?.click()}
              className="tag border border-blueline/50 px-3 py-2 text-graphite transition-colors hover:border-cyan hover:text-cyan"
            >
              + Fotos
            </button>
            <button
              type="button"
              onClick={() => videoInput.current?.click()}
              className="tag border border-blueline/50 px-3 py-2 text-graphite transition-colors hover:border-cyan hover:text-cyan"
            >
              + Video
            </button>
          </div>
        </div>

        <input
          ref={imageInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            void handleFiles(event.target.files, "image");
            event.target.value = "";
          }}
        />
        <input
          ref={videoInput}
          type="file"
          accept="video/*"
          hidden
          onChange={(event) => {
            void handleFiles(event.target.files, "video_upload");
            event.target.value = "";
          }}
        />

        {media.length === 0 ? (
          <p className="border border-dashed border-blueline/40 px-4 py-8 text-center text-sm text-graphite">
            Sin adjuntos. Agrega un video de YouTube, sube fotos o un video
            desde tu computador, o pega un enlace.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {media.map((item, index) => {
              const badYoutube =
                item.type === "youtube" && item.url && !youtubeId(item.url);

              return (
                <li
                  key={item.key}
                  className="border border-blueline/40 bg-ferro/90 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="tag text-cyan">
                      {String(index + 1).padStart(2, "0")} ·{" "}
                      {TYPE_LABELS[item.type]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(item.key, -1)}
                        disabled={index === 0}
                        aria-label="Subir en la lista"
                        className="tag px-2 py-1 text-graphite transition-colors hover:text-cyan disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(item.key, 1)}
                        disabled={index === media.length - 1}
                        aria-label="Bajar en la lista"
                        className="tag px-2 py-1 text-graphite transition-colors hover:text-cyan disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.key)}
                        className="tag px-2 py-1 text-graphite transition-colors hover:text-amber"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {item.progress !== undefined ? (
                    <div>
                      <div className="mb-2 h-1 w-full bg-blueline/30">
                        <div
                          className="h-full bg-amber transition-[width]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="tag text-graphite">
                        Subiendo {item.fileName} — {item.progress}%
                        {item.fileSize
                          ? ` de ${formatBytes(item.fileSize)}`
                          : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.type === "image" || item.type === "video_upload" ? (
                        <p className="tag break-all text-graphite">
                          {item.fileName ?? item.url}
                          {item.fileSize
                            ? ` · ${formatBytes(item.fileSize)}`
                            : ""}
                        </p>
                      ) : (
                        <input
                          value={item.url}
                          onChange={(event) =>
                            updateMedia(item.key, { url: event.target.value })
                          }
                          placeholder={
                            item.type === "youtube"
                              ? "https://www.youtube.com/watch?v=…"
                              : "https://…"
                          }
                          className={fieldClass}
                        />
                      )}

                      <input
                        value={item.label}
                        onChange={(event) =>
                          updateMedia(item.key, { label: event.target.value })
                        }
                        placeholder="Título del adjunto (opcional)"
                        className={fieldClass}
                      />
                    </div>
                  )}

                  {badYoutube ? (
                    <p className="tag mt-2 text-amber">
                      Ese enlace no parece un video de YouTube.
                    </p>
                  ) : null}

                  {item.error ? (
                    <p className="tag mt-2 text-amber">{item.error}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {state.error ? (
        <p
          role="alert"
          className="border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm text-amber"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin"
          className="tag border border-blueline/50 px-6 py-3.5 text-graphite transition-colors hover:border-cyan hover:text-cyan"
        >
          Cancelar
        </Link>
        {uploading ? (
          <span className="tag text-amber">
            Espera a que terminen las subidas para guardar.
          </span>
        ) : null}
      </div>
    </form>
  );
}
