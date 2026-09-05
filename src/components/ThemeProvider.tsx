"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/* next-themes est un composant client ; les deux layouts racines (site et
   admin) sont des composants serveur. Ce relais d'une ligne est la frontière
   entre les deux.

   Il vit à la racine de `components/` et non plus dans `admin/` : le site
   public a lui aussi un thème depuis qu'il a son sélecteur clair/sombre, et
   un composant partagé rangé chez l'un des deux consommateurs se serait
   dupliqué au premier import. */
export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
