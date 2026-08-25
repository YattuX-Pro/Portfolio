import { auth } from "@/lib/auth";

/* Première barrière : renvoie vers la connexion si aucune session.
   La vérification de la liste blanche ADMIN_EMAILS se fait dans le layout
   de /admin et dans chaque server action — le middleware ne fait que
   filtrer les visiteurs non connectés au plus tôt. */
export default auth.middleware({ loginUrl: "/admin/login" });

export const config = {
  /* Volontairement limité à /admin, et /admin/login explicitement exclu.
     - Le matcher large proposé par la doc ferait passer TOUT le site par le
       middleware : la page publique deviendrait dynamique et perdrait sa
       mise en cache statique.
     - Sans l'exclusion de `login`, le middleware redirigerait la page de
       connexion vers elle-même, en boucle. */
  matcher: ["/admin", "/admin/((?!login).*)"],
};
