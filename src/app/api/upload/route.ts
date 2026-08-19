import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

/**
 * Emite los tokens para subir archivos directamente del navegador a Vercel
 * Blob. Al no pasar por el servidor, se evita el límite de 4,5 MB del cuerpo
 * de una función serverless y se pueden subir videos grandes.
 *
 * Solo el administrador con sesión activa puede obtener un token.
 */

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

/** Tope de tamaño por archivo: 300 MB. Ajustable con MAX_UPLOAD_MB. */
const MAX_UPLOAD_BYTES =
  Number(process.env.MAX_UPLOAD_MB ?? 300) * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) {
          throw new Error("No autorizado.");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No hace falta acción adicional: el cliente recibe la URL directa.
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
