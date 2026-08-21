import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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
    "Portfolio d'Aboubacar Tidiane Yattara, analyste développeur. .NET, C#, Angular, Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
