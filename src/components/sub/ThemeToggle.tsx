"use client";

import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi2";

/* ══════════════════════════════════════════════════════════════════════════
   BASCULE CLAIR / SOMBRE — dans la barre, à toutes les largeurs.

   Elle n'est PAS dans le panneau hamburger : changer la luminosité d'une page
   est un réglage de confort, pas une destination. L'enfermer derrière une
   ouverture de menu oblige à trois gestes pour un réglage qu'on prend
   justement parce que l'écran fatigue.

   AUCUN ÉTAT REACT POUR CHOISIR L'ICÔNE. C'est le point important : le thème
   courant est déjà écrit dans le DOM par next-themes, qui pose `.dark` sur
   <html> AVANT le premier rendu via un script bloquant. Les deux icônes sont
   donc rendues toutes les deux, et c'est `dark:` qui décide laquelle
   s'affiche. Le classique `const [mounted, setMounted]` ne sert à rien ici :
   il n'existe que pour éviter une discordance d'hydratation entre un serveur
   qui ignore le thème et un client qui le connaît — discordance qui ne peut
   pas se produire quand le choix est fait par CSS.

   L'icône montre la DESTINATION et non l'état courant : une lune en mode
   clair (cliquer assombrit), un soleil en mode sombre.
   ══════════════════════════════════════════════════════════════════════════ */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      /* Libellé STABLE, identique dans les deux thèmes. Un libellé qui dirait
         « Passer en mode sombre » devrait être calculé au rendu, donc côté
         serveur sans connaître le thème : c'est exactement la discordance
         d'hydratation que le rendu par CSS évite. */
      aria-label="Changer de thème, clair ou sombre"
      title="Changer de thème"
      className="h-11 w-11 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-brand hover:bg-brand-soft transition-colors duration-200 cursor-pointer"
    >
      <HiSun size={19} aria-hidden className="hidden dark:block" />
      <HiMoon size={17} aria-hidden className="dark:hidden" />
    </button>
  );
}
