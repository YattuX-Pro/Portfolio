import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

/* Instance serveur unique de Neon Auth.
   Utilisable dans les composants serveur, les server actions, les route
   handlers et le middleware. */

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) throw new Error("NEON_AUTH_BASE_URL est absent de l'environnement.");
if (!secret || secret.length < 32) {
  throw new Error(
    "NEON_AUTH_COOKIE_SECRET est absent ou trop court (32 caractères minimum).",
  );
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: { secret, sessionDataTtl: 300 },
});
