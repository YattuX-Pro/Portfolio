import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

/* RACINE de l'administration — un second <html> à côté de celui du site
   public (src/app/(site)/layout.tsx). Next l'autorise via les groupes de
   routes, et c'est ce qui rend la console réellement autonome :

   - la console charge ses propres instances de polices. Même famille que le
     site — IBM Plex, la charte du portfolio — mais déclarée ici : les deux
     racines ne partagent pas de <head>, donc chacune doit demander ses
     fichiers. next/font les dédoublonne au build ;
   - sa palette est portée par la classe `admin` sur <html>, donc les menus,
     dialogues et infobulles — montés en portail sur <body> — l'héritent
     aussi. Avec un simple <div> de thème, tout ce qui sort en portail
     retombait sur les couleurs du site public. Sur <html> et non sur <body>
     parce que la règle de base `html { @apply font-sans }` y lit
     `--font-sans` : déclarée un cran plus bas, la variable était introuvable
     au moment où la règle s'applique, la police devenait invalide et tout
     l'admin retombait en serif ;
   - next-themes écrit `.dark` sur CE <html> : le mode sombre de l'admin ne
     peut plus suivre l'utilisateur sur le portfolio.

   Contrepartie assumée : passer du site à l'admin recharge la page. */

/* Mêmes réglages que le site public : une seule famille, la hiérarchie vient
   de la graisse et de l'approche. La 600 sert aux titres, la 500 aux libellés
   de tableau. */
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration" },
  /* Ne doit jamais apparaître dans un moteur de recherche. */
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* suppressHydrationWarning : next-themes pose la classe de thème avant
       l'hydratation, le serveur ne peut pas la connaître. */
    <html
      lang="fr"
      className={`admin ${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmProvider>{children}</ConfirmProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
