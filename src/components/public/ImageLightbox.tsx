"use client";

import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export type LightboxImage = {
  src: string;
  alt: string;
  /** Nombre con el que se guarda al descargar. */
  fileName: string;
};

/**
 * Vercel Blob fuerza la descarga (Content-Disposition: attachment) cuando la
 * URL lleva `?download=1`. Sin esto, un `download` entre orígenes se ignora.
 */
function downloadUrl(src: string): string {
  try {
    const url = new URL(src);
    url.searchParams.set("download", "1");
    return url.toString();
  } catch {
    return src;
  }
}

/**
 * Visor de planchas: zoom con rueda, doble clic o pellizco; paneo arrastrando
 * cuando hay zoom; flechas o deslizar para cambiar de plancha; descarga.
 * Se carga bajo demanda desde PostImages, así que no pesa en la carga inicial.
 */
export default function ImageLightbox({
  images,
  index,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
}) {
  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={images.map((image) => ({
        src: image.src,
        alt: image.alt,
        download: { url: downloadUrl(image.src), filename: image.fileName },
      }))}
      plugins={[Zoom, Download]}
      // Las planchas tienen líneas finas: se permite acercar hasta 4× los
      // píxeles reales de la imagen.
      zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
      carousel={{ finite: images.length === 1, padding: 0 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{ container: { backgroundColor: "rgba(6, 18, 31, 0.97)" } }}
      labels={{
        Previous: "Plancha anterior",
        Next: "Plancha siguiente",
        Close: "Cerrar",
        Lightbox: "Visor de planchas",
        "Photo gallery": "Planchas",
        "{index} of {total}": "Plancha {index} de {total}",
        "Zoom in": "Acercar",
        "Zoom out": "Alejar",
        Download: "Descargar",
      }}
    />
  );
}
