import type { Metadata } from "next";

/* Layout parent volontairement sans garde : /admin/login vit ici aussi.
   Le garde est dans (dashboard)/layout.tsx — s'il était à ce niveau, la
   page de connexion redirigerait vers elle-même à l'infini. */
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
