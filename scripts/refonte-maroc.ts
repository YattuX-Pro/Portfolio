/* Contenu de la refonte « Maroc » : hero, parcours, compétences, projets.

   Lancé via `tsx --env-file=<fichier> scripts/refonte-maroc.ts`. Il écrit dans
   la base désignée par DATABASE_URL : contre une base qui n'est pas locale
   (localhost / 127.0.0.1), il refuse de tourner sans REFONTE_CONFIRM=1, pour
   qu'aucune exécution par réflexe ne touche la production.

   Idempotent : relancé, il réécrit les mêmes valeurs. Les anciens projets ne
   sont PAS supprimés, seulement dépubliés : ils restent dans l'admin.
   À lancer APRÈS la migration 0007 (colonnes kind, context, contribution,
   award, facts, image_mobile_url). */
import { eq, notInArray } from "drizzle-orm";
import { db } from "../src/lib/db";
import { experiences, projects, siteSettings, skillCategories, skillItems } from "../src/lib/db/schema";

const url = process.env.DATABASE_URL ?? "";
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!local && process.env.REFONTE_CONFIRM !== "1") {
  console.error("Base distante : relancez avec REFONTE_CONFIRM=1 pour écrire dedans.");
  process.exit(1);
}

const SETTINGS = {
  heroRole: "Développeur .NET · Lead Dev",
  heroBio:
    "Je conçois et développe des applications métier en C# / ASP.NET Core et Angular, en production pour des ministères guinéens. Lead Dev backend chez Netsen Group, créateur de NmaPhoto.",
  /* La ligne « Méthode : Agile Scrum » n'est pas sur le CV : retirée. */
  method: null,
};

/* Les postes, retrouvés par leur titre. */
const JOURNEY: { title: string; set: { organization?: string; summary: string } }[] = [
  {
    title: "Analyste Développeur, Lead Dev",
    set: {
      organization: "Netsen Group",
      summary:
        "Lead backend sur Ngaynaako. Code review et choix techniques pour l'équipe ; applications web et mobile en .NET.",
    },
  },
  {
    title: "Analyste Développeur",
    set: {
      summary:
        "Full-stack .NET / Angular sur Parcoursup Guinée et Parcours Pro Guinée, qui gèrent la scolarité de l'inscription au diplôme. Architecture des applications et maintenance en production.",
    },
  },
];

const SKILLS: { label: string; accent: string; items: [string, string | null][] }[] = [
  {
    label: "Backend · expertise principale",
    accent: "flag-red",
    items: [["C#", "dotnet"], [".NET", "dotnet"], ["ASP.NET Core", "dotnet"], ["API REST", "api"], ["FastAPI", "fastapi"]],
  },
  { label: "Frontend", accent: "flag-green", items: [["Angular", "angular"], ["TypeScript", "typescript"], ["Next.js", "nextjs"]] },
  {
    label: "Bases de données",
    accent: "text",
    items: [["SQL Server", "sqlserver"], ["Transact-SQL", "sqlserver"], ["PostgreSQL", "postgresql"]],
  },
  { label: "Architecture", accent: "text", items: [["Microservices", "microservices"], ["Applications métier", null]] },
  { label: "DevOps et outils", accent: "muted", items: [["Docker", "docker"], ["CI/CD", "cicd"], ["Git", "git"]] },
  {
    label: "Leadership technique",
    accent: "muted",
    items: [["Code review", null], ["Choix techniques", null], ["Suivi de stagiaires", null]],
  },
];

type NewProject = typeof projects.$inferInsert;
const PROJECTS: NewProject[] = [
  {
    slug: "nmaphoto",
    title: "NmaPhoto",
    kind: "personal",
    context: "Produit personnel",
    role: "Créateur · architecture · backend",
    description: "Un selfie suffit pour retrouver ses photos d'un événement.",
    award: "3e prix ANSUTEN",
    facts: [
      "Utilisation : Des milliers de personnes",
      "Parcours photo : Un selfie · Aperçus filigranés · Téléchargement HD payant · Espace photographes",
      "Distinction : 3e prix ANSUTEN",
    ],
    problem:
      "Après un mariage, un concert ou une cérémonie, les photos se comptent par centaines ou par milliers. Chaque participant doit chercher les siennes à la main.",
    solution:
      "Le participant prend un selfie, et la reconnaissance faciale retrouve ses photos parmi celles de l'événement. Les aperçus sont filigranés, le téléchargement HD est payant, et les photographes publient leurs événements depuis leur propre espace. J'ai conçu le produit et son architecture : un frontend Next.js et un backend en microservices .NET et FastAPI.",
    stack: ["Next.js", ".NET", "FastAPI", "Microservices"],
    demoUrl: "https://nmaphoto.com",
    imageUrl: "/projets/nmaphoto.webp",
    imageMobileUrl: "/projets/nmaphoto-mobile.webp",
  },
  {
    slug: "ngaynaako",
    title: "Ngaynaako",
    kind: "employer",
    context: "Ministère de l'Élevage",
    role: "Lead Developer Backend",
    description:
      "Le guichet unique numérique du ministère : l'usager décrit son besoin, remplit ses démarches, dépose ses pièces, paie et suit son dossier en ligne.",
    contribution:
      "J'ai conçu et organisé le backend .NET qui porte ces démarches, et porté les choix techniques et la code review.",
    problem:
      "Réunir en un seul point d'entrée en ligne les démarches du ministère pour les éleveurs, les prestataires et les investisseurs : agrément d'une ferme, importation de poussins, ouverture d'une clinique vétérinaire, financement d'un projet.",
    solution:
      "Un portail où l'usager décrit son besoin et se voit orienté vers la bonne démarche. Il remplit les formulaires, dépose ses pièces, paie si nécessaire, puis suit son dossier jusqu'aux documents délivrés. J'ai conçu et organisé le backend .NET qui porte ces démarches, avec un objectif : des services fiables et maintenables.",
    stack: ["C#", "ASP.NET Core", "Angular"],
    demoUrl: "https://ngaynaako.elevage.gov.gn",
    imageUrl: "/projets/ngaynaako.webp",
  },
  {
    slug: "parcoursup-guinee",
    title: "Parcoursup Guinée",
    kind: "employer",
    context: "MESRS · Enseignement supérieur",
    role: "Développeur Full-stack .NET / Angular",
    description:
      "La plateforme nationale de l'enseignement supérieur public : elle suit chaque étudiant de l'orientation jusqu'au diplôme, paiement des bourses et suivi des moyennes compris.",
    contribution: "Des fonctionnalités de bout en bout, de la logique métier en .NET à leur intégration en Angular.",
    problem:
      "Gérer toute la scolarité des étudiants de l'enseignement supérieur public, et pas seulement leur inscription : orientation vers les établissements, inscription, paiement des bourses, suivi des moyennes mensuelles, trimestrielles et annuelles, jusqu'à l'obtention du diplôme.",
    solution:
      "Une seule plateforme pour les étudiants et les services du ministère : orientation et inscription en ligne, gestion et paiement des bourses, suivi des moyennes tout au long du cursus, jusqu'au diplôme. J'ai développé des fonctionnalités de bout en bout, de la logique métier côté .NET à leur intégration côté Angular.",
    stack: ["C#", "ASP.NET Core", "Angular", "TypeScript"],
    demoUrl: "https://parcoursupguinee.org",
    imageUrl: "/projets/parcoursup.webp",
  },
  {
    slug: "parcours-pro-guinee",
    title: "Parcours Pro Guinée",
    kind: "employer",
    context: "MENA-ETFP · Enseignement technique",
    role: "Développeur Full-stack .NET / Angular",
    description:
      "La gestion des apprenants des écoles techniques et professionnelles, de l'inscription jusqu'au diplôme : filières, paiement Orange Money, bourses, moyennes mensuelles, trimestrielles et annuelles.",
    contribution: "Des fonctionnalités côté .NET et côté Angular, et leur intégration entre l'API et l'interface.",
    problem:
      "Gérer la scolarité des apprenants de l'enseignement technique et professionnel de bout en bout : choix des filières, inscription, paiement des frais et des bourses, suivi des moyennes, jusqu'à l'obtention du diplôme.",
    solution:
      "Un compte apprenant et des vœux encadrés par des règles métier : jusqu'à 15 filières, 3 au plus par établissement. Puis le paiement par Orange Money et l'inscription administrative, le paiement des bourses et le suivi des moyennes mensuelles, trimestrielles et annuelles pendant toute la formation, jusqu'au diplôme. J'ai conçu et développé des fonctionnalités côté .NET et côté Angular, ainsi que leur intégration entre API et interface.",
    stack: ["C#", "ASP.NET Core", "Angular", "TypeScript"],
    demoUrl: "https://www.parcoursproguinee.org",
    imageUrl: "/projets/parcourspro.webp",
  },
  {
    slug: "hasilaza-motor",
    title: "Hasilaza Motor",
    kind: "client",
    context: "Client entreprise · Sénégal",
    role: "Développeur · projet freelance",
    description:
      "Le site d'un distributeur de tricycles au Sénégal : catalogue des modèles avec leurs prix, pièces détachées, dépannage et contact.",
    contribution: "Réalisé pour ce client en dehors de Netsen Group.",
    stack: ["Next.js", ".NET"],
    demoUrl: "https://www.yoobouko-hasilazamotor.com",
    imageUrl: "/projets/hasilaza.webp",
  },
];

async function main() {
  await db.transaction(async (tx) => {
    await tx.update(siteSettings).set({ ...SETTINGS, updatedAt: new Date() }).where(eq(siteSettings.id, 1));

    for (const j of JOURNEY) {
      const done = await tx.update(experiences).set(j.set).where(eq(experiences.title, j.title)).returning({ id: experiences.id });
      console.log(`parcours « ${j.title} » : ${done.length} ligne(s)`);
    }

    await tx.delete(skillItems);
    await tx.delete(skillCategories);
    for (const [ci, cat] of SKILLS.entries()) {
      const [row] = await tx
        .insert(skillCategories)
        .values({ label: cat.label, accent: cat.accent, position: ci })
        .returning({ id: skillCategories.id });
      await tx.insert(skillItems).values(
        cat.items.map(([label, icon], i) => ({ categoryId: row.id, label, icon, position: i })),
      );
    }

    const slugs = PROJECTS.map((p) => p.slug);
    /* Les anciens projets passent hors ligne et derrière, sans être supprimés. */
    const old = await tx.select({ id: projects.id }).from(projects).where(notInArray(projects.slug, slugs));
    for (const [i, o] of old.entries()) {
      await tx.update(projects).set({ published: false, position: 100 + i }).where(eq(projects.id, o.id));
    }
    for (const [i, p] of PROJECTS.entries()) {
      const values = { ...p, position: i, published: true, updatedAt: new Date() };
      await tx.insert(projects).values(values).onConflictDoUpdate({ target: projects.slug, set: values });
    }
    console.log(`projets : ${PROJECTS.length} publiés, ${old.length} anciens dépubliés`);
  });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
