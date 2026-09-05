"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { addYears, differenceInYears } from "date-fns";
import { DURATION, EASE, STAGGER } from "@/components/Reveal";

/* ══════════════════════════════════════════════════════════════════════════
   ANNÉES D'EXPÉRIENCE — un chronographe, pas un tableau.

   Le bloc n'affiche qu'UNE chose : un relevé de temps écoulé qui tourne, lu
   comme l'heure à une montre — `4ans 03j 19h 30min 12,4s`. Le seul autre
   texte est son titre. Libellés de lignes, date de départ, ordinal de
   l'année : tout a sauté. Chaque mot en plus éloignait le bloc de ce qu'il
   doit être, un afficheur.

   UNE SEULE LIGNE, jamais deux. C'est une contrainte de lecture et pas de
   mise en page : une montre ne replie pas son cadran. D'où `flex-nowrap` +
   `whitespace-nowrap`, et un corps calé pour que la suite tienne dans la
   colonne principale à toutes les largeurs (voir le clamp plus bas).

   PAS DE CHAMP « MOIS ». C'est le choix qui structure le calcul : les jours
   comptent depuis l'anniversaire de la date d'entrée, donc de 0 à 365. Une
   montre n'a pas de registre « mois » entre l'année et le jour, et le champ
   passait le plus clair de son temps à afficher « 0 ». Conséquence à
   assumer : en juin le relevé dira « 4ans 287j », pas « 4ans 9mois 14j ».

   L'origine vient de la BASE (`site_settings.experience_start_at`, éditable
   depuis l'admin) : une date d'ancienneté est du contenu, pas une constante.

   PAS DE MONTÉE À L'ARRIVÉE. Le relevé partait de 0 et défilait 1,8 s avant
   de se poser sur sa vraie valeur : pendant deux secondes le bloc affichait
   un chiffre FAUX, et le seul geste « premium » de la page était celui d'un
   odomètre de station-service. Le compteur affiche désormais sa valeur juste
   dès la première frame, et c'est la RÉVÉLATION qui fait l'entrée — chaque
   groupe monte de sa propre hauteur, sort d'un flou, décalé de 60 ms sur son
   voisin de gauche. Même courbe, même durée, même stagger que le reste du
   site (`Reveal.tsx`) : c'est une entrée de plus, pas un effet à part.
   ══════════════════════════════════════════════════════════════════════════ */

/* Cadence de rafraîchissement. Le dernier rang est le DIXIÈME de seconde :
   il change tous les 100 ms, donc 50 ms suffisent à ne jamais en rater un.
   Le centième, lui, était illisible — un brouillard à deux chiffres. */
const TICK_MS = 50;

/* Mois en dur plutôt que `Intl.DateTimeFormat` : ce texte est rendu côté
   serveur PUIS hydraté, et deux ICU (Node, navigateur) qui ne s'accordent pas
   sur une chaîne suffisent à faire échouer l'hydratation. Le site est
   monolingue, douze chaînes coûtent moins qu'un risque. */
const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/* ── L'entrée ───────────────────────────────────────────────────────────────
   `y` en POURCENTAGE et pas en pixels : un transform en % se rapporte à la
   hauteur de l'élément, donc la montée suit le corps du chiffre — même geste
   à 30px sur un téléphone qu'à 68px sur un écran large. Un `y: 16` fixe aurait
   été un saut sur mobile et un frémissement sur desktop.

   Le flou fait le reste : il donne à des glyphes qui ne bougent presque pas la
   sensation d'une mise au point, comme un cadran qui s'allume. Il est posé en
   `filter` inline par Framer (même raison que `ProjectImage` : la classe
   Tailwind `blur-*` passe par `--tw-blur`, déclarée `syntax: "*"`, qui ne sait
   pas s'interpoler). */
const dialGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren: 0.1 } },
};

const dialItem: Variants = {
  hidden: { opacity: 0, y: "38%", filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { duration: DURATION, ease: EASE },
  },
};

/* Lu en UTC, comme la date est écrite par l'admin. La Guinée est à UTC+0 :
   c'est l'heure réelle de signature, et elle ne se décale pas selon le pays
   du visiteur. */
function formatStartFr(date: Date) {
  const day = date.getUTCDate();
  return `${day === 1 ? "1ᵉʳ" : day} ${MONTHS_FR[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function ExperienceCounter({
  startAt,
  className = "",
}: {
  startAt: Date;
  className?: string;
}) {
  /* `new Date(...)` autour de la prop : la valeur traverse la frontière
     serveur/client, où un `Date` revient normalement en `Date` — mais si un
     jour elle arrivait en chaîne ISO, `.getTime()` aurait cassé la page au
     rendu. Reconstruire est gratuit et couvre les deux formes. */
  const startMs = new Date(startAt).getTime();

  const reduced = useReducedMotion();

  /* ⚠️ L'état DOIT partir de 0 et non de la durée réelle : le hero est
     prérendu sur le serveur, où `Date.now()` ne vaut pas ce qu'il vaudra à
     l'hydratation. Une valeur calculée au rendu aurait donc produit deux
     chaînes différentes et une erreur d'hydratation à chaque visite.

     Ce 0 n'est JAMAIS vu : tant que `ready` est faux le relevé est à
     `opacity: 0`. Il n'est pas pour autant démonté — c'est lui qui réserve la
     hauteur et la largeur exactes du bloc (mêmes glyphes, `tabular-nums`),
     donc rien ne saute au montage. */
  const [elapsed, setElapsed] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = 0;

    /* rAF plutôt que setInterval : le navigateur suspend la boucle quand
       l'onglet passe en arrière-plan, au lieu de continuer à recalculer et
       à re-rendre dans le vide. */
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < TICK_MS) return;
      last = t;
      setElapsed(Date.now() - startMs);
    };

    /* La vraie valeur est posée dès le montage, puis le battement prend le
       relais — plus aucune montée. Le `setState` est différé et non appelé
       dans le corps de l'effet : `react-hooks/set-state-in-effect` refuse
       l'appel synchrone, qui provoque un rendu en cascade.

       Ce premier report est un `setTimeout` et PAS un `requestAnimationFrame`,
       contrairement au battement juste au-dessus. La raison est celle qui fait
       justement préférer rAF ensuite : le navigateur ne planifie aucune frame
       pour un onglet en arrière-plan. Une page ouverte dans un onglet caché
       (Cmd-clic, restauration de session) serait donc restée sur son zéro
       invisible, et n'aurait affiché ses chiffres qu'au moment où on la
       regarde. Un timer, lui, part même caché : la valeur est juste, l'entrée
       est jouée, et il ne reste qu'à la lire.

       Mouvement réduit : la valeur est posée, et rien ne bat. `MotionConfig`
       neutralise déjà la révélation (elle est déclarative), mais pas cette
       boucle-ci, qui ne passe par aucune prop. */
    const start = setTimeout(() => {
      setElapsed(Date.now() - startMs);
      setReady(true);
      if (!reduced) raf = requestAnimationFrame(tick);
    }, 0);

    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [reduced, startMs]);

  /* ── Décomposition ──────────────────────────────────────────────────────
     Les ANNÉES passent par `date-fns` (`differenceInYears` / `addYears`) et
     non par une division : elles seules dépendent du calendrier — années
     bissextiles, et le fait qu'un 29 février n'a pas d'anniversaire tous les
     ans. Diviser par 365 aurait dérivé d'un jour toutes les quatre années.

     TOUT LE RESTE est de l'arithmétique pure sur le reste en millisecondes,
     et c'est volontaire : sous l'année, un chronographe compte du temps
     écoulé, pas des cases de calendrier. Un jour y vaut 24 h, toujours. */
  const end = startMs + elapsed;
  const years = differenceInYears(end, startMs);

  let rest = end - addYears(new Date(startMs), years).getTime();
  const days = Math.floor(rest / 86_400_000);
  rest -= days * 86_400_000;
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  const tenths = Math.floor((rest % 1000) / 100);

  /* Les rangs sous l'année sont COMPLÉTÉS À DEUX CHIFFRES, l'année non.

     Ce n'est pas cosmétique : le relevé est mesuré en `em` et une valeur qui
     passe de 9 à 10 élargit son groupe, donc toute la suite. L'année reste
     nue parce qu'elle est la valeur qu'on lit en premier, et que « 04ans » se
     lit comme un compte à rebours. */
  const groups: { value: ReactNode; unit: string }[] = [
    { value: String(years), unit: "ans" },
    { value: pad2(days), unit: "j" },
    { value: pad2(hours), unit: "h" },
    { value: pad2(minutes), unit: "min" },
    {
      value: (
        <>
          {pad2(seconds)}
          {/* Le seul accent du bloc, comme le point après « Yattara. » */}
          <span className="text-brand">,</span>
          {tenths}
        </>
      ),
      unit: "s",
    },
  ];

  return (
    /* `containerType: "inline-size"` : c'est cette racine qui sert d'unité au
       corps du relevé (voir le `cqw` plus bas). Posé en style inline et pas en
       classe `@container` pour rester à côté du `fontSize` qui s'en sert —
       séparés, on retire l'un sans comprendre qu'on casse l'autre. */
    <div className={className} style={{ containerType: "inline-size" }}>
      <p className="meta">Années d&apos;expérience</p>

      {/* ── L'afficheur ──────────────────────────────────────────────────
          `flex-nowrap` + `whitespace-nowrap` : la suite ne se replie jamais,
          c'est la règle du bloc. Le corps est donc calé pour qu'elle tienne
          partout — le relevé mesure environ 9,4 fois le corps, et le clamp
          garde ce produit sous la largeur disponible.

          Le corps est en `cqw` (1 % de la largeur du BLOC) et non en `vw`,
          parce que le relevé n'occupe pas la même fraction de la fenêtre selon
          l'endroit : pleine ligne sous 640px, puis une colonne de 7/12 moins
          la place des icônes au-delà. Un terme en `vw` calé pour le téléphone
          débordait de la colonne sur un portable de 1024px, et calé pour le
          portable ne remplissait plus rien sur le téléphone. En `cqw` il n'y a
          plus de régime à arbitrer : le chiffre suit sa propre boîte, quelle
          que soit la raison pour laquelle elle a cette largeur. C'est
          `containerType: "inline-size"` sur la racine du bloc qui l'active, et
          c'est pour ça que la racine doit recevoir sa largeur du parent
          (`basis-full` / `grow` côté hero) : un bloc qui se dimensionne sur son
          contenu ne peut pas servir de référence à son contenu.

          Le diviseur : le relevé mesure ~8,9 fois le corps aujourd'hui, ~9,5
          quand l'année passera à deux chiffres. 10,4cqw laisse la marge des
          deux, plutôt que de recadrer tout le bloc un matin de janvier.

          Le plafond de 68px reste : au-delà le relevé cesse d'être un chiffre
          qu'on lit pour devenir une bannière, et il dépasserait le corps du h1.

          `fontSize` est posé SUR LE CONTENEUR, et tout le reste est en `em` :
          le corps des unités (0.3em), leur décalage (0.1em) et l'écart entre
          groupes (0.28em) suivent alors le chiffre au lieu d'être des valeurs
          fixes qui se décrochent au premier changement de taille.

          Chiffres en `font-display` et unités en mono : c'est la répartition
          du site — les nombres appartiennent à la fonte de titrage (le h1, les
          stats), le mono porte les libellés.

          `items-baseline` : sans lui, chaque unité se centrerait sur la
          hauteur de son groupe et flotterait au milieu du chiffre.

          `aria-hidden` sur tout le bloc — il change vingt fois par seconde.
          Laissé lisible, il donnait à un lecteur d'écran une bouillie de
          chiffres ; et un `aria-live` aurait été pire, il aurait annoncé
          chaque dixième. Le texte utile est en `sr-only` juste après. */}
      <motion.div
        aria-hidden
        variants={dialGroup}
        initial="hidden"
        animate={ready ? "visible" : "hidden"}
        className="mt-4 flex flex-nowrap items-baseline gap-x-[0.28em] whitespace-nowrap"
        style={{ fontSize: "min(68px, 10.4cqw)" }}
      >
        {groups.map((g) => (
          /* Le groupe entier (chiffre + unité) est UN objet qui monte : les
             séparer aurait fait décoller l'unité de son nombre. */
          <motion.span key={g.unit} variants={dialItem} className="flex items-baseline">
            {/* `tabular-nums` : sans lui la largeur du glyphe change à chaque
                incrément et toute la ligne tremble. */}
            <span className="font-display font-semibold tabular-nums leading-[0.9] tracking-[-0.03em] text-ink">
              {g.value}
            </span>
            <span className="ml-[0.1em] font-mono text-[0.3em] leading-none text-ink-muted">
              {g.unit}
            </span>
          </motion.span>
        ))}
      </motion.div>

      <span className="sr-only">
        Expérience professionnelle continue depuis le{" "}
        {formatStartFr(new Date(startMs))}.
      </span>
    </div>
  );
}
