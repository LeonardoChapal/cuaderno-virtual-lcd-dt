/**
 * Extrae el ID de un video de YouTube desde cualquiera de sus formatos de
 * enlace habituales (watch, youtu.be, embed, shorts, live).
 */
export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Si ya es un ID suelto de 11 caracteres.
  if (/^[\w-]{11}$/.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[\w-]{11}$/.test(id) ? id : null;
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const match = url.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/);
    if (match) return match[2];
  }

  return null;
}

export function youtubeEmbedUrl(input: string): string | null {
  const id = youtubeId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

export function youtubeThumbnail(input: string): string | null {
  const id = youtubeId(input);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeWatchUrl(input: string): string | null {
  const id = youtubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
