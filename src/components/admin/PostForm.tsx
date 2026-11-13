"use client";

import { upload } from "@vercel/blob/client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { MediaType, PostWithMedia } from "@/db/schema";
import { SECTIONS, SECTION_LABELS, SUBSECTION_LABELS } from "@/lib/site";
import { formatBytes } from "@/lib/slug";
import {
  ALLOWED_CONTENT_TYPES,
  MULTIPART_THRESHOLD_BYTES,
  uploadErrorMessage,
} from "@/lib/upload-rules";
import { youtubeId } from "@/lib/youtube";

import type { ActionState } from "@/app/admin/actions";

/**
 * Estado de un archivo nuevo: en cola, subiendo o con error. Sin `status`,
 * el adjunto ya está listo (subido o es un enlace).
 */
type UploadStatus = "queued" | "uploading" | "error";

type MediaDraft = {
  key: string;
  type: MediaType;
  url: string;
  label: string;
  fileName?: string;
  fileSize?: number;
  status?: UploadStatus;
  /** Progreso 0-100 y bytes enviados mientras se sube a Vercel Blob. */
  progress?: number;
  loaded?: number;
  error?: string;
  /** El archivo sigue en memoria y se puede volver a intentar. */
  retryable?: boolean;
};

// El editor de fotos (y react-easy-crop) solo se descarga al elegir fotos.
const PhotoEditor = dynamic(() => import("@/components/admin/PhotoEditor"), {
  ssr: false,
});

/** Subidas simultáneas: más satura la conexión sin acabar antes. */
const MAX_PARALLEL_UPLOADS = 2;

const isPending = (item: MediaDraft) =>
  item.status === "queued" || item.status === "uploading";

const TYPE_LABELS: Record<MediaType, string> = {
  youtube: "Video de YouTube",
  video_upload: "Video subido",
  image: "Foto",
  link: "Enlace externo",
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

function SubmitButton({
  label,
  blocked,
}: {
  label: string;
  /** Hay subidas en curso: guardar ahora perdería esos archivos. */
  blocked: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || blocked}
      className="tag border border-amber bg-amber px-6 py-3.5 text-ferro transition-colors hover:bg-transparent hover:text-amber disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

const fieldClass =
  "w-full border border-blueline/50 bg-ferro px-3.5 py-2.5 text-sm text-chalk outline-none transition-colors focus:border-cyan";
const labelClass = "tag mb-2 block text-label";

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

  // Fotos elegidas que esperan en el editor antes de subirse.
  const [editorFiles, setEditorFiles] = useState<File[] | null>(null);

  // Archivos de la cola de subida (fuera del estado de React: no se pintan).
  const files = useRef(new Map<string, File>());
  const controllers = useRef(new Map<string, AbortController>());
  const queue = useRef<string[]>([]);
  const active = useRef(0);

  // Los adjuntos que aún se están subiendo no deben guardarse.
  const pending = media.filter(isPending);
  const uploading = pending.length > 0;
  const failed = media.filter((item) => item.status === "error");
  const totalBytes = pending.reduce((sum, item) => sum + (item.fileSize ?? 0), 0);
  const sentBytes = pending.reduce((sum, item) => sum + (item.loaded ?? 0), 0);
  const totalPercent = totalBytes
    ? Math.min(100, Math.round((sentBytes / totalBytes) * 100))
    : 0;

  // Cerrar o recargar la pestaña con subidas en curso las perdería.
  useEffect(() => {
    if (!uploading) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  // Al salir del formulario se cancelan las subidas que sigan en curso.
  useEffect(() => {
    const running = controllers.current;
    return () => running.forEach((controller) => controller.abort());
  }, []);

  const serializedMedia = JSON.stringify(
    media
      .filter((item) => item.url && !item.status)
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

  /** Quita un adjunto; si se estaba subiendo, cancela la subida. */
  function removeMedia(key: string) {
    controllers.current.get(key)?.abort();
    queue.current = queue.current.filter((queued) => queued !== key);
    files.current.delete(key);
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

  /** Sube un archivo directo del navegador a Vercel Blob. */
  async function runUpload(key: string, file: File) {
    const controller = new AbortController();
    controllers.current.set(key, controller);
    updateMedia(key, {
      status: "uploading",
      progress: 0,
      loaded: 0,
      error: undefined,
    });

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > MULTIPART_THRESHOLD_BYTES,
        abortSignal: controller.signal,
        onUploadProgress: ({ loaded, percentage }) => {
          updateMedia(key, { progress: Math.round(percentage), loaded });
        },
      });
      files.current.delete(key);
      updateMedia(key, {
        url: blob.url,
        status: undefined,
        progress: undefined,
        loaded: undefined,
      });
    } catch (error) {
      // Cancelada a propósito: el adjunto ya se quitó de la lista.
      if (controller.signal.aborted) return;
      console.error("[panel] Falló la subida:", error);
      updateMedia(key, {
        status: "error",
        progress: undefined,
        loaded: undefined,
        error: uploadErrorMessage(error),
        retryable: true,
      });
    } finally {
      controllers.current.delete(key);
    }
  }

  /** Arranca subidas de la cola sin pasar de MAX_PARALLEL_UPLOADS. */
  function pump() {
    while (active.current < MAX_PARALLEL_UPLOADS && queue.current.length) {
      const key = queue.current.shift()!;
      const file = files.current.get(key);
      if (!file) continue;
      active.current += 1;
      void runUpload(key, file).finally(() => {
        active.current -= 1;
        pump();
      });
    }
  }

  /** Pone archivos en la cola de subida (todos se ven en la lista ya). */
  function enqueueFiles(list: File[], type: MediaType) {
    const drafts: MediaDraft[] = list.map((file) => {
      const key = newKey();
      const base = {
        key,
        type,
        url: "",
        label: file.name,
        fileName: file.name,
        fileSize: file.size,
      };
      // Se avisa antes de subir si el formato no lo aceptará el servidor
      // (si el navegador no sabe el tipo, decide el servidor).
      if (file.type && !ALLOWED_CONTENT_TYPES.includes(file.type)) {
        return {
          ...base,
          status: "error" as const,
          error: uploadErrorMessage(new Error("content type not allowed")),
        };
      }
      files.current.set(key, file);
      queue.current.push(key);
      return { ...base, status: "queued" as const, progress: 0, loaded: 0 };
    });

    setMedia((items) => [...items, ...drafts]);
    pump();
  }

  function retryUpload(key: string) {
    if (!files.current.has(key)) return;
    updateMedia(key, { status: "queued", error: undefined, progress: 0, loaded: 0 });
    queue.current.push(key);
    pump();
  }

  function handleFiles(list: FileList | null, type: MediaType) {
    if (!list?.length) return;
    const chosen = Array.from(list);
    if (type !== "image") {
      enqueueFiles(chosen, type);
      return;
    }
    // Fotos nuevas: pasan por el editor (girar, recortar, comprimir).
    // Los GIF se suben tal cual para no perder la animación.
    const gifs = chosen.filter((file) => file.type === "image/gif");
    const photos = chosen.filter((file) => file.type !== "image/gif");
    if (gifs.length) enqueueFiles(gifs, "image");
    if (photos.length) setEditorFiles(photos);
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Segunda barrera (p. ej. Enter en un campo): no guardar con subidas
        // en curso, porque esos adjuntos se perderían sin aviso.
        if (uploading) event.preventDefault();
      }}
      className="flex flex-col gap-8"
    >
      <input type="hidden" name="media" value={serializedMedia} />

      {editorFiles ? (
        <PhotoEditor
          files={editorFiles}
          onPhotoReady={(file) => enqueueFiles([file], "image")}
          onClose={() => setEditorFiles(null)}
        />
      ) : null}

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

          <p className="text-sm text-graphite sm:col-span-2">
            El orden en el sitio se cambia arrastrando las publicaciones en la
            lista del panel. Una publicación nueva aparece la primera de su
            grupo.
          </p>

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
              // Los .mov (QuickTime) no se reproducen en Chrome ni en Android.
              const isMov =
                item.type === "video_upload" &&
                /\.mov$/i.test(item.fileName ?? item.url);

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
                        {isPending(item) ? "Cancelar" : "Quitar"}
                      </button>
                    </div>
                  </div>

                  {item.status === "queued" ? (
                    <p className="tag break-all text-graphite">
                      En cola · {item.fileName}
                      {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ""}
                    </p>
                  ) : item.status === "uploading" ? (
                    <div>
                      <div
                        role="progressbar"
                        aria-label={`Subiendo ${item.fileName ?? "archivo"}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={item.progress ?? 0}
                        className="mb-2 h-1.5 w-full bg-blueline/30"
                      >
                        <div
                          className="h-full bg-amber transition-[width]"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                      <p className="tag break-all text-graphite">
                        Subiendo {item.fileName} — {item.progress ?? 0}%
                        {item.fileSize
                          ? ` · ${formatBytes(item.loaded ?? 0)} de ${formatBytes(item.fileSize)}`
                          : ""}
                      </p>
                    </div>
                  ) : item.status === "error" ? (
                    <div className="flex flex-col gap-3">
                      <p className="tag break-all text-graphite">
                        {item.fileName}
                        {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ""}
                      </p>
                      <p role="alert" className="text-sm text-amber">
                        {item.error}
                      </p>
                      {item.retryable ? (
                        <button
                          type="button"
                          onClick={() => retryUpload(item.key)}
                          className="tag self-start border border-amber px-4 py-2 text-amber transition-colors hover:bg-amber hover:text-ferro"
                        >
                          Reintentar
                        </button>
                      ) : null}
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

                  {isMov ? (
                    <p className="mt-2 text-sm text-amber">
                      Los archivos .mov no se reproducen en Chrome ni en
                      Android. Convierte el video a MP4 antes de subirlo, o
                      usa un enlace de YouTube.
                    </p>
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

      {uploading ? (
        <div className="border border-amber/50 bg-amber/5 px-4 py-3">
          <div
            role="progressbar"
            aria-label="Progreso total de las subidas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={totalPercent}
            className="mb-2 h-1.5 w-full bg-blueline/30"
          >
            <div
              className="h-full bg-amber transition-[width]"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
          <p aria-live="polite" className="text-sm text-amber">
            Subiendo {pending.length}{" "}
            {pending.length === 1 ? "archivo" : "archivos"} — {totalPercent}% (
            {formatBytes(sentBytes)} de {formatBytes(totalBytes)}). Espera a
            que terminen para guardar.
          </p>
        </div>
      ) : null}

      {failed.length > 0 ? (
        <p className="border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm text-amber">
          {failed.length === 1
            ? "1 archivo no se pudo subir y no se guardará."
            : `${failed.length} archivos no se pudieron subir y no se guardarán.`}{" "}
          Reinténtalo o quítalo de la lista.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} blocked={uploading} />
        <Link
          href="/admin"
          className="tag border border-blueline/50 px-6 py-3.5 text-graphite transition-colors hover:border-cyan hover:text-cyan"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
