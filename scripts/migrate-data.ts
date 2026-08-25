/* Recopie le contenu de l'ancienne base (OLD_DATABASE_URL) vers la nouvelle
 * (DATABASE_URL). À lancer UNE fois, après `npm run db:migrate` sur la cible.
 *
 *   npm run db:copy
 *
 * Un pg_dump aurait aussi fait l'affaire, mais il exige que la version du
 * client corresponde à celle du serveur. Ici le volume est de l'ordre de la
 * dizaine de lignes : deux pools et des inserts sont plus portables.
 *
 * Les identifiants sont réattribués par la cible ; la correspondance des
 * catégories de compétences est refaite au vol pour préserver les liens.
 */

import { Pool } from "pg";

const source = process.env.OLD_DATABASE_URL;
const target = process.env.DATABASE_URL;

if (!source || !target) {
  console.error("OLD_DATABASE_URL et DATABASE_URL doivent être définis.");
  process.exit(1);
}
if (source === target) {
  console.error("Source et cible sont identiques — rien à faire.");
  process.exit(1);
}

/* keepAlive + une seule connexion par pool : sans cela, l'instance source
   inactive est suspendue par Neon (scale-to-zero) et la connexion tombe en
   plein milieu de la copie avec « Connection terminated unexpectedly ». */
const POOL = {
  max: 1,
  keepAlive: true,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30_000,
};
const from = new Pool({ connectionString: source, ...POOL });
const to = new Pool({ connectionString: target, ...POOL });

async function main() {
  const existing = await to.query("select count(*)::int as n from projects");
  if (existing.rows[0].n > 0 && process.env.COPY_FORCE !== "1") {
    console.log(
      "La cible contient déjà des projets — copie annulée.\n" +
        "Pour écraser volontairement : COPY_FORCE=1 npm run db:copy",
    );
    return;
  }

  if (process.env.COPY_FORCE === "1") {
    /* skill_items part en cascade avec skill_categories. */
    await to.query("delete from skill_categories");
    await to.query("delete from projects");
    await to.query("delete from hero_stats");
    await to.query("delete from hero_stack");
    await to.query("delete from site_settings");
  }

  /* Réglages — ligne unique. */
  const settings = await from.query("select * from site_settings where id = 1");
  if (settings.rows[0]) {
    const s = settings.rows[0];
    await to.query(
      `insert into site_settings
         (id, hero_role, hero_available, hero_bio, method, email,
          github_url, linkedin_url, cv_url, updated_at)
       values (1,$1,$2,$3,$4,$5,$6,$7,$8, now())
       on conflict (id) do update set
         hero_role=$1, hero_available=$2, hero_bio=$3, method=$4, email=$5,
         github_url=$6, linkedin_url=$7, cv_url=$8, updated_at=now()`,
      [
        s.hero_role,
        s.hero_available,
        s.hero_bio,
        s.method,
        s.email,
        s.github_url,
        s.linkedin_url,
        s.cv_url,
      ],
    );
  }

  const stats = await from.query("select * from hero_stats order by position");
  for (const r of stats.rows) {
    await to.query(
      "insert into hero_stats (value, label, position) values ($1,$2,$3)",
      [r.value, r.label, r.position],
    );
  }

  const stack = await from.query("select * from hero_stack order by position");
  for (const r of stack.rows) {
    await to.query(
      "insert into hero_stack (group_label, items, position) values ($1,$2,$3)",
      [r.group_label, r.items, r.position],
    );
  }

  const projects = await from.query("select * from projects order by position");
  for (const p of projects.rows) {
    await to.query(
      `insert into projects
         (slug, title, description, image_url, stack, demo_url, github_url,
          position, published, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        p.slug,
        p.title,
        p.description,
        p.image_url,
        p.stack,
        p.demo_url,
        p.github_url,
        p.position,
        p.published,
        p.created_at,
        p.updated_at,
      ],
    );
  }

  /* Catégories puis entrées : l'identifiant change, on remappe. */
  const cats = await from.query("select * from skill_categories order by position");
  let itemCount = 0;
  for (const c of cats.rows) {
    const inserted = await to.query(
      "insert into skill_categories (label, accent, position) values ($1,$2,$3) returning id",
      [c.label, c.accent, c.position],
    );
    const newId = inserted.rows[0].id;

    const items = await from.query(
      "select * from skill_items where category_id = $1 order by position",
      [c.id],
    );
    for (const i of items.rows) {
      await to.query(
        "insert into skill_items (category_id, label, position) values ($1,$2,$3)",
        [newId, i.label, i.position],
      );
      itemCount++;
    }
  }

  console.log(
    `Copié : ${projects.rowCount} projets, ${cats.rowCount} catégories, ` +
      `${itemCount} compétences, ${stats.rowCount} stats, ${stack.rowCount} lignes de stack.`,
  );
}

main()
  .then(async () => {
    await from.end();
    await to.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Échec de la copie :", e);
    await from.end().catch(() => {});
    await to.end().catch(() => {});
    process.exit(1);
  });
