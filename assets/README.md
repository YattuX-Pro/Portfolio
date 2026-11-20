# assets/ — sources, hors build

Rien ici n'est servi : `public/` est publié tel quel par Next, `assets/` non.
Les originaux y vivaient au départ et pesaient 2,2 Mo de fichiers jamais
demandés par la page.

## Illustrations

`illustrations/` garde les PNG **tels que sortis du générateur**, sous leur nom
d'origine — les noms sont trompeurs (trois sur quatre s'appellent « Stopwatch »
sans être le chronographe), mais c'est la seule trace de ce qui a été généré.
`normalise.py` produit à partir d'eux les fichiers de `public/illustrations/`.

| source | sortie | emploi |
|---|---|---|
| `Stopwatch Illustration Sept 5 2026 (2).png` | `stack.png` | section 01 — Expertise |
| `Stopwatch Illustration Sept 5 2026 (1).png` | `livraison.png` | section 02 — Projets |
| `Stopwatch Illustration Sept 5 2026 (3).png` | `contact.png` | section 03 — Contact |
| `timer.png` | `timer.png` | hero, en face du compteur d'ancienneté |

`timer.png` avait d'abord été écarté pour sa définition : 323 px de sujet utile
là où un emplacement de 357 px en demande 714. L'objection est tombée avec le
cadrage retenu — le dessin s'affiche à 152 px, où 323 px de source donnent 2,1×,
net sur un écran retina. Ce qui reste est une différence de STYLE assumée : il
est gravé et a du volume, là où les trois autres sont au trait plat.

## Rejouer la normalisation

Le script recentre les rouges et les verts sur les tokens du site, ramène
l'encre sur `#1A1A18`, détoure les fonds opaques, vide les aplats clairs pour
que le papier de la page passe au travers, recadre et replafonne la définition.
Il n'est pas dans `package.json` : c'est un outil, pas une dépendance du site.

```bash
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install pillow numpy scipy
/tmp/venv/bin/python assets/normalise.py
```

Toute nouvelle illustration doit passer par là avant `public/` : c'est ce qui
garantit qu'il n'y a toujours qu'**un seul rouge** sur le site.

## Illustrations pirates — `public/pirate/`

Elles ne passent **pas** par `normalise.py`, et c'est voulu. Le script est fait
pour des dessins au trait : il recolore les rouges et les verts sur les tokens
et ramène l'encre sur `#1A1A18`. Ces illustrations-ci sont peintes, en couleurs
naturelles (bois, laiton, cordage) ; passées au script, elles perdraient tout
leur modelé. La règle qui les encadre est donc l'inverse : leurs couleurs
restent DANS l'illustration et ne deviennent jamais des couleurs d'interface —
l'accent du site reste le seul rouge des boutons, liens et focus.

Les originaux (1 à 4 Mo chacun, ~30 Mo au total) ne sont pas versionnés : ils
sont sortis du générateur d'images de Codex, détourés sur fond transparent. Les
fichiers de `public/pirate/` en sont des réductions à environ deux fois leur
taille d'affichage, faites avec `sips -Z <px>` ; `next/image` les sert ensuite
en WebP à la bonne largeur.

| fichier | largeur | emploi |
|---|---|---|
| `capitaine.png` | 833 px | hero, colonne droite |
| `barre.png` | 800 px | hero, derrière le capitaine, en rotation lente |
| `boussole.png` | 420 px | hero, cadran à côté du compteur d'ancienneté |
| `carte.png` | 720 px | section Parcours |
| `coffre.png` | 640 px | section Projets |
| `sabres.png` | 480 px | section Expertise |
| `bouteille.png` | 640 px | section Contact |
| `stack/*.png` | 200 px | icônes en orbite autour du capitaine |

Les six icônes de `stack/` reprennent des logos de marques (.NET, C#, Angular,
PostgreSQL, React, Docker) en version pirate. La plupart des chartes de marque
interdisent de modifier un logo : pour un portfolio personnel le risque est
faible, mais c'est à garder en tête.
