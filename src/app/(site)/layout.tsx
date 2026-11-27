import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "../globals.css";

/* Racine du SITE PUBLIC uniquement. L'administration a sa propre racine
   (src/app/admin/layout.tsx) : deux <html> distincts, donc deux jeux de
   polices, de couleurs et de thèmes qui ne peuvent plus se contaminer.
   Naviguer entre les deux recharge la page, ce qui est exactement le
   comportement attendu entre un site vitrine et une console. */

/* Une seule famille : IBM Plex. La hiérarchie passe par la graisse et
   l'approche, pas par un changement de fonte.
     - titres  : 600, tracking serré
     - corps   : 400
     - méta    : Plex Mono, capitales espacées */
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
  title: "Aboubacar Tidiane Yattara — Développeur .NET · Lead Dev",
  description:
    "Développeur backend .NET et full-stack Angular, Lead Dev chez Netsen Group. C#, ASP.NET Core, Angular, SQL Server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* `suppressHydrationWarning` est OBLIGATOIRE ici, et uniquement ici :
       next-themes écrit la classe `dark` sur ce <html> depuis un script
       bloquant, donc AVANT que React n'hydrate. Le HTML rendu par le serveur
       et celui que React trouve dans la page diffèrent alors d'une classe, ce
       que React signale comme une erreur. L'alternative — attendre le montage
       pour poser le thème — est précisément ce qui produit l'éclair blanc au
       chargement. L'attribut ne masque la différence que sur cet élément, pas
       sur ses enfants. */
    <html lang="fr" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      {/* La classe `site` porte les règles réservées au public : anneau de
          focus rouge, sélection de texte. L'admin ne les hérite pas. */}
      <body className="site bg-bg text-ink font-sans antialiased">
        {/* `defaultTheme="dark"` avec `enableSystem` : un visiteur qui n'a
            jamais choisi arrive en SOMBRE, pas selon les réglages de sa
            machine. Choix du propriétaire depuis le thème pirate — la barre,
            le capitaine et les icônes en orbite ressortent mieux sur le fond
            sombre. Le réglage « système » reste accessible, il n'est
            simplement pas le point de départ. La console d'admin, elle,
            démarre toujours en clair.

            `disableTransitionOnChange` : sans lui, les `transition-colors`
            posées un peu partout se déclenchent toutes ensemble à la bascule
            et la page fond pendant 200ms au lieu de changer d'état. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
