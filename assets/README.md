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
