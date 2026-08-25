import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

/* Les migrations passent par la connexion DIRECTE (sans -pooler).
   Via le pooler, PgBouncer est en mode transaction : les instructions DDL
   et l'état de session des migrations échouent, et les erreurs ne mentionnent
   jamais le pooling — on voit « prepared statement already exists » ou une
   table introuvable. */
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED (ou DATABASE_URL) est absent de .env");
}

if (url.includes("-pooler")) {
  throw new Error(
    "La chaîne de migration passe par le pooler. Utilisez DATABASE_URL_UNPOOLED " +
      "(hostname sans le suffixe -pooler).",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
