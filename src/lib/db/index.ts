import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/* Driver `pg` plutôt que @neondatabase/serverless : c'est ce que la doc Neon
   recommande sur Vercel, où le compute Fluid réutilise le processus entre
   les requêtes et rentabilise donc un vrai pool.

   DATABASE_URL est la chaîne *pooled* (hostname en -pooler). Les migrations
   utilisent DATABASE_URL_UNPOOLED, voir drizzle.config.ts. */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL est absent. Copiez .env.example vers .env et renseignez-le " +
      "(npx neonctl connection-string --project-id <id> --pooled).",
  );
}

function createPool() {
  const pool = new Pool({
    connectionString,
    /* Le pooler Neon (PgBouncer) tient déjà les connexions ; côté application
       on en garde peu pour ne pas les épuiser depuis plusieurs instances. */
    max: 5,
    idleTimeoutMillis: 30_000,
  });

  /* Sur Vercel, laisse la plateforme vider le pool avant le gel de l'instance.
     Ailleurs (dev local, CI) l'import est présent mais l'appel est sans effet ;
     on l'isole tout de même pour ne jamais faire échouer le démarrage. */
  if (process.env.VERCEL) {
    void import("@vercel/functions")
      .then(({ attachDatabasePool }) => attachDatabasePool(pool))
      .catch(() => {});
  }

  return pool;
}

/* En dev, Next recharge les modules à chaud : sans ce cache global on
   ouvrirait un pool par rechargement jusqu'à saturer la base. */
const globalForDb = globalThis as unknown as { __pool?: Pool };
const pool = globalForDb.__pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
