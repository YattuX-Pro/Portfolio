import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-guard";
import AdminShell from "./AdminShell";
import { Toaster } from "@/components/ui/sonner";

/* auth.getSession() lit les cookies : la section doit être rendue
   dynamiquement, jamais mise en cache statiquement. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Vraie barrière : session valide ET e-mail dans ADMIN_EMAILS.
     Le middleware n'a filtré que l'absence de session. */
  const user = await requireAdmin();

  return (
    <>
      <AdminShell email={user.email}>{children}</AdminShell>
      {/* Monté ici et non dans le layout racine : les toasts ne servent
          qu'à l'admin, inutile d'embarquer sonner sur le site public. */}
      <Toaster position="bottom-right" />
    </>
  );
}
