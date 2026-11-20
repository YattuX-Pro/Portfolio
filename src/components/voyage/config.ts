/* ══════════════════════════════════════════════════════════════════════════
   LE VOYAGE — les escales et tous les réglages de mouvement, ici et nulle
   part ailleurs.

   La page est une traversée : le hero est le départ, chaque section une
   escale, et entre deux escales une TRAVERSÉE (`Crossing`) où le navire
   avance sur une mer en plusieurs plans. Tout est lié à la position réelle
   du scroll — rien ne se joue au temps, sauf le tangage et la houle au
   repos —, donc réversible : en remontant, le navire recule.

   Deux progressions :
   - LOCALE, par traversée (0 quand la bande entre en bas de l'écran, 1
     quand elle sort en haut) : position, échelle, assiette du navire, et
     parallaxe des plans de mer ;
   - GLOBALE, sur toute la page : la route maritime sous la navbar (`Route`)
     et la phase de la houle, qui continue d'une traversée à l'autre au lieu
     de repartir de zéro.

   Pour doser l'intensité, ne touchez qu'à ce fichier. Les unités sont
   indiquées à chaque ligne.
   ══════════════════════════════════════════════════════════════════════════ */

/* Les escales, dans l'ordre du récit. La navbar en tire ses liens, la page
   ses traversées : ajouter une section, c'est l'ajouter ici ET dans
   `PortfolioApp`. `cap` est le repère affiché à l'horizon de la traversée
   qui y mène — un sous-titre, jamais le seul endroit où le nom apparaît. */
export const ESCALES = [
  { id: "parcours", label: "Parcours", cap: "Départ · les eaux déjà traversées" },
  { id: "projects", label: "Projets", cap: "Cap sur le butin" },
  { id: "skills", label: "Expertise", cap: "De quoi tenir le cap" },
  { id: "footer", label: "Contact", cap: "Prochaine destination" },
] as const;

export type EscaleId = (typeof ESCALES)[number]["id"];

export const VOYAGE = {
  ship: {
    /* Position du navire au début et à la fin d'une traversée, en fraction
       de la course libre (largeur de la bande moins celle du navire) : à 0
       il touche le bord gauche, à 1 le bord droit, sans jamais être coupé. */
    from: 0.03,
    to: 0.97,
    /* Profondeur : il se rapproche (plus grand, plus bas) au milieu de la
       traversée. Échelle aux extrémités → au milieu ; descente en px. */
    scale: [0.88, 1.04],
    dip: 12,
    /* Assiette selon la phase, en degrés : la proue se lève au départ et
       pique à l'arrivée. Petites valeurs : l'image est un profil 2D, une
       rotation plus forte simulerait un angle qu'elle ne contient pas. */
    pitch: [-2.5, 2],
    /* Tangage au repos : degrés, px, période en secondes. */
    bobDeg: 1.1,
    bobPx: 3,
    bobPeriod: 4.2,
    /* Gîte selon la vitesse de scroll : degrés au plus, atteints à
       `velocityForMax` px/s. */
    heelMax: 1.5,
    velocityForMax: 2600,
    /* Ressort sur la progression : donne du poids au navire et lisse les
       crans de la molette. */
    spring: { stiffness: 140, damping: 30, mass: 0.6 },
  },

  /* Dérive verticale du navire sur la traversée, en px (± la moitié). */
  shipParallax: 22,


  /* Sillage : longueur au repos → au plus vite (échelle). */
  wake: { rest: 0.55, max: 1.5 },

  /* Escale qu'on quitte : quand le BAS de la section passe de 35 % de la
     hauteur d'écran au bord haut, son contenu s'estompe et monte un peu.
     À ce moment le lecteur regarde déjà la mer : on n'efface jamais un
     texte qu'il est encore en train de lire. */
  leave: { from: 0.35, opacity: 0.35, y: -24 },

  /* Sous 640 px : moins de mouvement. Multiplie parallaxe, défilement et
     tangage. */
  compact: 0.55,
} as const;

export type SeaPlane = {
  top: number;
  wl: number;
  amp: number;
  fill?: "line" | "bg";
  fillOpacity?: number;
  strokeOpacity: number;
  parallax: number;
  flow: number;
  drift: number;
  front?: boolean;
  desktop?: boolean;
};

/* Plans de mer, de l'horizon vers l'avant. La perspective vient de la
   progression : plus un plan est proche, plus sa houle est longue (wl,
   px), haute (amp, px), marquée (opacités) et rapide.
   - top : position dans la bande, en % de sa hauteur ;
   - fill : remplissage jusqu'en bas — `line` pour la mer, `bg` pour le
     rivage de l'escale suivante ; absent = une simple ligne de houle ;
   - parallax : dérive verticale sur la traversée, en px (± la moitié) ;
     0 = le plan suit la page ;
   - flow : défilement horizontal par px scrollé — c'est ce qui fait
     avancer le navire RELATIVEMENT à la mer ;
   - drift : défilement au repos, en px/s ;
   - front : devant le navire (le rivage, qui cache la quille) ;
   - desktop : masqué sous 640 px, où moins de plans suffisent. */
export const SEA: readonly SeaPlane[] = [
  { top: 30, wl: 64, amp: 1.5, fill: "line", fillOpacity: 0.4, strokeOpacity: 0.5, parallax: 70, flow: 0.03, drift: 2 },
  { top: 37, wl: 86, amp: 2, strokeOpacity: 0.4, parallax: 60, flow: 0.05, drift: 3, desktop: true },
  { top: 45, wl: 112, amp: 3, strokeOpacity: 0.55, parallax: 48, flow: 0.08, drift: 5, desktop: true },
  { top: 54, wl: 144, amp: 4.5, fill: "line", fillOpacity: 0.7, strokeOpacity: 0.85, parallax: 36, flow: 0.12, drift: 7 },
  { top: 67, wl: 184, amp: 5.5, strokeOpacity: 0.7, parallax: 16, flow: 0.18, drift: 9 },
  { top: 82, wl: 250, amp: 9, fill: "bg", fillOpacity: 1, strokeOpacity: 1, parallax: 0, flow: 0.28, drift: 12, front: true },
];
