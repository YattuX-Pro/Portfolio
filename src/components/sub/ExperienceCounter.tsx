"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { addYears, differenceInYears } from "date-fns";

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
     Partir de 0 est aussi ce qui donne la montée initiale, gratuitement. */
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const target = Date.now() - startMs;

    /* Mouvement réduit : ni montée, ni battement. On pose la valeur une fois
       et on s'arrête là. `MotionConfig` ne couvre pas ce cas — `animate()` est
       impératif et la boucle rAF ne passe par aucune prop déclarative.

       Le `setState` passe par un rAF et non par le corps de l'effet :
       `react-hooks/set-state-in-effect` refuse l'appel synchrone, qui
       provoque un rendu en cascade. Une frame de décalage, invisible. */
    if (reduced) {
      const once = requestAnimationFrame(() => setElapsed(target));
      return () => cancelAnimationFrame(once);
    }

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

    /* Deux temps : la montée de 0 à aujourd'hui — tous les rangs défilent, du
       centième à l'année — puis le relais vers le temps réel. La cible est
       figée au montage ; les 1,8 s écoulées pendant la montée sont rattrapées
       au premier tick. */
    const controls = animate(0, target, {
      duration: 1.8,
      /* Le compteur ralentit en arrivant, ce qui se lit comme un arrêt et non
         comme une coupure. */
      ease: "easeOut",
      onUpdate: setElapsed,
      onComplete: () => {
        raf = requestAnimationFrame(tick);
      },
    });

    return () => {
      controls.stop();
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

     Ce n'est pas cosmétique : le relevé est en `flex-wrap`, une valeur qui
     passe de 9 à 10 élargit son groupe et peut faire basculer un groupe
     entier à la ligne suivante. Toute la composition sauterait une fois par
     jour. L'année reste nue parce qu'elle est la valeur qu'on lit en premier,
     et que « 04ans » se lit comme un compte à rebours. */
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
    <div className={className}>
      <p className="meta">Années d&apos;expérience</p>

      {/* ── L'afficheur ──────────────────────────────────────────────────
          `flex-nowrap` + `whitespace-nowrap` : la suite ne se replie jamais,
          c'est la règle du bloc. Le corps est donc calé pour qu'elle tienne
          partout — le relevé mesure environ 6,3 fois le corps, et le clamp
          garde ce produit sous la largeur de la colonne principale : 28px sur
          un téléphone de 375px (177px de relevé pour 335px utiles), 68px à
          1512px (430px pour ~580px utiles). Grossir au-delà ferait déborder
          avant de faire joli.

          `fontSize` est posé SUR LE CONTENEUR, et tout le reste est en `em` :
          le corps des unités (0.3em), leur décalage (0.1em) et l'écart entre
          groupes (0.28em) suivent alors le chiffre au lieu d'être des valeurs
          fixes qui se décrochent au premier changement de taille.

          Chiffres en `font-display` et unités en mono : c'est la répartition
          du site — les nombres appartiennent à la fonte de titrage (le h1, les
          stats), le mono porte les libellés. Le relevé se lit comme une montre
          par sa SÉQUENCE et son remplissage à deux chiffres, pas en changeant
          de fonte ; et le mono du site n'est chargé qu'en 400/500, il aurait
          été maigre à ce corps.

          `items-baseline` : sans lui, chaque unité se centrerait sur la
          hauteur de son groupe et flotterait au milieu du chiffre.

          `aria-hidden` sur tout le bloc — il change vingt fois par seconde.
          Laissé lisible, il donnait à un lecteur d'écran une bouillie de
          chiffres ; et un `aria-live` aurait été pire, il aurait annoncé
          chaque dixième. Le texte utile est en `sr-only` juste après. */}
      <div
        aria-hidden
        className="mt-4 flex flex-nowrap items-baseline gap-x-[0.28em] whitespace-nowrap"
        style={{ fontSize: "clamp(28px, 4.5vw, 68px)" }}
      >
        {groups.map((g) => (
          <span key={g.unit} className="flex items-baseline">
            {/* `tabular-nums` : sans lui la largeur du glyphe change à chaque
                incrément et toute la ligne tremble. */}
            <span className="font-display font-semibold tabular-nums leading-[0.9] tracking-[-0.03em] text-ink">
              {g.value}
            </span>
            <span className="ml-[0.1em] font-mono text-[0.3em] leading-none text-ink-muted">
              {g.unit}
            </span>
          </span>
        ))}
      </div>

      <span className="sr-only">
        Expérience professionnelle continue depuis le{" "}
        {formatStartFr(new Date(startMs))}.
      </span>
    </div>
  );
}
