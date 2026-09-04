"use client";

import FlagRule from "@/components/FlagRule";
import type { SiteData } from "@/lib/db/queries";

/* ══════════════════════════════════════════════════════════════════════════
   STACK PRINCIPALE — colonne droite du hero, signée .NET.

   Le contenu est celui qui vivait déjà en base (`hero_stack`, onglet « Stack
   principale » de l'admin) : la liste n'a pas bougé, c'est sa TÊTE qui change.
   Un logotype `.NET` au corps du titre coiffe la colonne, comme le grand
   chiffre coiffait le compteur.

   Le point est en rouge de marque. Ce n'est pas un ornement : c'est
   exactement le point de « Yattara. » dans le h1, à trois centimètres de là.
   Le même signe, deux fois, relie le nom et la technologie sans écrire une
   phrase pour le dire — et c'est ce qui empêche le logotype de ressembler à
   un logo posé sur la page.
   ══════════════════════════════════════════════════════════════════════════ */

export default function StackPanel({
  rows,
  className = "",
}: {
  rows: SiteData["stack"];
  className?: string;
}) {
  return (
    /* Le conteneur d'origine de la colonne, inchangé.

       Pas de carte : ni bordure, ni ombre. Le voile est juste posé derrière.
       `radial-gradient` ancré à `100% 0%` — le coin HAUT DROIT — et éteint à
       80% : la teinte est dense dans l'angle et s'évanouit vers la gauche. Un
       dégradé linéaire aurait laissé un bord franc sur tout un côté ; ici la
       seule arête possible est le coin lui-même, et `rounded-t-[2rem]`
       l'arrondit. L'arrêt à 80% et non 70% est ce qui met de la teinte dans le
       coin haut gauche : arrondir un angle transparent ne se voit pas.

       `--brand-veil` est le rouge de la charte à 12% (voir globals.css) : plus
       présent que `--brand-soft`, qui se confondait avec le fond crème.

       `hidden lg:block` : la colonne ne descend pas sur mobile. Elle le peut
       depuis que le compteur a rejoint la colonne principale — c'est lui qui
       devait rester visible partout, pas cette liste.

       `lg:pr-6` garde la gouttière à droite : les valeurs sont alignées à
       droite et la colonne touche le bord interne du conteneur. */
    <aside
      className={`hidden lg:block lg:pt-3 lg:pr-6 lg:rounded-t-[2rem] lg:bg-[radial-gradient(130%_95%_at_100%_0%,var(--brand-veil)_0%,transparent_80%)] ${className}`}
    >
      <p className="meta">Stack principale</p>
      <FlagRule className="mt-3 mb-1" thickness={3} width={26} delay={0.4} />

      {/* Le logotype.

          Aligné à droite : toutes les valeurs de la liste le sont déjà, le
          logotype devient donc la tête de cette colonne — l'axe vertical qui
          tient le bloc. À gauche il laissait un vide franc sur sa droite,
          exactement là où le voile est le plus dense.

          `leading-[0.8]` : l'interligne par défaut aurait réservé un tiers de
          hauteur vide sous le mot et décollé la liste du bloc.

          Plafonné à 124px : `.NET` mesure environ 2,15 fois le corps, soit
          267px dans une colonne qui en fait 295. Au-delà, le mot touche les
          deux bords et le voile n'a plus de marge où respirer. */}
      <p
        className="mt-6 text-right font-display font-semibold leading-[0.8] tracking-[-0.05em] text-ink"
        style={{ fontSize: "clamp(72px, 9vw, 124px)" }}
      >
        <span className="text-brand">.</span>NET
      </p>

      {/* `border-t` sur la liste ferme le logotype par le haut et l'ancre dans
          le rythme des filets, au lieu de le laisser flotter. */}
      <dl className="mt-7 border-t border-line">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-baseline justify-between gap-4 border-b border-line py-3"
          >
            <dt className="meta">{row.groupLabel}</dt>
            <dd className="text-[14px] text-ink text-right">{row.items}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
