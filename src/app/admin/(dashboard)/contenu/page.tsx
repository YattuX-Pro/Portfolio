import { redirect } from "next/navigation";

/* /admin/contenu n'a pas de vue propre : il redirige vers le premier onglet,
   qui garde ainsi sa propre URL partageable. */
export default function ContenuIndex() {
  redirect("/admin/contenu/competences");
}
