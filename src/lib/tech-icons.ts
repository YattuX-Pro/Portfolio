import {
  SiAngular,
  SiBootstrap,
  SiDjango,
  SiDocker,
  SiDotnet,
  SiFastapi,
  SiFigma,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiGitlab,
  SiJavascript,
  SiKeycloak,
  SiKubernetes,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiSonarqubeserver,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";
import {
  Boxes,
  Braces,
  Database,
  GitBranch,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { createElement } from "react";
import type { ComponentType, SVGProps } from "react";

/* ── Registre des icônes de technologies ───────────────────────────────────
   La base ne stocke qu'un SLUG (« nextjs », « dotnet »…), jamais un nom de
   composant ni un chemin d'image. Trois raisons :

   1. l'admin ne peut proposer que ce qui existe ici. Un nom libre saisi à la
      main deviendrait `undefined` à l'import et casserait la page AU RENDU,
      pas au typecheck — c'est le piège documenté de react-icons ;
   2. seules les icônes listées ici entrent dans le bundle. Importer
      `react-icons/si` en entier, ce sont des milliers de composants ;
   3. changer l'icône d'une techno se fait ici, sans migration.

   Les LOGOS de marque viennent de Simple Icons (`react-icons/si`). Les
   notions sans logo — CI/CD, microservices, sécurité — prennent une icône
   générique de lucide-react, déjà utilisée par l'admin.

   ⚠️ Tout nom ajouté ici doit être vérifié à l'exécution, pas seulement au
   typecheck :
     node -e 'console.log(typeof require("react-icons/si").SiXxx)'
   `SiMicrosoftsqlserver` et `SiSonarqube` n'existent PAS malgré les
   apparences — d'où `Database` pour SQL Server et `SiSonarqubeserver` pour
   Sonar. */

/* react-icons exporte des fonctions, lucide-react des composants
   `forwardRef` (donc des objets). Ce type couvre les deux. */
export type TechIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type TechIconEntry = {
  /** Valeur stockée en base. Ne jamais renommer sans migrer les données. */
  slug: string;
  /** Libellé affiché dans le sélecteur de l'admin. */
  label: string;
  icon: TechIcon;
};

export const TECH_ICONS: readonly TechIconEntry[] = [
  /* Front-end */
  { slug: "angular", label: "Angular", icon: SiAngular },
  { slug: "nextjs", label: "Next.js", icon: SiNextdotjs },
  { slug: "react", label: "React", icon: SiReact },
  { slug: "vue", label: "Vue", icon: SiVuedotjs },
  { slug: "typescript", label: "TypeScript", icon: SiTypescript },
  { slug: "javascript", label: "JavaScript", icon: SiJavascript },
  { slug: "tailwind", label: "Tailwind CSS", icon: SiTailwindcss },
  { slug: "bootstrap", label: "Bootstrap", icon: SiBootstrap },
  { slug: "framer", label: "Framer Motion", icon: SiFramer },
  { slug: "figma", label: "Figma", icon: SiFigma },
  { slug: "flutter", label: "Flutter", icon: SiFlutter },

  /* Back-end */
  { slug: "dotnet", label: ".NET", icon: SiDotnet },
  { slug: "fastapi", label: "FastAPI", icon: SiFastapi },
  { slug: "python", label: "Python", icon: SiPython },
  { slug: "django", label: "Django", icon: SiDjango },
  { slug: "node", label: "Node.js", icon: SiNodedotjs },
  { slug: "api", label: "API / REST", icon: Braces },

  /* Données */
  { slug: "postgresql", label: "PostgreSQL", icon: SiPostgresql },
  { slug: "sqlserver", label: "SQL Server", icon: Database },
  { slug: "mysql", label: "MySQL", icon: SiMysql },
  { slug: "sqlite", label: "SQLite", icon: SiSqlite },
  { slug: "mongodb", label: "MongoDB", icon: SiMongodb },
  { slug: "redis", label: "Redis", icon: SiRedis },
  { slug: "rabbitmq", label: "RabbitMQ", icon: SiRabbitmq },

  /* Infrastructure & DevOps */
  { slug: "docker", label: "Docker", icon: SiDocker },
  { slug: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
  { slug: "nginx", label: "Nginx", icon: SiNginx },
  { slug: "linux", label: "Linux", icon: SiLinux },
  { slug: "git", label: "Git", icon: SiGit },
  { slug: "github", label: "GitHub", icon: SiGithub },
  { slug: "gitlab", label: "GitLab", icon: SiGitlab },
  { slug: "cicd", label: "CI/CD", icon: Workflow },
  { slug: "microservices", label: "Microservices", icon: Boxes },
  { slug: "serveur", label: "Serveur / Hébergement", icon: Server },

  /* Sécurité & qualité */
  { slug: "keycloak", label: "Keycloak", icon: SiKeycloak },
  { slug: "sonarqube", label: "SonarQube", icon: SiSonarqubeserver },
  { slug: "securite", label: "Sécurité", icon: ShieldCheck },
  { slug: "versioning", label: "Versioning / Branches", icon: GitBranch },
] as const;

const BY_SLUG = new Map(TECH_ICONS.map((e) => [e.slug, e]));

/** Liste des slugs valides, pour la validation côté server action. */
export const TECH_ICON_SLUGS: readonly string[] = TECH_ICONS.map((e) => e.slug);

/** Composant d'icône pour un slug, ou `null` si absent/inconnu.

    Renvoie `null` plutôt que de lever : une compétence sans icône, ou dont le
    slug aurait été retiré du registre, doit s'afficher sans icône — pas faire
    tomber la page publique. */
export function techIcon(slug: string | null | undefined): TechIcon | null {
  if (!slug) return null;
  return BY_SLUG.get(slug)?.icon ?? null;
}

/** Devine le slug depuis un libellé de compétence (« Next.js » → « nextjs »).

    Sert au remplissage rétroactif et à pré-sélectionner l'icône quand on
    saisit une compétence dans l'admin. La comparaison ignore la casse, les
    accents et tout ce qui n'est pas alphanumérique : « CI/CD » et « ci-cd »
    tombent donc sur la même entrée. */
export function guessIconSlug(label: string): string | null {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const target = norm(label);
  if (!target) return null;

  for (const entry of TECH_ICONS) {
    if (norm(entry.label) === target || norm(entry.slug) === target) {
      return entry.slug;
    }
  }
  return null;
}

/** Rend le logo d'un slug, ou rien du tout.

    Passe par ce composant plutôt que par `techIcon()` suivi d'un `<Icon />` :
    assigner le résultat à une variable capitalisée pendant le rendu déclenche
    `react-hooks/static-components`. La règle est légitime — un composant créé
    à chaque rendu remonterait tout son sous-arbre — même si ici la référence
    vient d'une Map et ne change jamais. `createElement` avec une variable en
    minuscule exprime ce qu'on fait réellement : instancier un composant
    existant, pas en fabriquer un.

    Rend `null` pour un slug absent ou inconnu, jamais une erreur : une
    compétence sans icône doit s'afficher sans icône. */
export function TechGlyph({
  slug,
  className,
}: {
  slug: string | null | undefined;
  className?: string;
}) {
  const component = techIcon(slug);
  if (!component) return null;
  return createElement(component, { className, "aria-hidden": true });
}
