"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import {
  MAX_DIMENSION,
  type PreparedPhoto,
  preparePhoto,
  renderPhoto,
  rotatedSize,
} from "@/lib/image-processing";
import { formatBytes } from "@/lib/slug";

const ASPECTS = [
  { key: "original", label: "Original" },
  { key: "a4h", label: "A4 horizontal", value: Math.SQRT2 },
  { key: "a4v", label: "A4 vertical", value: 1 / Math.SQRT2 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "1:1", label: "Cuadrada", value: 1 },
] as const;

type AspectKey = (typeof ASPECTS)[number]["key"];

const buttonClass =
  "tag border border-blueline/50 px-3 py-2.5 text-graphite transition-colors hover:border-cyan hover:text-cyan disabled:opacity-40";

/**
 * Editor de fotos NUEVAS antes de subirlas: girar, recortar (con proporciones
 * útiles para planchas) y comprimir. Procesa la cola de fotos una a una y
 * entrega cada resultado con `onPhotoReady` para que empiece a subirse ya.
 * Las fotos ya subidas no pasan nunca por aquí.
 */
export default function PhotoEditor({
  files,
  onPhotoReady,
  onClose,
}: {
  files: File[];
  onPhotoReady: (file: File) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<AspectKey>("original");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const file = files[index];
  const remaining = files.length - index;

  // Carga (derecha, según EXIF) la foto actual cada vez que cambia.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let prepared: PreparedPhoto | null = null;

    preparePhoto(file)
      .then((result) => {
        prepared = result;
        if (cancelled) result.revoke();
        else setPhoto(result);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(
            "Este navegador no puede abrir esta foto (¿formato HEIC?). Conviértela a JPG o PNG.",
          );
        }
      });

    return () => {
      cancelled = true;
      prepared?.revoke();
    };
  }, [file]);

  /** Pasa a la siguiente foto (o cierra si era la última). */
  const next = useCallback(() => {
    setPhoto(null);
    setLoadError(null);
    setRotation(0);
    setAspect("original");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    if (index + 1 >= files.length) onClose();
    else setIndex(index + 1);
  }, [files.length, index, onClose]);

  // Escape cierra el editor (las fotos ya listas siguen subiendo).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  if (!file) return null;

  const turned = photo ? rotatedSize(photo.width, photo.height, rotation) : null;
  const chosen = ASPECTS.find((item) => item.key === aspect)!;
  const aspectValue =
    "value" in chosen ? chosen.value : turned ? turned.width / turned.height : 4 / 3;

  async function finish(useCrop: boolean) {
    if (!photo) return;
    setBusy(true);
    try {
      onPhotoReady(
        await renderPhoto(photo, {
          rotation,
          area: useCrop ? area : null,
          name: file.name,
        }),
      );
      next();
    } catch {
      setLoadError("No se pudo procesar esta foto. Omítela o prueba con otra.");
    } finally {
      setBusy(false);
    }
  }

  /** Procesa sin editar (solo orientación y compresión) la actual y las que quedan. */
  async function finishAllAsIs() {
    setBusy(true);
    for (const pending of files.slice(index)) {
      let prepared: PreparedPhoto | null = null;
      try {
        prepared = await preparePhoto(pending);
        onPhotoReady(
          await renderPhoto(prepared, { rotation: 0, area: null, name: pending.name }),
        );
      } catch {
        // Si una no se puede abrir, se omite y se sigue con las demás.
      } finally {
        prepared?.revoke();
      }
    }
    setBusy(false);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-foto-titulo"
      className="fixed inset-0 z-50 flex flex-col bg-ferro/95 backdrop-blur-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-blueline/40 px-4 py-3">
        <div className="min-w-0">
          <h2 id="editor-foto-titulo" className="tag text-amber">
            Foto {index + 1} de {files.length}
          </h2>
          <p className="truncate text-sm text-graphite">
            {file.name} · {formatBytes(file.size)}
          </p>
        </div>
        <button type="button" onClick={onClose} disabled={busy} className={buttonClass}>
          Cerrar
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        {loadError ? (
          <div className="flex h-full items-center justify-center p-6">
            <p role="alert" className="max-w-md text-center text-amber">
              {loadError}
            </p>
          </div>
        ) : photo ? (
          <Cropper
            image={photo.url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectValue}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
            showGrid
          />
        ) : (
          <p className="tag flex h-full items-center justify-center text-label">
            Abriendo la foto…
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-blueline/40 px-4 py-3">
        {!loadError ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRotation((value) => (value + 270) % 360)}
              disabled={!photo || busy}
              aria-label="Girar a la izquierda"
              className={buttonClass}
            >
              ⟲ Girar
            </button>
            <button
              type="button"
              onClick={() => setRotation((value) => (value + 90) % 360)}
              disabled={!photo || busy}
              aria-label="Girar a la derecha"
              className={buttonClass}
            >
              Girar ⟳
            </button>

            <span className="tag ml-1 text-label">Recorte:</span>
            {ASPECTS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setAspect(item.key)}
                aria-pressed={aspect === item.key}
                disabled={!photo || busy}
                className={`tag border px-3 py-2.5 transition-colors disabled:opacity-40 ${
                  aspect === item.key
                    ? "border-amber bg-amber text-ferro"
                    : "border-blueline/50 text-graphite hover:border-cyan hover:text-cyan"
                }`}
              >
                {item.label}
              </button>
            ))}

            <label className="tag ml-1 flex items-center gap-2 text-label">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={!photo || busy}
                className="w-28 accent-[var(--color-amber)]"
              />
            </label>
          </div>
        ) : null}

        <p className="text-xs text-graphite">
          Se guarda reducida a {MAX_DIMENSION} px como máximo y comprimida, sin
          los datos de ubicación del celular. Arrastra para encuadrar.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {!loadError ? (
            <>
              <button
                type="button"
                onClick={() => void finish(true)}
                disabled={!photo || !area || busy}
                className="tag border border-amber bg-amber px-4 py-3 text-ferro transition-colors hover:bg-transparent hover:text-amber disabled:opacity-50"
              >
                {busy ? "Procesando…" : "Usar recorte"}
              </button>
              <button
                type="button"
                onClick={() => void finish(false)}
                disabled={!photo || busy}
                className={buttonClass}
              >
                Foto completa
              </button>
            </>
          ) : null}
          <button type="button" onClick={next} disabled={busy} className={buttonClass}>
            Omitir esta foto
          </button>
          {remaining > 1 ? (
            <button
              type="button"
              onClick={() => void finishAllAsIs()}
              disabled={busy}
              className={buttonClass}
            >
              Subir las {remaining} restantes sin editar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
