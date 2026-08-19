import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hashea una contraseña en claro para guardarla en la base de datos. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compara una contraseña en claro contra el hash almacenado. */
export function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
