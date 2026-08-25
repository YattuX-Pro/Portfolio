/* Lancé via `tsx --env-file=.env` : les variables sont chargées par Node
   avant l'évaluation des modules. Un `dotenv.config()` en tête de fichier
   ne suffirait pas — les imports sont hissés et db/index.ts lirait
   process.env.DATABASE_URL avant que dotenv ne l'ait défini. */
import { db } from "../src/lib/db";
import {
  projects,
  skillCategories,
  skillItems,
  siteSettings,
  heroStats,
  heroStack,
} from "../src/lib/db/schema";

/* Reprend le contenu jusqu'ici codé en dur dans les composants.
   Ne s'exécute que sur une base vide, sauf SEED_FORCE=1 — sinon un
   `npm run db:seed` par réflexe écraserait les modifications faites
   depuis l'admin. */

const SETTINGS = {
  id: 1,
  heroRole: "Analyste Développeur",
  heroAvailable: true,
  heroBio:
    "J'analyse, conçois et déploie des solutions logicielles robustes — en alliant rigueur fonctionnelle, architecture technique maîtrisée et expérience utilisateur soignée.",
  method: "Agile Scrum",
  email: "yattara.pro@gmail.com",
  githubUrl: "https://github.com/YattuX-Pro",
  linkedinUrl: "https://www.linkedin.com/in/aboubacar-tidiane-yattara-5608b6232/",
  cvUrl: "/cv/CV_Yattara_Aboubacar.pdf",
};

const STATS = [
  { value: "5+", label: "Projets", position: 0 },
  { value: "3+", label: "Années", position: 1 },
  { value: "2", label: "Domaines", position: 2 },
];

const STACK = [
  { groupLabel: "Back-end", items: ".NET · FastAPI", position: 0 },
  { groupLabel: "Front-end", items: "Angular · Next.js", position: 1 },
  { groupLabel: "Langages", items: "TypeScript · Python", position: 2 },
  { groupLabel: "Données", items: "PostgreSQL · Redis · RabbitMQ", position: 3 },
  { groupLabel: "DevOps", items: "Docker · GitLab CI/CD", position: 4 },
  { groupLabel: "Méthode", items: "Agile Scrum", position: 5 },
];

const CATEGORIES = [
  { label: "Back-end", accent: "flag-red", position: 0, items: [".NET", "FastAPI"] },
  {
    label: "Front-end",
    accent: "flag-green",
    position: 1,
    items: ["Angular", "Next.js", "TypeScript"],
  },
  {
    label: "Données & infrastructure",
    accent: "text",
    position: 2,
    items: ["PostgreSQL", "SQL Server", "Redis", "RabbitMQ", "Keycloak"],
  },
  {
    label: "DevOps & qualité",
    accent: "muted",
    position: 3,
    items: ["Docker", "GitLab", "CI/CD", "SonarQube"],
  },
];

const PROJECTS = [
  {
    slug: "rental-car",
    title: "Rental Car",
    description:
      "Plateforme de réservation de véhicules construite sur une architecture microservices. Consultation, filtrage et réservation de voitures en temps réel.",
    imageUrl: "/carties.PNG",
    stack: ["Next.js", "ASP.NET", "Microservices", "Docker"],
    demoUrl: null,
    githubUrl: "https://github.com/YattuX/car-rental-micorservices-nextJs",
    position: 0,
  },
  {
    slug: "alphax",
    title: "AlphaX",
    description:
      "Plateforme de partage de cours vidéo réservée aux comptes validés. Authentification complète, gestion des rôles et upload de vidéos intégré.",
    imageUrl: "/alphax.PNG",
    stack: ["Django", "Tailwind CSS", "Python", "PostgreSQL"],
    demoUrl:
      "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_linkedin-django-tailwind-activity-7117579562418348032-e__j",
    githubUrl: "https://github.com/YattuX/fx-Alpha",
    position: 1,
  },
  {
    slug: "remove-bg",
    title: "Remove BG",
    description:
      "Suppression d'arrière-plan par lot grâce à l'IA. Interface simple pour traiter plusieurs images simultanément avec un résultat net et immédiat.",
    imageUrl: "/rm_bg.PNG",
    stack: ["Django", "Tailwind CSS", "Python", "AI API"],
    demoUrl:
      "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_hello-word-ci-dessous-une-id%C3%A9e-dapplication-activity-7117965221771575296-x-v2",
    githubUrl: "https://github.com/YattuX/removebg",
    position: 2,
  },
  {
    slug: "digitalize",
    title: "Digitalize",
    description:
      "Dashboard statistique pour la gestion d'une flotte de véhicules. Visualisations interactives des ventes, locations et performances en temps réel.",
    imageUrl: "/digitalise.PNG",
    stack: ["Django", "Bootstrap", "JavaScript", "Chart.js"],
    demoUrl:
      "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_activity-7118265120589258753-ALCl",
    githubUrl: "https://github.com/Affane99/management_rolling_stock",
    position: 3,
  },
  {
    slug: "my-portfolio",
    title: "My Portfolio",
    description:
      "Portfolio personnel. Design éditorial en light mode, animations sobres au scroll et typographie IBM Plex sur toute la ligne.",
    imageUrl: "/portfolio.PNG",
    stack: ["Next.js", "Framer Motion", "Tailwind CSS", "TypeScript"],
    demoUrl: "https://yattara.dev/",
    githubUrl: "https://github.com/YattuX/myPorfolio",
    position: 4,
  },
];

async function main() {
  const force = process.env.SEED_FORCE === "1";
  const existing = await db.select({ id: projects.id }).from(projects).limit(1);

  if (existing.length > 0 && !force) {
    console.log(
      "La base contient déjà des données — seed ignoré.\n" +
        "Pour écraser volontairement : SEED_FORCE=1 npm run db:seed",
    );
    return;
  }

  if (force) {
    console.log("SEED_FORCE=1 — purge des tables de contenu");
    await db.delete(skillItems);
    await db.delete(skillCategories);
    await db.delete(projects);
    await db.delete(heroStats);
    await db.delete(heroStack);
    await db.delete(siteSettings);
  }

  await db.insert(siteSettings).values(SETTINGS);
  await db.insert(heroStats).values(STATS);
  await db.insert(heroStack).values(STACK);
  await db.insert(projects).values(PROJECTS);

  for (const cat of CATEGORIES) {
    const [row] = await db
      .insert(skillCategories)
      .values({ label: cat.label, accent: cat.accent, position: cat.position })
      .returning({ id: skillCategories.id });

    await db.insert(skillItems).values(
      cat.items.map((label, i) => ({
        categoryId: row.id,
        label,
        position: i,
      })),
    );
  }

  console.log(
    `Seed terminé : ${PROJECTS.length} projets, ${CATEGORIES.length} catégories, ` +
      `${STATS.length} stats, ${STACK.length} lignes de stack.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Échec du seed :", err);
    process.exit(1);
  });
