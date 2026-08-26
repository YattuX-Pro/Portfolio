import { requireAdmin } from "@/lib/admin-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminUserProvider from "@/components/admin/AdminUserProvider";
import AppSidebar from "@/components/admin/AppSidebar";

/* auth.getSession() lit les cookies : la section doit être rendue
   dynamiquement, jamais mise en cache statiquement. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Vraie barrière : session valide ET e-mail dans ADMIN_EMAILS.
     Le middleware n'a filtré que l'absence de session. */
  const user = await requireAdmin();

  return (
    <AdminUserProvider user={{ email: user.email, name: user.name ?? null }}>
      <SidebarProvider>
        <AppSidebar />
        {/* Le layout ne porte pas d'en-tête : chaque page rend le sien, avec
            son titre et ses actions propres. */}
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AdminUserProvider>
  );
}
