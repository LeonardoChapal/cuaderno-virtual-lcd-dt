import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { safeErrorMessage } from "@/lib/diag";
import {
  ALLOWED_CONTENT_TYPES,
  DEFAULT_MAX_UPLOAD_MB,
} from "@/lib/upload-rules";

/**
 * Emite los tokens para subir archivos directamente del navegador a Vercel
 * Blob. Al no pasar por el servidor, se evita el límite de 4,5 MB del cuerpo
 * de una función serverless y se pueden subir videos grandes.
 *
 * Solo el administrador con sesión activa puede obtener un token.
 */

export const runtime = "nodejs";

/** Tope de tamaño por archivo: 300 MB. Ajustable con MAX_UPLOAD_MB. */
const MAX_UPLOAD_BYTES =
  Number(process.env.MAX_UPLOAD_MB ?? DEFAULT_MAX_UPLOAD_MB) * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { error: "Petición inválida." },
      { status: 400 },
    );
  }

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
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
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
    console.error("[upload] Falló la subida:", safeErrorMessage(error));
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
