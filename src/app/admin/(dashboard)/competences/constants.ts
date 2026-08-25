/* Constantes partagées client/serveur.

   Ce fichier n'a délibérément PAS de "use server" : dans un module marqué
   ainsi, tous les exports doivent être des fonctions async. Une constante
   exportée depuis actions.ts était transformée en référence sérialisée
   côté client, d'où « ACCENT_OPTIONS.map is not a function ». */

/* Des NOMS de tokens, jamais des hexadécimaux : la palette reste pilotée
   par globals.css et l'admin ne peut pas introduire de couleur hors charte.
   Le jaune du drapeau est absent — à 1.41:1 sur le fond crème il ne
   franchit pas le seuil de 3:1 exigé pour un élément graphique. */
export const ACCENT_OPTIONS = [
  { value: "flag-red", label: "Rouge (drapeau)" },
  { value: "flag-green", label: "Vert (drapeau)" },
  { value: "text", label: "Encre" },
  { value: "muted", label: "Gris" },
] as const;

export const ACCENT_VALUES: readonly string[] = ACCENT_OPTIONS.map((a) => a.value);

export const ACCENT_VARS: Record<string, string> = {
  "flag-red": "var(--flag-red)",
  "flag-green": "var(--flag-green)",
  text: "var(--text)",
  muted: "var(--ink-muted)",
};
