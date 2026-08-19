"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type LoginState = { error?: string };

/**
 * Inicia sesión con el proveedor de credenciales. En caso de éxito, Auth.js
 * lanza una redirección a `/admin` (no es un error: hay que dejarla pasar).
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    // Incluye la redirección de éxito de Next.js.
    throw error;
  }
}
