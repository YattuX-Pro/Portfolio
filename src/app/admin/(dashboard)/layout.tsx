import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin/AppSidebar";
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
    <SidebarProvider>
      <AppSidebar email={user.email} />
      {/* Le layout ne porte plus d'en-tête : chaque page rend le sien, avec
          son titre et ses actions propres. */}
      <SidebarInset>{children}</SidebarInset>
      {/* Monté ici et non à la racine : les toasts ne servent qu'à l'admin. */}
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}
