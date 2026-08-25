import { auth } from "@/lib/auth";

const handlers = auth.handler();

export const GET = handlers.GET;

/* Le relais expose par défaut TOUTES les routes Better Auth, dont l'inscription
   et la réinitialisation de mot de passe. Sur un site à administrateur unique
   c'est une porte ouverte : n'importe qui pourrait créer un compte et remplir
   la base, même si la liste ADMIN_EMAILS l'empêcherait d'atteindre /admin.

   Le compte admin se crée hors application, via `npm run admin:create`, qui
   parle directement au service Neon Auth. Ces routes n'ont donc aucune raison
   d'être joignables ici. */
const BLOCKED_PREFIXES = ["sign-up", "forget-password", "reset-password"];

export async function POST(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;

  if (path?.length && BLOCKED_PREFIXES.includes(path[0])) {
    /* 404 plutôt que 403 : ne pas confirmer que la route existe. */
    return new Response("Not found", { status: 404 });
  }

  return handlers.POST(request, ctx);
}
