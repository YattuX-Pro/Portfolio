import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
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
  title: "Aboubacar Tidiane Yattara — Analyste Développeur",
  description:
    "Portfolio d'Aboubacar Tidiane Yattara, analyste développeur. .NET, FastAPI, Angular, Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      {/* La classe `site` porte les règles réservées au public : anneau de
          focus rouge, sélection de texte. L'admin ne les hérite pas. */}
      <body className="site bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
