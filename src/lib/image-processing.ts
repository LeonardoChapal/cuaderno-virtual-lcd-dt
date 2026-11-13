/**
 * Procesado de fotos NUEVAS en el navegador antes de subirlas (D3):
 * orientación EXIF → recorte/rotación → reducción a MAX_DIMENSION →
 * recompresión (WebP o JPEG). Las fotos ya subidas no se tocan nunca.
 *
 * Al pasar por canvas se descartan los metadatos EXIF (incluida la ubicación
 * GPS de las fotos del celular); la orientación queda "horneada" en píxeles.
 */

/** Lado mayor máximo: de sobra para leer una plancha con zoom. */
export const MAX_DIMENSION = 2560;
const QUALITY = 0.85;

export type PixelArea = { x: number; y: number; width: number; height: number };

type JpegInfo = { orientation: number; width: number; height: number } | null;

/**
 * Lee de la cabecera de un JPEG la orientación EXIF (1-8) y las dimensiones
 * crudas (antes de rotar). Devuelve null si no es JPEG o no se puede leer.
 */
export async function readJpegInfo(file: File): Promise<JpegInfo> {
  try {
    const view = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
    if (view.getUint16(0) !== 0xffd8) return null;

    let orientation = 1;
    let width = 0;
    let height = 0;
    let offset = 2;

    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset);
      if ((marker & 0xff00) !== 0xff00) break;
      const length = view.getUint16(offset + 2);

      // APP1 con "Exif\0\0": buscar la etiqueta 0x0112 (Orientation).
      if (marker === 0xffe1 && view.getUint32(offset + 4) === 0x45786966) {
        const tiff = offset + 10;
        const little = view.getUint16(tiff) === 0x4949;
        const ifd = tiff + view.getUint32(tiff + 4, little);
        const entries = view.getUint16(ifd, little);
        for (let i = 0; i < entries; i++) {
          const entry = ifd + 2 + i * 12;
          if (view.getUint16(entry, little) === 0x0112) {
            orientation = view.getUint16(entry + 8, little);
            break;
          }
        }
      }

      // SOF0..SOF15 (salvo DHT/JPG/DAC): alto y ancho de la imagen.
      if (
        marker >= 0xffc0 &&
        marker <= 0xffcf &&
        ![0xffc4, 0xffc8, 0xffcc].includes(marker)
      ) {
        height = view.getUint16(offset + 5);
        width = view.getUint16(offset + 7);
        break;
      }

      offset += 2 + length;
    }

    return {
      orientation: orientation >= 1 && orientation <= 8 ? orientation : 1,
      width,
      height,
    };
  } catch {
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo leer la imagen."));
    image.src = url;
  });
}

/** Dibuja la imagen corrigiendo a mano una orientación EXIF (1-8). */
function drawOriented(image: HTMLImageElement, orientation: number) {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const swap = orientation >= 5;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext("2d")!;
  const transforms: Record<number, [number, number, number, number, number, number]> = {
    2: [-1, 0, 0, 1, w, 0],
    3: [-1, 0, 0, -1, w, h],
    4: [1, 0, 0, -1, 0, h],
    5: [0, 1, 1, 0, 0, 0],
    6: [0, 1, -1, 0, h, 0],
    7: [0, -1, -1, 0, h, w],
    8: [0, -1, 1, 0, 0, w],
  };
  const t = transforms[orientation];
  if (t) ctx.transform(...t);
  ctx.drawImage(image, 0, 0);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

export type PreparedPhoto = {
  /** URL (objeto) de la foto ya derecha, para el editor y el procesado. */
  url: string;
  width: number;
  height: number;
  revoke: () => void;
};

/**
 * Prepara una foto para editarla: siempre derecha. Los navegadores actuales
 * aplican la orientación EXIF al decodificar; se comprueba comparando las
 * dimensiones decodificadas con las crudas del JPEG y, si el navegador no la
 * aplicó, se corrige aquí.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const fileUrl = URL.createObjectURL(file);
  const image = await loadImage(fileUrl).catch((error) => {
    URL.revokeObjectURL(fileUrl);
    throw error;
  });

  const info = await readJpegInfo(file);
  const rotated = info && info.orientation >= 5 && info.width !== info.height;
  const browserApplied = rotated
    ? image.naturalWidth === info.height && image.naturalHeight === info.width
    : true; // 1-4 o sin datos: los navegadores actuales ya la aplican.

  if (info && info.orientation !== 1 && !browserApplied) {
    const canvas = drawOriented(image, info.orientation);
    const blob = await toBlob(canvas, "image/jpeg", 0.95);
    URL.revokeObjectURL(fileUrl);
    if (!blob) throw new Error("No se pudo preparar la imagen.");
    const url = URL.createObjectURL(blob);
    return {
      url,
      width: canvas.width,
      height: canvas.height,
      revoke: () => URL.revokeObjectURL(url),
    };
  }

  return {
    url: fileUrl,
    width: image.naturalWidth,
    height: image.naturalHeight,
    revoke: () => URL.revokeObjectURL(fileUrl),
  };
}

/** Tamaño del lienzo que ocupa la foto al girarla `rotation` grados (múltiplo de 90). */
export function rotatedSize(width: number, height: number, rotation: number) {
  return rotation % 180 === 0 ? { width, height } : { width: height, height: width };
}

/**
 * Genera el archivo final: gira `rotation` grados (múltiplo de 90), recorta
 * `area` (en píxeles de la imagen ya girada; null = toda), reduce el lado
 * mayor a MAX_DIMENSION y comprime a WebP (o JPEG si el navegador no sabe
 * codificar WebP).
 */
export async function renderPhoto(
  photo: PreparedPhoto,
  { rotation, area, name }: { rotation: number; area: PixelArea | null; name: string },
): Promise<File> {
  const image = await loadImage(photo.url);
  const turn = ((rotation % 360) + 360) % 360;
  const full = rotatedSize(photo.width, photo.height, turn);

  // 1. Girar sobre un lienzo del tamaño de la imagen girada.
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = full.width;
  rotatedCanvas.height = full.height;
  const rctx = rotatedCanvas.getContext("2d")!;
  rctx.translate(full.width / 2, full.height / 2);
  rctx.rotate((turn * Math.PI) / 180);
  rctx.drawImage(image, -photo.width / 2, -photo.height / 2);

  // 2. Recortar y reducir en un solo paso.
  const crop = area ?? { x: 0, y: 0, width: full.width, height: full.height };
  const sx = Math.max(0, Math.round(crop.x));
  const sy = Math.max(0, Math.round(crop.y));
  const sw = Math.min(full.width - sx, Math.round(crop.width));
  const sh = Math.min(full.height - sy, Math.round(crop.height));
  const scale = Math.min(1, MAX_DIMENSION / Math.max(sw, sh));

  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * scale));
  out.height = Math.max(1, Math.round(sh * scale));
  const octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  // Fondo blanco: los PNG con transparencia no quedan negros en JPEG.
  octx.fillStyle = "#ffffff";
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(rotatedCanvas, sx, sy, sw, sh, 0, 0, out.width, out.height);

  // 3. Comprimir: WebP si el navegador sabe codificarlo; si no, JPEG.
  let blob = await toBlob(out, "image/webp", QUALITY);
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob(out, "image/jpeg", QUALITY);
  }
  if (!blob) throw new Error("No se pudo comprimir la imagen.");

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const base = name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.${extension}`, { type: blob.type });
}
