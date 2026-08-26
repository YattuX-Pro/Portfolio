"use client";

import { createContext, useContext } from "react";

export type AdminUserInfo = { email: string; name: string | null };

const AdminUserContext = createContext<AdminUserInfo | null>(null);

/* La session est lue côté serveur, dans le layout du tableau de bord. Le
   bandeau et son menu de compte sont eux des composants client : ce contexte
   est le passe-plat entre les deux, pour ne pas faire descendre l'e-mail
   dans les props de chaque page. */
export default function AdminUserProvider({
  user,
  children,
}: {
  user: AdminUserInfo;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>
  );
}

export function useAdminUser(): AdminUserInfo {
  const ctx = useContext(AdminUserContext);
  if (!ctx) {
    throw new Error(
      "useAdminUser doit être utilisé à l'intérieur de <AdminUserProvider>",
    );
  }
  return ctx;
}
