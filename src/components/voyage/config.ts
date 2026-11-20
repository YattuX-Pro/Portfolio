/* ══════════════════════════════════════════════════════════════════════════
   LE VOYAGE — les escales et tous les réglages de mouvement, ici et nulle
   part ailleurs.

   La page est une traversée : le hero est le départ, chaque section une
   escale, et entre deux escales une TRAVERSÉE (`Crossing`) : une scène
   plein écran, brièvement épinglée, où le navire part de l'horizon et passe
   au ras de la caméra avant que le nom de l'escale suivante ne sorte de la
   brume. Tout est lié à la position réelle du scroll — rien ne se joue au
   temps, sauf le tangage, la brume qui dérive et les reflets —, donc
   réversible : en remontant, le navire repart vers l'horizon.

   Deux progressions :
   - LOCALE, par traversée : 0 quand la scène entre par le bas de l'écran,
     1 quand elle en sort par le haut. Toute la chorégraphie s'y cale, en
     phases (`VOYAGE.phases`) ;
   - GLOBALE, sur toute la page : la route sous la navbar (`Route`).

   Pour doser l'intensité, ne touchez qu'à ce fichier.
   ══════════════════════════════════════════════════════════════════════════ */

/* Les escales, dans l'ordre du récit. La navbar en tire ses liens, la page
   ses traversées : ajouter une section, c'est l'ajouter ici ET dans
   `PortfolioApp`. `cap` est le sous-titre affiché au-dessus du nom géant de
   l'escale dans la traversée qui y mène — jamais le seul endroit où le nom
   apparaît : le vrai titre est celui de la section. */
export const ESCALES = [
  { id: "parcours", label: "Parcours", cap: "Départ · les eaux déjà traversées" },
  { id: "projects", label: "Projets", cap: "Cap sur le butin" },
  { id: "skills", label: "Expertise", cap: "De quoi tenir le cap" },
  { id: "footer", label: "Contact", cap: "Prochaine destination" },
] as const;

export type EscaleId = (typeof ESCALES)[number]["id"];

/** [début, fin] d'une phase, en fraction de la progression locale. */
type Phase = readonly [number, number];

export const VOYAGE = {
  /* Longueur d'une traversée, en svh de scroll. L'écran épinglé en occupe
     100 ; le reste est la durée de l'épinglage. Plus long = plus lent, pas
     plus spectaculaire : chaque svh ajouté est du scroll en plus pour lire
     le portfolio. */
  length: { desktop: 190, mobile: 190 },

  /* La chorégraphie. Avec 190svh, la scène entre de 0 à ~0.34, est
     épinglée jusqu'à ~0.66, puis sort. Le voile doit être presque retombé
     quand l'épinglage cesse : sinon le bas de la scène remonte en laissant
     voir un bord net entre la mer et l'escale suivante. Changer `length`,
     c'est donc revoir `close`. */
  phases: {
    /** Le voile (couleur de la page) se lève sur la mer. */
    reveal: [0.1, 0.32] as Phase,
    /** Le navire va de l'horizon au premier plan, puis sort du cadre. */
    sail: [0.26, 0.58] as Phase,
    /** Le nom de l'escale suivante sort de la brume. */
    title: [0.5, 0.6] as Phase,
    /** Le voile retombe : la scène se fond dans l'escale suivante. */
    close: [0.58, 0.67] as Phase,
  },

  /* Caméra : lente avancée dans le décor (échelle) et légère montée (% de
     la hauteur), sur toute la traversée. */
  camera: { scale: [1, 1.14] as Phase, rise: 3 },

  ship: {
    /* Position du point de flottaison (centre de la coque), en fraction de
       l'écran, et échelle (× `--ship-w`), à l'horizon puis à la sortie. */
    from: { x: 0.24, y: 0.5, scale: 0.1 },
    to: { x: 1.2, y: 1.04, scale: 1.55 },
    /* Perspective : l'approche s'accélère à mesure que le navire grandit
       (exposant appliqué à la progression). */
    perspective: 2.1,
    /* Assiette, en degrés : la proue se lève au loin, pique en approchant.
       Petites valeurs : l'image est un profil 2D. */
    pitch: [-2, 3] as Phase,
    /* Tangage au repos : degrés, px, période en secondes. */
    bobDeg: 1.2,
    bobPx: 5,
    bobPeriod: 4.6,
  },

  /* Reflets sur l'eau et poussière lumineuse dans l'air (canvas). */
  sparkles: { desktop: 110, mobile: 45, motes: 22 },

  /* Brume : vitesse de dérive (fraction d'écran par seconde). */
  fog: { drift: [0.006, 0.012] as Phase },

  /* Escale qu'on quitte : quand le BAS de la section passe de 35 % de la
     hauteur d'écran au bord haut, son contenu s'estompe et monte un peu. */
  leave: { from: 0.35, opacity: 0.35, y: -24 },
} as const;
