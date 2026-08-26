"use client";

import { Ban } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { TECH_ICONS, TechGlyph } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

/* Valeur sentinelle pour « aucune icône ». base-ui refuse la chaîne vide
   comme valeur d'option : elle est indistinguable d'une absence de sélection,
   et le déclencheur affichait alors le placeholder au lieu du choix. */
const NONE = "__none__";

/**
 * Sélecteur d'icône de technologie.
 *
 * Le déclencheur montre l'icône choisie, pas seulement son nom : c'est la
 * seule façon de vérifier d'un coup d'œil qu'on a pris le bon logo — plusieurs
 * libellés se ressemblent, les glyphes non.
 *
 * Les options viennent du registre `tech-icons.ts` et de lui seul. Pas de
 * saisie libre : un nom inventé passerait le typecheck et casserait au rendu,
 * c'est le piège documenté de react-icons.
 */
export default function IconPicker({
  value,
  onChange,
  id,
  className,
  ariaLabel = "Icône",
}: {
  value: string | null;
  onChange: (slug: string | null) => void;
  id?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const current = TECH_ICONS.find((e) => e.slug === value);

  return (
    <Select
      value={value ?? NONE}
      /* base-ui peut émettre null (désélection) : on le ramène à NONE. */
      onValueChange={(v) => onChange(!v || v === NONE ? null : v)}
    >
      <SelectTrigger id={id} aria-label={ariaLabel} className={cn("w-full", className)}>
        <span className="flex min-w-0 items-center gap-2">
          {current ? (
            <TechGlyph slug={current.slug} className="size-4 shrink-0" />
          ) : (
            <Ban className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className="truncate">{current?.label ?? "Aucune"}</span>
        </span>
      </SelectTrigger>

      <SelectContent className="max-h-80">
        <SelectGroup>
          <SelectItem value={NONE}>
            <span className="flex items-center gap-2">
              <Ban className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              Aucune
            </span>
          </SelectItem>

          {TECH_ICONS.map(({ slug, label }) => (
            <SelectItem key={slug} value={slug}>
              <span className="flex items-center gap-2">
                <TechGlyph slug={slug} className="size-4 shrink-0" />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
